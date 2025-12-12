using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Models;

[Table("users")]
public class ApplicationUser : IdentityUser<long>
{
    [Required]
    [Column("organization_id")]
    public long OrganizationId { get; set; }

    [Required]
    [Column("phone", TypeName = "varchar(20)")]
    public string? Phone { get; set; }

    [Required]
    [Column("first_name", TypeName = "varchar(100)")]
    public string? FirstName { get; set; }

    [Required]
    [Column("last_name", TypeName = "varchar(100)")]
    public string? LastName { get; set; }

    [Column("user_type", TypeName = "varchar(50)")]
    public string UserType { get; set; } = "EMPLOYEE";

    [Column("status", TypeName = "varchar(50)")]
    public string Status { get; set; } = "PENDING";

    [Column("phone_verified")]
    public bool PhoneVerified { get; set; } = false;

    [Column("last_login_at")]
    public DateTime? LastLoginAt { get; set; }

    [Column("last_login_ip", TypeName = "varchar(45)")]
    public string? LastLoginIp { get; set; }

    [Column("last_login_method", TypeName = "varchar(20)")]
    public string? LastLoginMethod { get; set; }

    [Column("failed_login_attempts")]
    public int FailedLoginAttempts { get; set; } = 0;

    [Column("locked_until")]
    public DateTime? LockedUntil { get; set; }

    [Column("password_reset_token", TypeName = "varchar(255)")]
    public string? PasswordResetToken { get; set; }

    [Column("password_reset_expires_at")]
    public DateTime? PasswordResetExpiresAt { get; set; }

    [Column("language_preference", TypeName = "varchar(10)")]
    public string LanguagePreference { get; set; } = "zh";

    [Column("timezone", TypeName = "varchar(50)")]
    public string Timezone { get; set; } = "Asia/Shanghai";

    [Column("avatar_url", TypeName = "varchar(500)")]
    public string? AvatarUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    public long? CreatedByUserId { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_by_user_id")]
    public long? UpdatedByUserId { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("version")]
    public int Version { get; set; } = 1;
}
