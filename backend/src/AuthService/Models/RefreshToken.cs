using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Models;

[Table("refresh_tokens")]
public class RefreshToken
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [Column("user_id")]
    public long UserId { get; set; }

    [Required]
    [Column("organization_id")]
    public long OrganizationId { get; set; }

    [Required]
    [Column("token", TypeName = "varchar(500)")]
    public string Token { get; set; } = null!;

    [Required]
    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("revoked_at")]
    public DateTime? RevokedAt { get; set; }

    [Column("revoked_reason", TypeName = "varchar(255)")]
    public string? RevokedReason { get; set; }

    [Column("ip_address", TypeName = "varchar(45)")]
    public string? IpAddress { get; set; }

    [Column("user_agent", TypeName = "text")]
    public string? UserAgent { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ApplicationUser? User { get; set; }
}
