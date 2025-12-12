using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Services;

public interface IRolePermissionService
{
    Task<IEnumerable<ApplicationRole>> GetAllRolesAsync(long? organizationId = null);
    Task<ApplicationRole?> GetRoleByIdAsync(long roleId);
    Task<ApplicationRole?> GetRoleByCodeAsync(string code, long? organizationId = null);
    Task<ApplicationRole> CreateRoleAsync(string name, string code, string? description = null, long? organizationId = null, bool isSystemRole = false);
    Task<bool> UpdateRoleAsync(long roleId, string name, string? description);
    Task<bool> DeleteRoleAsync(long roleId);
    Task<bool> AssignRoleToUserAsync(long userId, long roleId, long organizationId);
    Task<bool> RemoveRoleFromUserAsync(long userId, long roleId);
    Task<IList<string>> GetUserRolesAsync(long userId);
}

public class RolePermissionService : IRolePermissionService
{
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<RolePermissionService> _logger;

    public RolePermissionService(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger<RolePermissionService> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<IEnumerable<ApplicationRole>> GetAllRolesAsync(long? organizationId = null)
    {
        try
        {
            var query = _roleManager.Roles.Where(r => r.DeletedAt == null);

            if (organizationId.HasValue)
            {
                query = query.Where(r => r.OrganizationId == organizationId || r.IsSystemRole);
            }

            return await query.OrderBy(r => r.Level).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            throw;
        }
    }

    public async Task<ApplicationRole?> GetRoleByIdAsync(long roleId)
    {
        try
        {
            return await _roleManager.FindByIdAsync(roleId.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by id: {RoleId}", roleId);
            throw;
        }
    }

    public async Task<ApplicationRole?> GetRoleByCodeAsync(string code, long? organizationId = null)
    {
        try
        {
            var query = _roleManager.Roles.Where(r => r.Code == code && r.DeletedAt == null);

            if (organizationId.HasValue)
            {
                query = query.Where(r => r.OrganizationId == organizationId || r.IsSystemRole);
            }

            return await query.FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by code: {Code}", code);
            throw;
        }
    }

    public async Task<ApplicationRole> CreateRoleAsync(string name, string code, string? description = null, long? organizationId = null, bool isSystemRole = false)
    {
        try
        {
            var role = new ApplicationRole
            {
                Name = name,
                NormalizedName = name.ToUpper(),
                Code = code,
                OrganizationId = organizationId,
                IsSystemRole = isSystemRole,
                Description = description ?? ""
            };

            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("Role created: {RoleId} - {RoleName}", role.Id, role.Name);
            return role;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role: {RoleName}", name);
            throw;
        }
    }

    public async Task<bool> UpdateRoleAsync(long roleId, string name, string? description)
    {
        try
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            role.Name = name;
            role.NormalizedName = name.ToUpper();
            if (description != null)
            {
                role.Description = description;
            }
            role.UpdatedAt = DateTime.UtcNow;

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to update role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("Role updated: {RoleId}", roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role: {RoleId}", roleId);
            throw;
        }
    }

    public async Task<bool> DeleteRoleAsync(long roleId)
    {
        try
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            role.DeletedAt = DateTime.UtcNow;
            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to delete role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("Role deleted: {RoleId}", roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role: {RoleId}", roleId);
            throw;
        }
    }

    public async Task<bool> AssignRoleToUserAsync(long userId, long roleId, long organizationId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return false;
            }

            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            var isInRole = await _userManager.IsInRoleAsync(user, role.Name ?? "");
            if (isInRole)
            {
                _logger.LogWarning("User {UserId} already has role {RoleId}", userId, roleId);
                return true;
            }

            var result = await _userManager.AddToRoleAsync(user, role.Name ?? "");
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to assign role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("Role assigned to user: UserId={UserId}, RoleId={RoleId}", userId, roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning role to user: UserId={UserId}, RoleId={RoleId}", userId, roleId);
            throw;
        }
    }

    public async Task<bool> RemoveRoleFromUserAsync(long userId, long roleId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return false;
            }

            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            var result = await _userManager.RemoveFromRoleAsync(user, role.Name ?? "");
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to remove role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("Role removed from user: UserId={UserId}, RoleId={RoleId}", userId, roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing role from user: UserId={UserId}, RoleId={RoleId}", userId, roleId);
            throw;
        }
    }

    public async Task<IList<string>> GetUserRolesAsync(long userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return new List<string>();
            }

            return await _userManager.GetRolesAsync(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user roles: {UserId}", userId);
            throw;
        }
    }
}
