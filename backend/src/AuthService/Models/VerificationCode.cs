using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Models;

[Table("verification_codes")]
public class VerificationCode
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [Column("phone", TypeName = "varchar(20)")]
    public string Phone { get; set; } = null!;

    [Column("user_id")]
    public long? UserId { get; set; }

    [Required]
    [Column("code", TypeName = "varchar(10)")]
    public string Code { get; set; } = null!;

    [Required]
    [Column("code_type", TypeName = "varchar(50)")]
    public string CodeType { get; set; } = "LOGIN";

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("verified_at")]
    public DateTime? VerifiedAt { get; set; }

    [Column("attempt_count")]
    public int AttemptCount { get; set; } = 0;

    [Column("ip_address", TypeName = "varchar(45)")]
    public string? IpAddress { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ApplicationUser? User { get; set; }
}
