using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Jhm.LogisticsSafetyPlatform.AuthService.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Tests.Services;

public class RolePermissionServiceTests
{
    private readonly Mock<RoleManager<ApplicationRole>> _roleManagerMock;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ILogger<RolePermissionService>> _loggerMock;
    private readonly RolePermissionService _roleService;

    public RolePermissionServiceTests()
    {
        _roleManagerMock = new Mock<RoleManager<ApplicationRole>>(
            new Mock<IRoleStore<ApplicationRole>>().Object,
            null, null, null, null);

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            new Mock<IUserStore<ApplicationUser>>().Object,
            null, null, null, null, null, null, null, null);

        _loggerMock = new Mock<ILogger<RolePermissionService>>();

        _roleService = new RolePermissionService(
            _roleManagerMock.Object,
            _userManagerMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task CreateRole_WithValidData_CreatesRole()
    {
        // Arrange
        var role = new ApplicationRole
        {
            Id = 1,
            Name = "TestRole",
            Code = "TEST_ROLE"
        };

        _roleManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<ApplicationRole>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _roleService.CreateRoleAsync("TestRole", "TEST_ROLE");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("TestRole", result.Name);
        Assert.Equal("TEST_ROLE", result.Code);
        _roleManagerMock.Verify(x => x.CreateAsync(It.IsAny<ApplicationRole>()), Times.Once);
    }

    [Fact]
    public async Task GetRoleById_WithValidId_ReturnsRole()
    {
        // Arrange
        var role = new ApplicationRole { Id = 1, Name = "TestRole", Code = "TEST_ROLE" };

        _roleManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(role);

        // Act
        var result = await _roleService.GetRoleByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("TestRole", result.Name);
        _roleManagerMock.Verify(x => x.FindByIdAsync("1"), Times.Once);
    }

    [Fact]
    public async Task GetRoleById_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _roleManagerMock
            .Setup(x => x.FindByIdAsync("999"))
            .ReturnsAsync((ApplicationRole?)null);

        // Act
        var result = await _roleService.GetRoleByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateRole_WithValidData_UpdatesRole()
    {
        // Arrange
        var role = new ApplicationRole
        {
            Id = 1,
            Name = "OldName",
            Code = "TEST_ROLE"
        };

        _roleManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(role);

        _roleManagerMock
            .Setup(x => x.UpdateAsync(It.IsAny<ApplicationRole>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _roleService.UpdateRoleAsync(1, "NewName", "Updated description");

        // Assert
        Assert.True(result);
        Assert.Equal("NewName", role.Name);
        Assert.Equal("Updated description", role.Description);
    }

    [Fact]
    public async Task DeleteRole_WithValidId_DeletesRole()
    {
        // Arrange
        var role = new ApplicationRole { Id = 1, Name = "TestRole", Code = "TEST_ROLE" };

        _roleManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(role);

        _roleManagerMock
            .Setup(x => x.UpdateAsync(It.IsAny<ApplicationRole>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _roleService.DeleteRoleAsync(1);

        // Assert
        Assert.True(result);
        Assert.NotNull(role.DeletedAt);
    }

    [Fact]
    public async Task AssignRoleToUser_WithValidData_AssignsRole()
    {
        // Arrange
        var user = new ApplicationUser { Id = 1, UserName = "testuser" };
        var role = new ApplicationRole { Id = 1, Name = "TestRole", Code = "TEST_ROLE" };

        _userManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(role);

        _userManagerMock
            .Setup(x => x.IsInRoleAsync(user, "TestRole"))
            .ReturnsAsync(false);

        _userManagerMock
            .Setup(x => x.AddToRoleAsync(user, "TestRole"))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _roleService.AssignRoleToUserAsync(1, 1, 1);

        // Assert
        Assert.True(result);
        _userManagerMock.Verify(x => x.AddToRoleAsync(user, "TestRole"), Times.Once);
    }

    [Fact]
    public async Task RemoveRoleFromUser_WithValidData_RemovesRole()
    {
        // Arrange
        var user = new ApplicationUser { Id = 1, UserName = "testuser" };
        var role = new ApplicationRole { Id = 1, Name = "TestRole", Code = "TEST_ROLE" };

        _userManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(role);

        _userManagerMock
            .Setup(x => x.RemoveFromRoleAsync(user, "TestRole"))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _roleService.RemoveRoleFromUserAsync(1, 1);

        // Assert
        Assert.True(result);
        _userManagerMock.Verify(x => x.RemoveFromRoleAsync(user, "TestRole"), Times.Once);
    }

    [Fact]
    public async Task GetUserRoles_WithValidUser_ReturnsRoles()
    {
        // Arrange
        var user = new ApplicationUser { Id = 1, UserName = "testuser" };
        var roles = new List<string> { "ADMIN", "MANAGER" };

        _userManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(roles);

        // Act
        var result = await _roleService.GetUserRolesAsync(1);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains("ADMIN", result);
        Assert.Contains("MANAGER", result);
    }
}
