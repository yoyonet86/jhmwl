# AuthService - Authentication & Authorization

The AuthService is the central authentication and authorization service for the Jin Hong Ma Logistics Safety Platform. It provides JWT-based authentication, role/permission management, and token lifecycle management.

## Features

- **ASP.NET Core Identity Integration**: User authentication with identity verification
- **JWT Token Issuance**: Secure token generation with configurable expiration
- **Refresh Token Management**: Token rotation with revocation support
- **Role-Based Access Control (RBAC)**: Flexible role and permission system
- **Multi-Tenant Support**: Organization-level user and role isolation
- **Account Security**: Failed login attempt tracking, account lockout
- **Comprehensive Logging**: Audit trail for authentication events

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│   Controllers                           │
│   ├── AuthenticationController          │
│   ├── RoleController                    │
│   └── PermissionController              │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│   Services                              │
│   ├── AuthenticationService             │
│   ├── RolePermissionService             │
│   └── DatabaseSeederService             │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│   Data Layer                            │
│   ├── AuthDbContext (EF Core)           │
│   ├── ApplicationUser                   │
│   ├── ApplicationRole                   │
│   └── RefreshToken                      │
└─────────────────────────────────────────┘
```

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=logistics_platform;User ID=root;Password=example;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-characters-long-for-production",
    "Issuer": "AuthService",
    "Audience": "LogisticsSafetyPlatform",
    "ExpirationMinutes": 60
  }
}
```

### User Secrets (Development)

For sensitive configuration in development, use `dotnet user-secrets`:

```bash
# Initialize user secrets (run once)
dotnet user-secrets init

# Set JWT secret key
dotnet user-secrets set "Jwt:SecretKey" "your-secret-key-min-32-characters-long-for-production"
```

### Environment Variables (Production)

```bash
export ConnectionStrings__Default="Server=prod-db;Port=3306;Database=logistics_platform;User ID=appuser;Password=secure_password;"
export Jwt__SecretKey="your-production-secret-key-minimum-32-characters-long"
export Jwt__Issuer="AuthService"
export Jwt__Audience="LogisticsSafetyPlatform"
export Jwt__ExpirationMinutes="60"
```

## Database Setup

### Prerequisites

- MySQL 8.0+
- EntityFrameworkCore CLI tools (optional, for manual migrations)

### Initial Setup

The database is automatically migrated on application startup. For manual migration:

```bash
# Add Entity Framework Core tools (if not installed)
dotnet tool install --global dotnet-ef

# Create a migration
dotnet ef migrations add InitialCreate

# Apply migrations
dotnet ef database update
```

### Seeding Default Data

The application automatically seeds default roles and admin user on startup:

**Default Roles:**
- Platform Administrator (ADMIN) - Level 100
- Logistics Manager (MANAGER) - Level 50
- Dispatcher (DISPATCHER) - Level 30
- Driver (DRIVER) - Level 10
- Employee (EMPLOYEE) - Level 5

**Default Admin User:**
- Username: `admin`
- Email: `admin@logisticssafety.local`
- Password: `AdminP@ssw0rd123` (should be changed on first login)

## API Endpoints

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "AdminP@ssw0rd123"
}

Response 200:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64-encoded-refresh-token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@logisticssafety.local",
    "firstName": "System",
    "lastName": "Administrator",
    "organizationId": 1,
    "roles": ["Platform Administrator"],
    "permissions": []
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}

Response 200:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "new-base64-encoded-refresh-token"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}

Response 200:
{
  "success": true
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>

Response 200:
{
  "userId": 1,
  "username": "admin",
  "email": "admin@logisticssafety.local",
  "organizationId": 1,
  "roles": ["Platform Administrator"],
  "permissions": [],
  "claims": [
    {
      "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "value": "1"
    },
    ...
  ]
}
```

### Role Management Endpoints

#### Get All Roles
```http
GET /api/v1/roles?organizationId=1
Authorization: Bearer <access-token>

Response 200:
{
  "roles": [
    {
      "id": 1,
      "name": "Platform Administrator",
      "code": "ADMIN",
      "level": 100,
      "isSystemRole": true
    },
    ...
  ]
}
```

#### Get Role by ID
```http
GET /api/v1/roles/{roleId}
Authorization: Bearer <access-token>
```

#### Create Role
```http
POST /api/v1/roles
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Custom Role",
  "code": "CUSTOM_ROLE",
  "description": "Description of the role",
  "organizationId": 1,
  "isSystemRole": false
}

Response 201:
{
  "id": 10,
  "name": "Custom Role",
  ...
}
```

#### Update Role
```http
PUT /api/v1/roles/{roleId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Role Name",
  "description": "Updated description"
}

Response 200:
{
  "message": "Role updated successfully"
}
```

#### Delete Role
```http
DELETE /api/v1/roles/{roleId}
Authorization: Bearer <access-token>

Response 200:
{
  "message": "Role deleted successfully"
}
```

#### Assign Role to User
```http
POST /api/v1/roles/{roleId}/users/{userId}?organizationId=1
Authorization: Bearer <access-token>

Response 200:
{
  "message": "Role assigned successfully"
}
```

#### Remove Role from User
```http
DELETE /api/v1/roles/{roleId}/users/{userId}
Authorization: Bearer <access-token>

