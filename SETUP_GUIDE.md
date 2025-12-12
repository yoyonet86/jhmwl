# Setup & Deployment Guide

Complete guide for setting up and deploying the Jin Hong Ma Logistics Safety Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Database Setup](#database-setup)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Runtime**: .NET 8.0 SDK or later
- **Database**: MySQL 8.0+
- **Cache**: Redis 6.0+ (optional, for development)
- **Node.js**: 18.0+ (for frontend development)

### Tools Installation

#### Linux/macOS

```bash
# Install .NET SDK
curl https://dot.net/v1/dotnet-install.sh | bash

# Install MySQL (macOS)
brew install mysql

# Start MySQL (macOS)
brew services start mysql

# Install Redis (macOS)
brew install redis
brew services start redis
```

#### Windows

```bash
# Using Chocolatey
choco install dotnet-sdk mysql redis

# Or use Windows Package Manager
winget install Microsoft.DotNet.SDK.8 MySQL Redis
```

#### Verify Installation

```bash
dotnet --version
mysql --version
redis-cli --version
```

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd jin-hong-ma-logistics
```

### 2. Restore Dependencies

```bash
cd backend
dotnet restore
```

### 3. Configure Development Environment

#### Create user secrets for JWT (one-time)

```bash
cd src/AuthService

# Initialize secrets
dotnet user-secrets init

# Set JWT secret (generate a strong random string)
dotnet user-secrets set "Jwt:SecretKey" "your-development-secret-key-at-least-32-characters-long-required"

# Verify
dotnet user-secrets list
```

#### Update connection string if needed

Edit `src/AuthService/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=logistics_platform;User ID=root;Password=example;"
  }
}
```

### 4. Build Solution

```bash
cd backend
dotnet build
```

If there are build errors, ensure all NuGet packages are restored correctly:

```bash
dotnet clean
dotnet restore
dotnet build
```

## Database Setup

### 1. Create Database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS logistics_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Apply Initial Schema

```bash
mysql -u root -p logistics_platform < db/schema/core_tables.sql
```

Verify tables were created:

```bash
mysql -u root -p logistics_platform -e "SHOW TABLES;"
```

### 3. Apply AuthService Migration

The database is automatically migrated on first run of AuthService. Alternatively, apply manually:

```bash
cd backend/src/AuthService
dotnet ef database update
```

### 4. Seed Default Data

Run this after initial schema is applied:

```bash
mysql -u root -p logistics_platform < db/seed/auth_seed_data.sql
mysql -u root -p logistics_platform < db/seed/chinese_address_data.sql
```

Verify default admin user and roles:

```bash
mysql -u root -p logistics_platform -e "SELECT id, username, email, status FROM users LIMIT 5;"
mysql -u root -p logistics_platform -e "SELECT id, code, name, level FROM roles WHERE is_system_role = TRUE ORDER BY level DESC;"
```

## Running Services

### 1. AuthService

The AuthService must be running first as other services depend on it.

```bash
cd backend/src/AuthService

# Run with default configuration
dotnet run

# Run with specific configuration
dotnet run --configuration Debug

# The service will be available at:
# HTTP:  http://localhost:5001
# HTTPS: https://localhost:5002
```

Verify AuthService is running:

```bash
curl http://localhost:5001/health
```

Expected response:

```json
{
  "status": "Healthy",
  "duration": "00:00:00.1234567",
  "checks": [
    {
      "name": "self",
      "status": "Healthy",
      "duration": "00:00:00.0000001",
      "description": null
    },
    {
      "name": "mysql",
      "status": "Healthy",
      "duration": "00:00:00.0123456",
      "description": null
    }
  ]
}
```

### 2. Other Services

Run in separate terminal windows:

```bash
# UserService
cd backend/src/UserService
dotnet run

# DriverService
cd backend/src/DriverService
dotnet run

# VehicleService
cd backend/src/VehicleService
dotnet run

# OrderService
cd backend/src/OrderService
dotnet run

# DictionaryService
cd backend/src/DictionaryService
dotnet run

# Gateway (API Gateway)
cd backend/src/Gateway
dotnet run
```

### 3. Frontend (Angular/Ionic)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Available at: http://localhost:4200
```

## Testing

### Run All Tests

```bash
cd backend
dotnet test
```

### Run Specific Test Project

```bash
dotnet test src/AuthService.Tests/AuthService.Tests.csproj
```

### Run Specific Test Class

```bash
dotnet test --filter "ClassName=AuthenticationServiceTests"
```

### Run with Coverage Report

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura /p:CoverageOutputFormat=opencover
```

## First Login

### Get Access Token

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminP@ssw0rd123"
  }'
```

Expected response:

```json
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

### Use Access Token

Include in subsequent requests:

```bash
curl -H "Authorization: Bearer <accessToken>" \
  http://localhost:5001/api/v1/auth/me
```

## Production Deployment

### 1. Build Release

```bash
cd backend

# Clean previous builds
dotnet clean

# Build for release
dotnet publish -c Release -o ./publish

# This creates optimized binaries in ./publish directory
```

### 2. Docker Deployment

Build Docker images:

```bash
# Build all services
docker-compose build

# Or build specific service
docker build -t logistics-auth-service:latest -f Dockerfile src/AuthService
```

Run with Docker Compose:

```bash
docker-compose up -d
```

Stop services:

```bash
docker-compose down
```

### 3. Database Migration (Production)

```bash
# Backup existing database
mysqldump -h prod-db.example.com -u admin -p logistics_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migrations
mysql -h prod-db.example.com -u admin -p logistics_platform < db/migrations/001_add_refresh_tokens_table.sql

