using Jhm.LogisticsSafetyPlatform.AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly ILogger<AuthenticationController> _logger;

    public AuthenticationController(IAuthenticationService authService, ILogger<AuthenticationController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var ipAddress = GetClientIpAddress();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var result = await _authService.LoginAsync(request.Username, request.Password, ipAddress, userAgent);

        if (!result.Success)
        {
            _logger.LogWarning("Login failed for username: {Username}", request.Username);
            return Unauthorized(new { message = result.Message });
        }

        return Ok(new
        {
            success = true,
            accessToken = result.AccessToken,
            refreshToken = result.RefreshToken,
            user = result.User
        });
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        if (!long.TryParse(userIdClaim?.Value, out var userId))
        {
            return Unauthorized();
        }

        var ipAddress = GetClientIpAddress();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, userId, ipAddress, userAgent);

        if (!result.Success)
        {
            _logger.LogWarning("Token refresh failed for user: {UserId}", userId);
            return Unauthorized(new { message = result.Message });
        }

        return Ok(new
        {
            success = true,
            accessToken = result.AccessToken,
            refreshToken = result.RefreshToken
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.RevokeTokenAsync(request.RefreshToken, "User logout");

        return Ok(new { success = result });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        if (!long.TryParse(userIdClaim?.Value, out var userId))
        {
            return Unauthorized();
        }

        var result = await _authService.GetUserClaimsAsync(userId);
        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    private string GetClientIpAddress()
    {
        var forwardedForHeader = Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrEmpty(forwardedForHeader))
        {
            return forwardedForHeader.Split(',').First().Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}

public class LogoutRequest
{
    public string RefreshToken { get; set; } = null!;
}
