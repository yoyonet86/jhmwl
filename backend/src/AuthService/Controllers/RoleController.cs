using Jhm.LogisticsSafetyPlatform.AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Controllers;

[ApiController]
[Route("api/v1/roles")]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRolePermissionService _roleService;
    private readonly ILogger<RoleController> _logger;

    public RoleController(IRolePermissionService roleService, ILogger<RoleController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRoles([FromQuery] long? organizationId = null)
    {
        try
        {
            var roles = await _roleService.GetAllRolesAsync(organizationId);
            return Ok(new { roles = roles });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all roles");
            return StatusCode(500, new { message = "Error retrieving roles" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(long id)
    {
        try
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            return Ok(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by id: {RoleId}", id);
            return StatusCode(500, new { message = "Error retrieving role" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var role = await _roleService.CreateRoleAsync(
                request.Name,
                request.Code,
                request.Description,
                request.OrganizationId,
                request.IsSystemRole);

            return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation error creating role");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new { message = "Error creating role" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateRole(long id, [FromBody] UpdateRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var success = await _roleService.UpdateRoleAsync(id, request.Name, request.Description);
            if (!success)
            {
                return NotFound(new { message = "Role not found" });
            }

            return Ok(new { message = "Role updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role: {RoleId}", id);
            return StatusCode(500, new { message = "Error updating role" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteRole(long id)
    {
        try
        {
            var success = await _roleService.DeleteRoleAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Role not found" });
            }

            return Ok(new { message = "Role deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role: {RoleId}", id);
            return StatusCode(500, new { message = "Error deleting role" });
        }
    }

    [HttpPost("{roleId}/users/{userId}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> AssignRoleToUser(long roleId, long userId, [FromQuery] long organizationId)
    {
        try
        {
            var success = await _roleService.AssignRoleToUserAsync(userId, roleId, organizationId);
            if (!success)
            {
                return BadRequest(new { message = "Failed to assign role" });
            }

            return Ok(new { message = "Role assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning role: RoleId={RoleId}, UserId={UserId}", roleId, userId);
            return StatusCode(500, new { message = "Error assigning role" });
        }
    }

    [HttpDelete("{roleId}/users/{userId}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> RemoveRoleFromUser(long roleId, long userId)
    {
        try
        {
            var success = await _roleService.RemoveRoleFromUserAsync(userId, roleId);
            if (!success)
            {
                return BadRequest(new { message = "Failed to remove role" });
            }

            return Ok(new { message = "Role removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing role: RoleId={RoleId}, UserId={UserId}", roleId, userId);
            return StatusCode(500, new { message = "Error removing role" });
        }
    }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public long? OrganizationId { get; set; }
    public bool IsSystemRole { get; set; }
}

public class UpdateRoleRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