# Verify
mysql -h prod-db.example.com -u admin -p -e "USE logistics_platform; SHOW TABLES;"
```

### 4. Environment Configuration

Create production configuration files:

```bash
# Set environment variables
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__Default="Server=prod-db;Port=3306;Database=logistics_platform;User ID=appuser;Password=secure_password;"
export Jwt__SecretKey="your-production-secret-key-minimum-32-characters-long"
export Jwt__Issuer="AuthService"
export Jwt__Audience="LogisticsSafetyPlatform"
```

Or use `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Server=prod-db;Port=3306;Database=logistics_platform;User ID=appuser;Password=secure_password;"
  },
  "Jwt": {
    "SecretKey": "your-production-secret-key",
    "Issuer": "AuthService",
    "Audience": "LogisticsSafetyPlatform"
  }
}
```

### 5. Change Default Admin Password

**IMPORTANT**: Change the default admin password immediately in production.

```bash
# Login as admin
curl -X POST http://prod-auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminP@ssw0rd123"
  }'

# Then use a password change endpoint (to be implemented)
# Or use user management interface
```

### 6. Enable HTTPS

Configure HTTPS in `Program.cs`:

```csharp
app.UseHttpsRedirection();
app.UseHsts();
```

Or configure at reverse proxy level (nginx, Apache):

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/certificate.crt;
    ssl_certificate_key /etc/ssl/private/key.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://auth-service:5001;
    }
}
```

### 7. Setup Monitoring

Configure logging and monitoring:

```bash
# Setup log aggregation (e.g., ELK Stack)
# Configure application insights
# Setup monitoring dashboards
```

Update logging configuration in `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    },
    "ApplicationInsights": {
      "LogLevel": {
        "Default": "Information"
      }
    }
  }
}
```

## Troubleshooting

### Database Connection Issues

**Error**: `Unable to connect to MySQL at localhost:3306`

**Solutions**:

1. Check MySQL is running:
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

2. Verify connection string:
   ```bash
   echo "Server=localhost;Port=3306;Database=logistics_platform;User ID=root;Password=example;" | mysql
   ```

3. Check database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'logistics%';"
   ```

### JWT Secret Not Configured

**Error**: `JWT secret key must be configured in appsettings or user secrets`

**Solution**:

```bash
cd backend/src/AuthService
dotnet user-secrets set "Jwt:SecretKey" "your-secret-key-min-32-chars"
dotnet run
```

### Build Failures

**Error**: `The SDK 'Microsoft.NET.Sdk.Web' cannot be found`

**Solution**:

```bash
# Install .NET 8.0 SDK
# Check version
dotnet --version

# Should be 8.0.0 or later
```

### Port Already in Use

**Error**: `Address already in use port 5001`

**Solutions**:

1. Kill process using the port:
   ```bash
   # Linux/macOS
   lsof -ti:5001 | xargs kill -9

   # Windows
   netstat -ano | findstr :5001
   taskkill /PID <PID> /F
   ```

2. Use different port:
   ```bash
   dotnet run --urls "http://localhost:5003"
   ```

### Tests Failing

**Error**: `Tests fail with in-memory database issues`

**Solutions**:

1. Ensure Entity Framework Core tools are installed:
   ```bash
   dotnet tool install --global dotnet-ef
   ```

2. Clean and rebuild:
   ```bash
   dotnet clean
   dotnet build
   dotnet test
   ```

### Authentication Failures

**Error**: `401 Unauthorized on all requests`

**Check**:

1. Token is being sent in Authorization header:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/auth/me
   ```

2. Token hasn't expired:
   ```bash
   # Decode token at jwt.io
   # Check exp claim
   ```

3. JWT secret key matches between services:
   ```bash
   # Ensure same secret in all services
   dotnet user-secrets list
   ```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_organization_user ON users(organization_id, deleted_at);
CREATE INDEX idx_role_user ON user_roles(user_id, deleted_at);

-- Analyze query performance
EXPLAIN SELECT * FROM users WHERE organization_id = 1 AND deleted_at IS NULL;
```

### Caching

```csharp
// Add distributed caching
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = configuration.GetConnectionString("Redis");
});
```

### Connection Pooling

Configure in connection string:

```
Server=localhost;Port=3306;Database=logistics_platform;User ID=root;Password=example;Min Pool Size=5;Max Pool Size=20;
```

## Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT secret key (32+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS appropriately
- [ ] Enable authentication on all endpoints
- [ ] Setup rate limiting
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Setup monitoring and alerting
- [ ] Regular security updates for dependencies

## Backup & Recovery

### Database Backup

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysql -u root -p"$DB_PASSWORD" --all-databases | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Retention: keep last 30 days
find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +30 -delete
```

### Restore from Backup

```bash
# Decompress and restore
gunzip < backup_20240101_120000.sql.gz | mysql -u root -p
```

## Next Steps

1. **Configure Frontend**: Setup Angular/Ionic application
2. **Deploy Gateway**: Configure API gateway for service routing
3. **Setup CI/CD**: Configure GitHub Actions or similar
4. **Enable Monitoring**: Setup logging and alerting
5. **Performance Testing**: Load test with expected traffic
6. **Security Testing**: Penetration testing and security audit

## Support & Documentation

- [AuthService README](backend/src/AuthService/README.md)
- [Auth Integration Guide](docs/backend/AUTH_INTEGRATION_GUIDE.md)
- [Database Migration Guide](db/MIGRATION_GUIDE.md)
- [Architecture Documentation](docs/architecture/)