Response 200:
{
  "message": "Role removed successfully"
}
```

### Permission Endpoints

#### Get All Permissions
```http
GET /api/v1/permissions
Authorization: Bearer <access-token>

Response 200:
{
  "categories": [
    {
      "resource": "order",
      "actions": ["read", "create", "update", "delete", "approve"]
    },
    ...
  ]
}
```

#### Get Permission by Resource and Action
```http
GET /api/v1/permissions/{resource}/{action}
Authorization: Bearer <access-token>

Response 200:
{
  "code": "order:read:all",
  "description": "Permission to read orders"
}
```

## Token Validation for Other Services

### JWT Structure

Issued tokens contain the following claims:

```json
{
  "sub": "1",                          // User ID
  "name": "admin",                     // Username
  "email": "admin@logisticssafety.local",
  "organization_id": "1",              // Organization context
  "user_type": "ADMIN",                // User classification
  "role": "Platform Administrator",    // Primary role (multiple for additional roles)
  "permission": "...",                 // Permissions (multiple claims)
  "iat": "1234567890",                 // Issued at
  "exp": "1234571490",                 // Expiration
  "iss": "AuthService",                // Issuer
  "aud": "LogisticsSafetyPlatform"     // Audience
}
```

### Validation in Other Services

**Step 1: Configure JWT Authentication**

```csharp
// In Program.cs of other services
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://auth-service-url";
        options.Audience = "LogisticsSafetyPlatform";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                // Fetch the public key from AuthService
                // In production, use JWKS endpoint
                return new[] { new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)) };
            },
            ValidateIssuer = true,
            ValidIssuer = "AuthService",
            ValidateAudience = true,
            ValidAudience = "LogisticsSafetyPlatform",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
```

**Step 2: Extract Claims in Controllers**

```csharp
[Authorize]
public class OrderController : ControllerBase
{
    public IActionResult GetOrders()
    {
        var userId = User.FindFirst("sub")?.Value;
        var organizationId = User.FindFirst("organization_id")?.Value;
        var roles = User.FindAll(ClaimTypes.Role);
        var permissions = User.FindAll("permission");
        
        // Use these values for authorization checks
        return Ok();
    }
}
```

**Step 3: Implement Permission Checks**

```csharp
// Use policy-based authorization for fine-grained control
services.AddAuthorization(options =>
{
    options.AddPolicy("CanManageOrders", policy =>
        policy.RequireClaim("permission", "order:read", "order:create", "order:update"));
    
    options.AddPolicy("SameOrganization", policy =>
        policy.Requirements.Add(new SameOrganizationRequirement()));
});

// In controller
[Authorize(Policy = "CanManageOrders")]
public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
{
    // Only users with permission can reach here
    return Ok();
}
```

## Running Tests

### Unit Tests

```bash
# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "ClassName=AuthenticationServiceTests"

# Run with verbose output
dotnet test --verbosity normal

# Generate coverage report (requires coverage tool)
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura
```

### Integration Tests

Integration tests use in-memory database for fast execution:

```bash
dotnet test --filter "Category=Integration"
```

## Development Workflow

### Running Locally

```bash
# Restore packages
dotnet restore

# Build
dotnet build

# Run
dotnet run

# The service will be available at https://localhost:5001
```

### Database Migrations

```bash
# Create a new migration
dotnet ef migrations add MigrationName --project AuthService

# Update database
dotnet ef database update --project AuthService

# Remove latest migration
dotnet ef migrations remove --project AuthService
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret key (minimum 32 characters)
2. **Token Expiration**: Set reasonable expiration times (default 60 minutes)
3. **Refresh Token Rotation**: Old refresh tokens are automatically revoked when new ones are issued
4. **Account Lockout**: Accounts are locked after 5 failed login attempts for 30 minutes
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure CORS appropriately for your frontend domains
7. **Rate Limiting**: Implement rate limiting on authentication endpoints in production

## Troubleshooting

### JWT Secret Not Configured

**Error**: `JWT secret key must be configured in appsettings or user secrets`

**Solution**: Set the JWT secret key in appsettings.json or user secrets:
```bash
dotnet user-secrets set "Jwt:SecretKey" "your-secret-key"
```

### Database Connection Failed

**Error**: `Unable to connect to MySQL database`

**Solution**: Verify:
1. MySQL server is running
2. Connection string in appsettings.json is correct
3. Database exists (or will be created by migration)

### Token Validation Failure

**Error**: `401 Unauthorized - Invalid token`

**Solution**: Check:
1. Token hasn't expired
2. Token is properly formatted (`Bearer <token>`)
3. AuthService secret key matches the key used to validate the token
4. Audience and issuer claims match configuration

## Future Enhancements

- [ ] OAuth2/OpenID Connect support
- [ ] Multi-factor authentication (MFA)
- [ ] Social login integration
- [ ] Passwordless authentication
- [ ] Token revocation list (TRL) caching
- [ ] Custom claim mapping
- [ ] Audit log persistence
- [ ] Rate limiting middleware
- [ ] JWKS endpoint for key rotation

## Contributing

When making changes to the AuthService:

1. Update tests accordingly
2. Follow the existing code style
3. Add comments for complex logic
4. Update this README if adding new features
5. Ensure all tests pass before committing

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review existing issue tracker
3. Check the test files for usage examples
