using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.AspNetCore.Identity;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Services;

public interface IDatabaseSeederService
{
    Task SeedAsync();
}

public class DatabaseSeederService : IDatabaseSeederService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<DatabaseSeederService> _logger;

    public DatabaseSeederService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger<DatabaseSeederService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Starting database seeding...");

            // Seed default roles
            await SeedDefaultRoles();

            // Seed default admin user
            await SeedDefaultAdminUser();

            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database seeding");
            throw;
        }
    }

    private async Task SeedDefaultRoles()
    {
        var roles = new[]
        {
            new { Name = "Platform Administrator", Code = "ADMIN", IsSystem = true, Level = 100 },
            new { Name = "Logistics Manager", Code = "MANAGER", IsSystem = true, Level = 50 },
            new { Name = "Dispatcher", Code = "DISPATCHER", IsSystem = true, Level = 30 },
            new { Name = "Driver", Code = "DRIVER", IsSystem = true, Level = 10 },
            new { Name = "Employee", Code = "EMPLOYEE", IsSystem = true, Level = 5 }
        };

        foreach (var roleData in roles)
        {
            var roleExists = await _roleManager.RoleExistsAsync(roleData.Name);
            if (!roleExists)
            {
                var role = new ApplicationRole
                {
                    Name = roleData.Name,
                    NormalizedName = roleData.Name.ToUpper(),
                    Code = roleData.Code,
                    IsSystemRole = roleData.IsSystem,
                    Level = roleData.Level,
                    Description = $"System role: {roleData.Name}"
                };

                var result = await _roleManager.CreateAsync(role);
                if (result.Succeeded)
                {
                    _logger.LogInformation("Created role: {RoleName}", roleData.Name);
                }
                else
                {
                    _logger.LogWarning("Failed to create role {RoleName}: {Errors}", 
                        roleData.Name, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private async Task SeedDefaultAdminUser()
    {
        const string adminUsername = "admin";
        const string adminEmail = "admin@logisticssafety.local";
        const string adminPassword = "AdminP@ssw0rd123";
        const long platformOrgId = 1; // Platform organization ID

        var adminUserExists = await _userManager.FindByNameAsync(adminUsername);
        if (adminUserExists != null)
        {
            _logger.LogInformation("Default admin user already exists");
            return;
        }

        var adminUser = new ApplicationUser
        {
            UserName = adminUsername,
            Email = adminEmail,
            EmailConfirmed = true,
            OrganizationId = platformOrgId,
            FirstName = "System",
            LastName = "Administrator",
            UserType = "ADMIN",
            Status = "ACTIVE",
            LanguagePreference = "zh",
            Timezone = "Asia/Shanghai"
        };

        var result = await _userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            var adminRole = await _roleManager.FindByNameAsync("Platform Administrator");
            if (adminRole != null)
            {
                await _userManager.AddToRoleAsync(adminUser, adminRole.Name ?? "");
                _logger.LogInformation("Created default admin user with Platform Administrator role");
            }
            else
            {
                _logger.LogWarning("Could not assign Platform Administrator role to admin user - role not found");
            }
        }
        else
        {
            _logger.LogWarning("Failed to create default admin user: {Errors}", 
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}
