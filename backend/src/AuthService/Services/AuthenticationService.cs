using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Jhm.LogisticsSafetyPlatform.AuthService.Data;
using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Services;

public interface IAuthenticationService
{
    Task<LoginResult> LoginWithPhoneAndPasswordAsync(string phone, string password, string captchaKey, string ipAddress, string? userAgent = null);
    Task<LoginResult> LoginWithPhoneAndCodeAsync(string phone, string code, string ipAddress, string? userAgent = null);
    Task<TokenRefreshResult> RefreshTokenAsync(string refreshToken, long userId, string ipAddress, string? userAgent = null);
    Task<bool> RevokeTokenAsync(string refreshToken, string? reason = null);
    Task<UserClaimsResult?> GetUserClaimsAsync(long userId);
    string GenerateAccessToken(ApplicationUser user, IList<string> roles, IList<string> permissions);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly AuthDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        AuthDbContext context,
        IConfiguration configuration,
        ILogger<AuthenticationService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResult> LoginWithPhoneAndPasswordAsync(string phone, string password, string captchaKey, string ipAddress, string? userAgent = null)
    {
        try
        {
            // Verify CAPTCHA challenge first
            var captchaChallenge = await _context.CaptchaChallenges
                .FirstOrDefaultAsync(cc => cc.ChallengeKey == captchaKey);

            if (captchaChallenge == null || captchaChallenge.VerifiedAt == null)
            {
                _logger.LogWarning("CAPTCHA not verified for phone {Phone}", phone);
                return new LoginResult { Success = false, Message = "CAPTCHA verification required" };
            }

            // Find user by phone
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone);

            if (user == null)
            {
                _logger.LogWarning("Login attempt for non-existent phone: {Phone}", phone);
                return new LoginResult { Success = false, Message = "Invalid phone or password" };
            }

            if (user.DeletedAt.HasValue)
            {
                _logger.LogWarning("Login attempt for deleted user: {UserId}", user.Id);
                return new LoginResult { Success = false, Message = "User account is deleted" };
            }

            if (user.Status == "LOCKED")
            {
                if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
                {
                    _logger.LogWarning("Login attempt for locked user: {UserId}", user.Id);
                    return new LoginResult { Success = false, Message = "User account is locked" };
                }
                user.LockedUntil = null;
                user.FailedLoginAttempts = 0;
            }

            if (!await _userManager.CheckPasswordAsync(user, password))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.Status = "LOCKED";
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(30);
                    _logger.LogWarning("User locked due to failed login attempts: {UserId}", user.Id);
                }

