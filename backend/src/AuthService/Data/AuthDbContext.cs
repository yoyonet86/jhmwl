using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Data;

public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, long>
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Identity table names to match existing schema
        modelBuilder.Entity<ApplicationUser>().ToTable("users");
        modelBuilder.Entity<ApplicationRole>().ToTable("roles");
        modelBuilder.Entity<IdentityUserRole<long>>().ToTable("user_roles");
        modelBuilder.Entity<IdentityUserClaim<long>>().ToTable("user_claims");
        modelBuilder.Entity<IdentityUserLogin<long>>().ToTable("user_logins");
        modelBuilder.Entity<IdentityUserToken<long>>().ToTable("user_tokens");
        modelBuilder.Entity<IdentityRoleClaim<long>>().ToTable("role_claims");

        // Configure RefreshToken
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Add indexes
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => new { rt.UserId, rt.Token });

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.ExpiresAt);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.RevokedAt);
    }
}
