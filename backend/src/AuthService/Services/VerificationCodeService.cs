using Jhm.LogisticsSafetyPlatform.AuthService.Data;
using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Services;

public interface IVerificationCodeService
{
    Task<string> GenerateAndSendCodeAsync(string phone, string codeType = "LOGIN");
    Task<bool> VerifyCodeAsync(string phone, string code, string codeType = "LOGIN");
    Task<VerificationCode?> GetValidCodeAsync(string phone, string codeType = "LOGIN");
    Task InvalidateCodeAsync(long codeId);
}

public class VerificationCodeService : IVerificationCodeService
{
    private readonly AuthDbContext _context;
    private readonly ILogger<VerificationCodeService> _logger;

    public VerificationCodeService(AuthDbContext context, ILogger<VerificationCodeService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<string> GenerateAndSendCodeAsync(string phone, string codeType = "LOGIN")
    {
        try
        {
            // Generate 6-digit code
            var code = GenerateRandomCode(6);

            // Check if there's an existing valid code
            var existingCode = await _context.VerificationCodes
                .Where(vc => vc.Phone == phone && vc.CodeType == codeType && vc.VerifiedAt == null)
                .OrderByDescending(vc => vc.CreatedAt)
                .FirstOrDefaultAsync();

            if (existingCode != null)
            {
                // Invalidate existing code
                existingCode.VerifiedAt = DateTime.UtcNow;
                _context.VerificationCodes.Update(existingCode);
            }

            // Create new verification code
            var verificationCode = new VerificationCode
            {
                Phone = phone,
                Code = code,
                CodeType = codeType,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                AttemptCount = 0
            };

            _context.VerificationCodes.Add(verificationCode);
            await _context.SaveChangesAsync();

            // TODO: Send SMS with code
            // For now, log it
            _logger.LogInformation("Verification code {Code} generated for phone {Phone}, type {CodeType}", code, phone, codeType);

            return code;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating verification code for phone {Phone}", phone);
            throw;
        }
    }

    public async Task<bool> VerifyCodeAsync(string phone, string code, string codeType = "LOGIN")
    {
        try
        {
            var verificationCode = await GetValidCodeAsync(phone, codeType);

            if (verificationCode == null)
            {
                _logger.LogWarning("Invalid verification code for phone {Phone}", phone);
                return false;
            }

            if (verificationCode.Code != code)
            {
                verificationCode.AttemptCount++;

                // Invalidate after 3 failed attempts
                if (verificationCode.AttemptCount >= 3)
                {
                    verificationCode.VerifiedAt = DateTime.UtcNow;
                    _logger.LogWarning("Verification code invalidated after 3 failed attempts for phone {Phone}", phone);
                }

                _context.VerificationCodes.Update(verificationCode);
                await _context.SaveChangesAsync();

                return false;
            }

            // Mark as verified
            verificationCode.VerifiedAt = DateTime.UtcNow;
            _context.VerificationCodes.Update(verificationCode);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Verification code verified for phone {Phone}", phone);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying code for phone {Phone}", phone);
            throw;
        }
    }

    public async Task<VerificationCode?> GetValidCodeAsync(string phone, string codeType = "LOGIN")
    {
        return await _context.VerificationCodes
            .Where(vc => vc.Phone == phone &&
                   vc.CodeType == codeType &&
                   vc.VerifiedAt == null &&
                   vc.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(vc => vc.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task InvalidateCodeAsync(long codeId)
    {
        try
        {
            var code = await _context.VerificationCodes.FindAsync(codeId);
            if (code != null)
            {
                code.VerifiedAt = DateTime.UtcNow;
                _context.VerificationCodes.Update(code);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating code {CodeId}", codeId);
            throw;
        }
    }

    private string GenerateRandomCode(int length)
    {
        var random = new Random();
        var code = "";
        for (int i = 0; i < length; i++)
        {
            code += random.Next(0, 10).ToString();
        }
        return code;
    }
}
