using Jhm.LogisticsSafetyPlatform.AuthService.Data;
using Jhm.LogisticsSafetyPlatform.AuthService.Models;
using Jhm.LogisticsSafetyPlatform.AuthService.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Jhm.LogisticsSafetyPlatform.AuthService.Tests.Services;

public class AuthenticationServiceTests
{
    private readonly AuthDbContext _dbContext;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<RoleManager<ApplicationRole>> _roleManagerMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<AuthenticationService>> _loggerMock;
    private readonly AuthenticationService _authService;

    public AuthenticationServiceTests()
    {
        // Create in-memory database
        var options = new DbContextOptionsBuilder<AuthDbContext>()
            .UseInMemoryDatabase(databaseName: $"test_db_{Guid.NewGuid()}")
            .Options;

        _dbContext = new AuthDbContext(options);

        // Setup mocks
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            new Mock<IUserStore<ApplicationUser>>().Object,
            null, null, null, null, null, null, null, null);

        _roleManagerMock = new Mock<RoleManager<ApplicationRole>>(
            new Mock<IRoleStore<ApplicationRole>>().Object,
            null, null, null, null);

        _configurationMock = new Mock<IConfiguration>();
        _configurationMock
            .Setup(x => x["Jwt:SecretKey"])
            .Returns("super-secret-key-that-is-long-enough-for-testing-purposes-minimum-32-characters");
        _configurationMock
            .Setup(x => x["Jwt:Issuer"])
            .Returns("TestAuthService");
        _configurationMock
            .Setup(x => x["Jwt:Audience"])
            .Returns("TestAudience");
        _configurationMock
            .Setup(x => x["Jwt:ExpirationMinutes"])
            .Returns("60");

        _loggerMock = new Mock<ILogger<AuthenticationService>>();

        _authService = new AuthenticationService(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            _dbContext,
            _configurationMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccessfulLoginResult()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = 1,
            UserName = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            OrganizationId = 1,
            Status = "ACTIVE"
        };

        _userManagerMock
            .Setup(x => x.FindByNameAsync("testuser"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "password123"))
            .ReturnsAsync(true);

        _userManagerMock
            .Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "ADMIN" });

        _userManagerMock
            .Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _authService.LoginAsync("testuser", "password123", "127.0.0.1", "TestAgent");

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.NotNull(result.User);
        Assert.Equal("testuser", result.User.Username);
    }

    [Fact]
    public async Task Login_WithInvalidUsername_ReturnsFailed()
    {
        // Arrange
        _userManagerMock
            .Setup(x => x.FindByNameAsync("nonexistent"))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _authService.LoginAsync("nonexistent", "password123", "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid username or password", result.Message);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsFailed()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = 1,
            UserName = "testuser",
            Email = "test@example.com",
            OrganizationId = 1,
            Status = "ACTIVE",
            FailedLoginAttempts = 0
        };

        _userManagerMock
            .Setup(x => x.FindByNameAsync("testuser"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "wrongpassword"))
            .ReturnsAsync(false);

        _userManagerMock
            .Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _authService.LoginAsync("testuser", "wrongpassword", "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid username or password", result.Message);
    }

    [Fact]
    public async Task Login_WithDeletedUser_ReturnsFailed()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = 1,
            UserName = "deleteduser",
            DeletedAt = DateTime.UtcNow.AddDays(-1)
        };

        _userManagerMock
            .Setup(x => x.FindByNameAsync("deleteduser"))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync("deleteduser", "password123", "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User account is deleted", result.Message);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsNewTokens()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = 1,
            UserName = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            OrganizationId = 1
        };

        var oldToken = "old-refresh-token";
        var refreshTokenEntity = new RefreshToken
        {
            Id = 1,
            UserId = 1,
            OrganizationId = 1,
            Token = oldToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = "127.0.0.1"
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();

        _userManagerMock
            .Setup(x => x.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "ADMIN" });

        // Act
        var result = await _authService.RefreshTokenAsync(oldToken, 1, "127.0.0.1");

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.NotEqual(oldToken, result.RefreshToken);
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ReturnsFailed()
    {
        // Arrange
        var expiredToken = "expired-token";
        var refreshTokenEntity = new RefreshToken
        {
            Id = 1,
            UserId = 1,
            OrganizationId = 1,
            Token = expiredToken,
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired
            IpAddress = "127.0.0.1"
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _authService.RefreshTokenAsync(expiredToken, 1, "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Refresh token has expired", result.Message);
    }

    [Fact]
    public async Task RevokeToken_WithValidToken_RevokesSuccessfully()
    {
        // Arrange
        var token = "token-to-revoke";
        var refreshTokenEntity = new RefreshToken
        {
            Id = 1,
            UserId = 1,
            OrganizationId = 1,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = "127.0.0.1"
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _authService.RevokeTokenAsync(token, "User logout");

        // Assert
        Assert.True(result);
        var revokedToken = await _dbContext.RefreshTokens.FindAsync(1L);
        Assert.NotNull(revokedToken?.RevokedAt);
    }

    [Fact]
    public async Task GenerateAccessToken_CreatesValidToken()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = 1,
            UserName = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            OrganizationId = 1,
            UserType = "ADMIN"
        };

        var roles = new List<string> { "ADMIN" };
        var permissions = new List<string> { "read:all", "write:all" };

        // Act
        var token = _authService.GenerateAccessToken(user, roles, permissions);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        Assert.StartsWith("eyJ", token); // JWT header starts with this
    }
}