                await _userManager.UpdateAsync(user);
                return new LoginResult { Success = false, Message = "Invalid phone or password" };
            }

            return await CompleteLoginAsync(user, "PASSWORD", ipAddress, userAgent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password login for phone: {Phone}", phone);
            throw;
        }
    }

    public async Task<LoginResult> LoginWithPhoneAndCodeAsync(string phone, string code, string ipAddress, string? userAgent = null)
    {
        try
        {
            // Verify verification code
            var verificationCode = await _context.VerificationCodes
                .Where(vc => vc.Phone == phone && 
                             vc.CodeType == "LOGIN" && 
                             vc.VerifiedAt != null &&
                             vc.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(vc => vc.CreatedAt)
                .FirstOrDefaultAsync();

            if (verificationCode == null || verificationCode.Code != code)
            {
                _logger.LogWarning("Invalid verification code for phone {Phone}", phone);
                return new LoginResult { Success = false, Message = "Invalid verification code" };
            }

            // Find or create user by phone
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone);

            if (user == null)
            {
                _logger.LogWarning("User not found for phone: {Phone}", phone);
                return new LoginResult { Success = false, Message = "User not found" };
            }

            if (user.DeletedAt.HasValue)
            {
                _logger.LogWarning("Login attempt for deleted user: {UserId}", user.Id);
                return new LoginResult { Success = false, Message = "User account is deleted" };
            }

            // Invalidate the verification code
            verificationCode.VerifiedAt = DateTime.UtcNow;
            _context.VerificationCodes.Update(verificationCode);
            await _context.SaveChangesAsync();

            return await CompleteLoginAsync(user, "SMS", ipAddress, userAgent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during SMS login for phone: {Phone}", phone);
            throw;
        }
    }

    private async Task<LoginResult> CompleteLoginAsync(ApplicationUser user, string loginMethod, string ipAddress, string? userAgent)
    {
        user.LastLoginAt = DateTime.UtcNow;
        user.LastLoginIp = ipAddress;
        user.LastLoginMethod = loginMethod;
        user.FailedLoginAttempts = 0;
        user.Status = "ACTIVE";
        user.LockedUntil = null;

        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await GetUserPermissionsAsync(user.Id, user.OrganizationId);

        var accessToken = GenerateAccessToken(user, roles, permissions);
        var refreshToken = GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            OrganizationId = user.OrganizationId,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User logged in successfully: {UserId} via {LoginMethod}", user.Id, loginMethod);

        return new LoginResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserResponse
            {
                Id = user.Id,
                Phone = user.PhoneNumber,
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = user.OrganizationId,
                Roles = roles.ToList(),
                Permissions = permissions.ToList()
            }
        };
    }

    public async Task<TokenRefreshResult> RefreshTokenAsync(string refreshToken, long userId, string ipAddress, string? userAgent = null)
    {
        try
        {
            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

            if (storedToken == null)
            {
                _logger.LogWarning("Refresh token not found for user: {UserId}", userId);
                return new TokenRefreshResult { Success = false, Message = "Refresh token not found" };
            }

            if (storedToken.RevokedAt.HasValue)
            {
                _logger.LogWarning("Attempt to use revoked refresh token for user: {UserId}", userId);
                return new TokenRefreshResult { Success = false, Message = "Refresh token has been revoked" };
            }

            if (storedToken.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("Refresh token expired for user: {UserId}", userId);
                return new TokenRefreshResult { Success = false, Message = "Refresh token has expired" };
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.DeletedAt.HasValue)
            {
                _logger.LogWarning("User not found or deleted during token refresh: {UserId}", userId);
                return new TokenRefreshResult { Success = false, Message = "User not found" };
            }

            var roles = await _userManager.GetRolesAsync(user);
            var permissions = await GetUserPermissionsAsync(user.Id, user.OrganizationId);

            var newAccessToken = GenerateAccessToken(user, roles, permissions);
            var newRefreshToken = GenerateRefreshToken();

            // Revoke old token
            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedReason = "Refresh token rotated";

            // Create new token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                OrganizationId = user.OrganizationId,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.RefreshTokens.Update(storedToken);
            _context.RefreshTokens.Add(newRefreshTokenEntity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Token refreshed for user: {UserId}", userId);

            return new TokenRefreshResult
            {
                Success = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken, string? reason = null)
    {
        try
        {
            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null)
            {
                return false;
            }

            if (storedToken.RevokedAt.HasValue)
            {
                return true;
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedReason = reason ?? "User logout";

            _context.RefreshTokens.Update(storedToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Refresh token revoked for user: {UserId}", storedToken.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token");
            throw;
        }
    }

    public async Task<UserClaimsResult?> GetUserClaimsAsync(long userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.DeletedAt.HasValue)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);
            var permissions = await GetUserPermissionsAsync(user.Id, user.OrganizationId);
            var userClaims = await _userManager.GetClaimsAsync(user);

            return new UserClaimsResult
            {
                UserId = user.Id,
                Phone = user.PhoneNumber,
                OrganizationId = user.OrganizationId,
                Roles = roles.ToList(),
                Permissions = permissions.ToList(),
                Claims = userClaims.Select(c => new ClaimInfo { Type = c.Type, Value = c.Value }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user claims for user: {UserId}", userId);
            throw;
        }
    }

    public string GenerateAccessToken(ApplicationUser user, IList<string> roles, IList<string> permissions)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT secret key not configured")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.MobilePhone, user.PhoneNumber ?? ""),
            new("organization_id", user.OrganizationId.ToString()),
            new("user_type", user.UserType),
            new("phone_verified", user.PhoneVerified.ToString().ToLower()),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "AuthService",
            audience: _configuration["Jwt:Audience"] ?? "LogisticsSafetyPlatform",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60")),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task<IList<string>> GetUserPermissionsAsync(long userId, long organizationId)
    {
        // TODO: Query permissions from database based on user roles
        // For now, return empty list
        return new List<string>();
    }
}

public class LoginResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public UserResponse? User { get; set; }
}

public class TokenRefreshResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
}

public class UserResponse
{
    public long Id { get; set; }
    public string? Phone { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public long OrganizationId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

public class UserClaimsResult
{
    public long UserId { get; set; }
    public string? Phone { get; set; }
    public long OrganizationId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<ClaimInfo> Claims { get; set; } = new();
}

public class ClaimInfo
{
    public string Type { get; set; } = null!;
    public string Value { get; set; } = null!;
}
