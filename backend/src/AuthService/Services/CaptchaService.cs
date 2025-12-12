using Jhm.LogisticsSafetyPlatform.AuthService.Data;
using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Services;

public interface ICaptchaService
{
    Task<CaptchaChallenge> CreateChallengeAsync(string phone, string ipAddress);
    Task<bool> VerifyChallengeAsync(string challengeKey, string answer);
    Task<CaptchaChallenge?> GetChallengeAsync(string challengeKey);
    Task InvalidateChallengeAsync(string challengeKey);
}

public class CaptchaService : ICaptchaService
{
    private readonly AuthDbContext _context;
    private readonly ILogger<CaptchaService> _logger;

    public CaptchaService(AuthDbContext context, ILogger<CaptchaService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CaptchaChallenge> CreateChallengeAsync(string phone, string ipAddress)
    {
        try
        {
            // Invalidate any existing challenges for this phone
            var existingChallenges = await _context.CaptchaChallenges
                .Where(cc => cc.Phone == phone && cc.VerifiedAt == null)
                .ToListAsync();

            foreach (var challenge in existingChallenges)
            {
                challenge.VerifiedAt = DateTime.UtcNow;
                _context.CaptchaChallenges.Update(challenge);
            }

            // Generate simple math challenge (e.g., "3 + 5 = ?")
            var (question, answer) = GenerateMathChallenge();
            var challengeKey = Guid.NewGuid().ToString("N").Substring(0, 32);

            var challenge = new CaptchaChallenge
            {
                ChallengeKey = challengeKey,
                ChallengeAnswer = answer,
                ChallengeType = "MATH",
                ChallengeImageUrl = question, // Store question text for now
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                Phone = phone,
                IpAddress = ipAddress,
                FailedAttempts = 0
            };

            _context.CaptchaChallenges.Add(challenge);
            await _context.SaveChangesAsync();

            _logger.LogInformation("CAPTCHA challenge created for phone {Phone}", phone);

            return challenge;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CAPTCHA challenge");
            throw;
        }
    }

    public async Task<bool> VerifyChallengeAsync(string challengeKey, string answer)
    {
        try
        {
            var challenge = await GetChallengeAsync(challengeKey);

            if (challenge == null)
            {
                _logger.LogWarning("CAPTCHA challenge not found or expired: {ChallengeKey}", challengeKey);
                return false;
            }

            if (challenge.VerifiedAt.HasValue)
            {
                _logger.LogWarning("CAPTCHA challenge already verified: {ChallengeKey}", challengeKey);
                return false;
            }

            if (challenge.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("CAPTCHA challenge expired: {ChallengeKey}", challengeKey);
                challenge.VerifiedAt = DateTime.UtcNow;
                _context.CaptchaChallenges.Update(challenge);
                await _context.SaveChangesAsync();
                return false;
            }

            // Check answer (case-insensitive, trim whitespace)
            var normalizedAnswer = answer?.Trim().ToLower();
            var normalizedExpected = challenge.ChallengeAnswer?.Trim().ToLower();

            if (normalizedAnswer != normalizedExpected)
            {
                challenge.FailedAttempts++;

                // Invalidate after 3 failed attempts
                if (challenge.FailedAttempts >= 3)
                {
                    challenge.VerifiedAt = DateTime.UtcNow;
                    _logger.LogWarning("CAPTCHA challenge invalidated after 3 failed attempts: {ChallengeKey}", challengeKey);
                }

                _context.CaptchaChallenges.Update(challenge);
                await _context.SaveChangesAsync();

                return false;
            }

            // Mark as verified
            challenge.VerifiedAt = DateTime.UtcNow;
            _context.CaptchaChallenges.Update(challenge);
            await _context.SaveChangesAsync();

            _logger.LogInformation("CAPTCHA challenge verified: {ChallengeKey}", challengeKey);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying CAPTCHA challenge");
            throw;
        }
    }

    public async Task<CaptchaChallenge?> GetChallengeAsync(string challengeKey)
    {
        return await _context.CaptchaChallenges
            .FirstOrDefaultAsync(cc => cc.ChallengeKey == challengeKey);
    }

    public async Task InvalidateChallengeAsync(string challengeKey)
    {
        try
        {
            var challenge = await GetChallengeAsync(challengeKey);
            if (challenge != null)
            {
                challenge.VerifiedAt = DateTime.UtcNow;
                _context.CaptchaChallenges.Update(challenge);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating CAPTCHA challenge");
            throw;
        }
    }

    private (string question, string answer) GenerateMathChallenge()
    {
        var random = new Random();
        var num1 = random.Next(1, 10);
        var num2 = random.Next(1, 10);
        var op = random.Next(0, 2) == 0 ? "+" : "-";

        var answer = op == "+" ? num1 + num2 : num1 - num2;
        var question = $"{num1} {op} {num2}";

        return (question, answer.ToString());
    }
}
