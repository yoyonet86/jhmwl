using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Models;

[Table("roles")]
public class ApplicationRole : IdentityRole<long>
{
    [Column("organization_id")]
    public long? OrganizationId { get; set; }

    [Column("code", TypeName = "varchar(50)")]
    public string Code { get; set; } = null!;

    [Column("is_system_role")]
    public bool IsSystemRole { get; set; } = false;

    [Column("level")]
    public int Level { get; set; } = 0;

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
