using Jhm.LogisticsSafetyPlatform.AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly IVerificationCodeService _verificationCodeService;
    private readonly ICaptchaService _captchaService;
    private readonly ILogger<AuthenticationController> _logger;

    public AuthenticationController(
        IAuthenticationService authService,
        IVerificationCodeService verificationCodeService,
        ICaptchaService captchaService,
        ILogger<AuthenticationController> logger)
    {
        _authService = authService;
        _verificationCodeService = verificationCodeService;
        _captchaService = captchaService;
        _logger = logger;
    }

    [HttpPost("login/password")]
    public async Task<IActionResult> LoginWithPassword([FromBody] PasswordLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var ipAddress = GetClientIpAddress();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var result = await _authService.LoginWithPhoneAndPasswordAsync(
            request.Phone, request.Password, request.CaptchaKey, ipAddress, userAgent);

        if (!result.Success)
        {
            _logger.LogWarning("Password login failed for phone: {Phone}", request.Phone);
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

    [HttpPost("login/code")]
    public async Task<IActionResult> LoginWithCode([FromBody] CodeLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var ipAddress = GetClientIpAddress();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var result = await _authService.LoginWithPhoneAndCodeAsync(
            request.Phone, request.Code, ipAddress, userAgent);

        if (!result.Success)
        {
            _logger.LogWarning("SMS login failed for phone: {Phone}", request.Phone);
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

    [HttpPost("request-code")]
    public async Task<IActionResult> RequestVerificationCode([FromBody] RequestCodeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var code = await _verificationCodeService.GenerateAndSendCodeAsync(request.Phone, "LOGIN");
            _logger.LogInformation("Verification code sent to phone: {Phone}", request.Phone);

            return Ok(new
            {
                success = true,
                message = "验证码已发送到您的手机",
                expiresIn = 300
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting verification code for phone: {Phone}", request.Phone);
            return StatusCode(500, new { message = "Error requesting verification code" });
        }
    }

    [HttpPost("captcha")]
    public async Task<IActionResult> CreateCaptchaChallenge()
    {
        try
        {
            var ipAddress = GetClientIpAddress();
            var challenge = await _captchaService.CreateChallengeAsync("", ipAddress);

            return Ok(new
            {
                success = true,
                challengeKey = challenge.ChallengeKey,
                challenge = challenge.ChallengeImageUrl,
                expiresIn = 300
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CAPTCHA challenge");
            return StatusCode(500, new { message = "Error creating CAPTCHA challenge" });
        }
    }

    [HttpPost("verify-captcha")]
    public async Task<IActionResult> VerifyCaptcha([FromBody] VerifyCaptchaRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _captchaService.VerifyChallengeAsync(request.ChallengeKey, request.Answer);
            if (!result)
            {
                return BadRequest(new { message = "CAPTCHA verification failed" });
            }

            return Ok(new { success = true, message = "CAPTCHA verified" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying CAPTCHA");
            return StatusCode(500, new { message = "Error verifying CAPTCHA" });
        }
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

public class PasswordLoginRequest
{
    public string Phone { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string CaptchaKey { get; set; } = null!;
}

public class CodeLoginRequest
{
    public string Phone { get; set; } = null!;
    public string Code { get; set; } = null!;
}

public class RequestCodeRequest
{
    public string Phone { get; set; } = null!;
}

public class VerifyCaptchaRequest
{
    public string ChallengeKey { get; set; } = null!;
    public string Answer { get; set; } = null!;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}

public class LogoutRequest
{
    public string RefreshToken { get; set; } = null!;
}
