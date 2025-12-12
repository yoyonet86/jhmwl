# Authentication Integration Guide

This guide explains how other services in the platform should integrate with the AuthService for token validation and claims extraction.

## Overview

The AuthService is the central authentication provider. All other services must:
1. Accept JWT tokens issued by AuthService
2. Validate tokens using the public key or shared secret
3. Extract user context from token claims
4. Implement service-level authorization policies

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Application                       │
└────────────────┬─────────────────────────────────────────────┘
                 │
        1. POST /api/v1/auth/login
        2. Receive JWT + Refresh Token
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                      AuthService                             │
│  - Validate credentials                                      │
│  - Issue JWT tokens                                          │
│  - Manage refresh tokens                                     │
│  - Provide key endpoint for token validation                 │
└────────────────┬─────────────────────────────────────────────┘
                 │
        3. Every request includes JWT
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                   Other Services                             │
│  - Receive JWT in Authorization header                       │
│  - Validate token signature                                  │
│  - Extract claims for context                                │
│  - Apply local authorization policies                        │
└──────────────────────────────────────────────────────────────┘
```

## Token Structure

### JWT Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### JWT Payload
```json
{
  "sub": "1",
  "name": "john_doe",
  "email": "john@example.com",
  "organization_id": "5",
  "user_type": "MANAGER",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": [
    "MANAGER",
    "DISPATCHER"
  ],
  "permission": [
    "order:read",
    "order:create",
    "vehicle:read"
  ],
  "iat": 1704067200,
  "exp": 1704070800,
  "iss": "AuthService",
  "aud": "LogisticsSafetyPlatform"
}
```

### Claims Reference

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string | User ID (subject) |
| `name` | string | Username |
| `email` | string | User email |
| `organization_id` | string | Organization/tenant ID |
| `user_type` | string | User type (ADMIN, MANAGER, DRIVER, EMPLOYEE) |
| `role` | string[] | Array of role names |
| `permission` | string[] | Array of permission codes |
| `iat` | number | Token issued at (Unix timestamp) |
| `exp` | number | Token expiration (Unix timestamp) |
| `iss` | string | Token issuer |
| `aud` | string | Token audience |

## Implementation Steps

### Step 1: Configure JWT Authentication

Add JWT authentication to your service's `Program.cs`:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Get JWT configuration
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] 
    ?? throw new InvalidOperationException("JWT secret key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AuthService";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LogisticsSafetyPlatform";

var key = Encoding.ASCII.GetBytes(jwtSecretKey);

// Configure authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Step 2: Update appsettings.json

```json
{
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-characters-long-matches-authservice",
    "Issuer": "AuthService",
    "Audience": "LogisticsSafetyPlatform"
  }
}
```

**Important**: The secret key MUST match the key configured in AuthService.

### Step 3: Add Authorization Attributes to Controllers

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/orders")]
[Authorize]  // Require authentication for all endpoints
public class OrderController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult GetOrder(long id)
    {
        // Token is validated automatically due to [Authorize]
        var userId = User.FindFirst("sub")?.Value;
        var organizationId = User.FindFirst("organization_id")?.Value;
        
        // Implementation here
        return Ok();
    }

    [HttpPost]
    [Authorize(Roles = "MANAGER,DISPATCHER")]  // Role-based authorization
    public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
    {
        // Only MANAGER or DISPATCHER can create orders
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "CanDeleteOrders")]  // Custom policy
    public IActionResult DeleteOrder(long id)
    {
        return Ok();
    }
}
```

### Step 4: Extract Claims for Context

```csharp
public class OrderController : ControllerBase
{
    [HttpGet]
    [Authorize]
    public IActionResult GetMyOrders()
    {
        // Extract user context from token
        var userId = long.Parse(User.FindFirst("sub")?.Value ?? "0");
        var organizationId = long.Parse(User.FindFirst("organization_id")?.Value ?? "0");
        var userRoles = User.FindAll("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
            .Select(c => c.Value)
            .ToList();
        var permissions = User.FindAll("permission")
            .Select(c => c.Value)
            .ToList();

        // Use for business logic
        if (!permissions.Contains("order:read"))
        {
            return Forbid("Insufficient permissions");
        }

        // Get orders for user's organization
        return Ok();
    }
}
```

## Custom Authorization Policies

Define custom authorization policies for fine-grained control:

```csharp
// In Program.cs
builder.Services.AddAuthorization(options =>
{
    // Permission-based policy
    options.AddPolicy("CanManageOrders", policy =>
        policy.RequireClaim("permission", 
            "order:read", "order:create", "order:update", "order:delete"));

    // Role-based policy
    options.AddPolicy("IsManager", policy =>
        policy.RequireRole("MANAGER"));

    // Custom requirement
    options.AddPolicy("SameOrganization", policy =>
        policy.Requirements.Add(new SameOrganizationRequirement()));

    // Multiple requirements (AND logic)
    options.AddPolicy("ManagerInOrg", policy =>
        policy
            .RequireRole("MANAGER")
            .RequireClaim("organization_id"));
});

// Implement custom requirement
public class SameOrganizationRequirement : IAuthorizationRequirement { }

public class SameOrganizationHandler : AuthorizationHandler<SameOrganizationRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SameOrganizationRequirement requirement)
    {
        var userOrgId = context.User.FindFirst("organization_id")?.Value;
        var resourceOrgId = context.Resource as string; // Extract from request

        if (userOrgId == resourceOrgId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

## Common Patterns

### 1. Multi-Tenant Data Isolation

```csharp
public class OrderRepository
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrderRepository(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<Order>> GetOrdersAsync()
    {
        // Extract organization from token
        var orgId = long.Parse(
            _httpContextAccessor.HttpContext?.User
                .FindFirst("organization_id")?.Value ?? "0");

        // Only fetch orders for this organization
        return await _dbContext.Orders
            .Where(o => o.OrganizationId == orgId)
            .ToListAsync();
    }
}
```

### 2. Permission Checks in Business Logic

```csharp
public class OrderService
{
    public async Task<bool> CanUserCreateOrder(ClaimsPrincipal user)
    {
        var permissions = user.FindAll("permission")
            .Select(c => c.Value)
            .ToList();

        return permissions.Contains("order:create");
    }

    public async Task CreateOrderAsync(Order order, ClaimsPrincipal user)
    {
        if (!await CanUserCreateOrder(user))
        {
            throw new UnauthorizedAccessException("User cannot create orders");
        }

        // Create order
    }
}
```

### 3. Service-to-Service Communication

For backend service communication, include the service-level bearer token:

```csharp
public class OrderServiceClient
{
    private readonly HttpClient _httpClient;

    public async Task<OrderDto> GetOrderAsync(long orderId, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"https://order-service/api/v1/orders/{orderId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsAsync<OrderDto>();
    }
}
```

### 4. Logging User Context

```csharp
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User.FindFirst("sub")?.Value;
        var organizationId = context.User.FindFirst("organization_id")?.Value;

        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["UserId"] = userId ?? "anonymous",
            ["OrganizationId"] = organizationId ?? "unknown"
        });

        await _next(context);
    }
}

// Register in Program.cs
app.UseMiddleware<LoggingMiddleware>();
```

## Error Handling

### Unauthorized (401)
```json
{
  "message": "Unauthorized",
  "details": "Token is invalid or expired"
}
```

**Actions:**
- Client should redirect to login
- Refresh token if available
- Prompt user to re-authenticate

### Forbidden (403)
```json
{
  "message": "Forbidden",
  "details": "User does not have permission to access this resource"
}
```

**Actions:**
- Return error to user
- Log the attempt
- Check authorization policies

## Testing

### Unit Test Example

```csharp
[TestClass]
public class OrderControllerTests
{
    private readonly Mock<IOrderService> _orderServiceMock;
    private readonly OrderController _controller;

    [TestInitialize]
    public void Setup()
    {
        _orderServiceMock = new Mock<IOrderService>();
        _controller = new OrderController(_orderServiceMock.Object);

        // Mock user claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new("organization_id", "5"),
            new(ClaimTypes.Role, "MANAGER"),
            new("permission", "order:read")
        };

        var identity = new ClaimsIdentity(claims, "TestScheme");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [TestMethod]
    public async Task GetOrder_WithValidId_ReturnsOrder()
    {
        // Arrange
        var orderId = 1L;
        var expectedOrder = new OrderDto { Id = orderId, /* ... */ };

        _orderServiceMock
            .Setup(x => x.GetOrderAsync(orderId))
            .ReturnsAsync(expectedOrder);

        // Act
        var result = await _controller.GetOrder(orderId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(expectedOrder, okResult.Value);
    }
}
```

## Troubleshooting

### Token Validation Fails

**Problem**: 401 Unauthorized on all requests

**Check:**
1. JWT secret key matches AuthService
2. Token has not expired
3. Token format is correct (`Bearer <token>`)
4. Issuer and audience match configuration

```bash
# Decode token to inspect claims (use jwt.io or similar)
# Check token structure and claims
```

### Claims Not Available

**Problem**: `User.FindFirst("claim")` returns null

**Check:**
1. Token contains the claim
2. Claim name is spelled correctly (case-sensitive)
3. Using correct claim type (e.g., `"organization_id"` vs `ClaimTypes.NameIdentifier`)

```csharp
// Debug: Log all claims
var claims = User.Claims.Select(c => $"{c.Type}={c.Value}");
_logger.LogInformation("User claims: {Claims}", string.Join(", ", claims));
```

### Role Authorization Not Working

**Problem**: `[Authorize(Roles = "ADMIN")]` returns 403

**Check:**
1. Token contains `role` claim with correct value
2. Role name matches exactly (case-sensitive)
3. User has the role assigned in AuthService

## Security Best Practices

1. **Secret Key**: Keep JWT secret key secure, use environment variables or key vault
2. **HTTPS**: Always use HTTPS, never send tokens over HTTP
3. **Token Storage**: Store tokens securely on client (not in localStorage if possible)
4. **Token Rotation**: Implement token rotation using refresh tokens
5. **CORS**: Configure CORS appropriately
6. **Audience**: Always validate audience claim
7. **Expiration**: Set appropriate token expiration times
8. **Logging**: Log authentication failures for security monitoring

## References

- [JWT.io](https://jwt.io/) - JWT debugger and information
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [ASP.NET Core Security Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [Authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/)
