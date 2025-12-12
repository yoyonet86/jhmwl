using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Models;

[Table("captcha_challenges")]
public class CaptchaChallenge
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [Column("challenge_key", TypeName = "varchar(100)")]
    public string ChallengeKey { get; set; } = null!;

    [Required]
    [Column("challenge_answer", TypeName = "varchar(100)")]
    public string ChallengeAnswer { get; set; } = null!;

    [Required]
    [Column("challenge_type", TypeName = "varchar(50)")]
    public string ChallengeType { get; set; } = "IMAGE";

    [Column("challenge_image_url", TypeName = "text")]
    public string? ChallengeImageUrl { get; set; }

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("verified_at")]
    public DateTime? VerifiedAt { get; set; }

    [Column("failed_attempts")]
    public int FailedAttempts { get; set; } = 0;

    [Column("phone", TypeName = "varchar(20)")]
    public string? Phone { get; set; }

    [Column("ip_address", TypeName = "varchar(45)")]
    public string? IpAddress { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
