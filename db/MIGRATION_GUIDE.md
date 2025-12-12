# Database Migration Guide

This guide explains how to create and apply database migrations for the logistics platform.

## Overview

The platform uses Entity Framework Core for managing database schema changes. Migrations are stored in the `db/migrations/` directory and can be applied manually or automatically.

## Migration Strategy

We use a **hybrid approach**:

1. **Automatic migrations** on application startup (for development)
2. **Manual SQL migration files** (for version control and production)
3. **Seed scripts** for initial data (in `db/seed/`)

## File Structure

```
db/
├── migrations/
│   ├── 001_add_refresh_tokens_table.sql
│   ├── 002_*.sql
│   └── README.md
├── schema/
│   └── core_tables.sql              (Initial schema)
└── seed/
    ├── auth_seed_data.sql           (Auth roles & permissions)
    ├── chinese_address_data.sql     (Regional data)
    └── README.md
```

## Creating Migrations

### Step 1: Make Model Changes

Update the Entity Framework Core model in `AuthService/Models/`:

```csharp
public class YourEntity
{
    public long Id { get; set; }
    public string NewColumn { get; set; }  // New column
}
```

### Step 2: Generate Migration

Navigate to the service directory and create a migration:

```bash
cd backend/src/AuthService

# Generate migration code
dotnet ef migrations add YourMigrationName

# This creates a migration file in Migrations/ folder
```

### Step 3: Create SQL Migration File

Convert the EF migration to SQL and save in `db/migrations/`:

```sql
-- ============================================================================
-- Migration: [Description of Changes]
-- Version: NNN
-- Database: MySQL 8.0+
-- ============================================================================

-- Example: Add a new column
ALTER TABLE orders
ADD COLUMN tracking_number VARCHAR(100) NULL AFTER order_number;

-- Create an index
CREATE INDEX idx_tracking_number ON orders(tracking_number);

-- Verify changes
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'orders' AND TABLE_SCHEMA = DATABASE();
```

### Step 4: Apply Migration

**Development (Automatic)**:
```bash
dotnet run
# Migration applies automatically on startup
```

**Development (Manual)**:
```bash
cd backend/src/AuthService

# Apply pending migrations
dotnet ef database update

# Rollback last migration (if needed)
dotnet ef database update PreviousMigration
```

**Production (Manual)**:
```bash
# Log in to database server
mysql -h prod-db.example.com -u admin -p logistics_platform

# Apply SQL migration
source db/migrations/001_add_refresh_tokens_table.sql;
source db/migrations/002_*.sql;
source db/migrations/003_*.sql;

# Verify
SHOW TABLES;
```

## Existing Migrations

### 001_add_refresh_tokens_table.sql

**Purpose**: Add JWT refresh token management table

**Changes**:
- Creates `refresh_tokens` table
- Adds indexes for efficient querying
- Sets up foreign key relationships

**Applied**: Automatically on AuthService startup

## Seed Data

Seed scripts should be applied after schema migrations:

### Initial Setup (One-time)

```bash
# 1. Apply schema migrations
cd backend/src/AuthService
dotnet ef database update

# 2. Apply seed scripts
mysql -h localhost -u root -p logistics_platform < db/schema/core_tables.sql
mysql -h localhost -u root -p logistics_platform < db/seed/auth_seed_data.sql
mysql -h localhost -u root -p logistics_platform < db/seed/chinese_address_data.sql
```

### Production Deployment

```bash
#!/bin/bash
set -e

DB_HOST="prod-db.example.com"
DB_USER="admin"
DB_NAME="logistics_platform"
DB_PASSWORD="${DB_PASSWORD}"  # From environment

echo "Backing up database..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > backup_$(date +%Y%m%d_%H%M%S).sql

echo "Applying migrations..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < db/migrations/001_add_refresh_tokens_table.sql

echo "Migration completed successfully"
```

## Common Tasks

### Create a New Table

1. Create EF Core model:
```csharp
[Table("my_table")]
public class MyEntity
{
    [Key]
    [Column("id")]
    public long Id { get; set; }
    
    [Column("name")]
    public string Name { get; set; }
}
```

2. Add to DbContext:
```csharp
public DbSet<MyEntity> MyEntities { get; set; }
```

3. Create migration:
```bash
dotnet ef migrations add AddMyEntity
```

4. Create SQL migration file with corresponding number

### Add a Column to Existing Table

1. Update model:
```csharp
public string NewField { get; set; }
```

2. Create migration:
```bash
dotnet ef migrations add AddNewFieldToOrder
```

3. Create SQL:
```sql
ALTER TABLE orders ADD COLUMN new_field VARCHAR(100) NULL;
CREATE INDEX idx_new_field ON orders(new_field);
```

### Add an Index

1. Configure in model:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Order>()
        .HasIndex(o => o.OrderNumber);
}
```

2. Create migration:
```bash
dotnet ef migrations add AddOrderNumberIndex
```

### Drop a Column

1. Remove from model
2. Create migration:
```bash
dotnet ef migrations add DropUnusedColumn
```

3. Create SQL:
```sql
ALTER TABLE orders DROP COLUMN unused_column;
```

## Naming Conventions

### Migration Files

Format: `NNN_description.sql`

- **NNN**: Sequential 3-digit number (001, 002, 003...)
- **description**: Brief description in snake_case

Examples:
- `001_add_refresh_tokens_table.sql`
- `002_create_audit_logs_table.sql`
- `003_add_indexes_to_users_table.sql`

### SQL Comments

Always include migration header:

```sql
-- ============================================================================
-- Migration: [Clear description of what this migration does]
-- Version: NNN
-- Database: MySQL 8.0+
-- Author: [Your name]
-- Date: YYYY-MM-DD
-- ============================================================================
```

## Best Practices

1. **Test Migrations Locally First**
   ```bash
   # Test in local database
   dotnet ef database update
   dotnet ef database update 0  # Rollback to check reversibility
   ```

2. **Keep Migrations Small**
   - One logical change per migration
   - Easier to debug and understand
   - Simpler to rollback if needed

3. **Always Include Verification**
   ```sql
   -- Verify the changes
   SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'my_table';
   ```

4. **Document Breaking Changes**
   - Note in migration comment if it requires code changes
   - Update this guide if schema strategy changes

5. **Use Proper Constraints**
   - Foreign keys for relationships
   - NOT NULL for required fields
   - Indexes for frequently queried columns

6. **Backup Before Production**
   ```bash
   # Always backup production database
   mysqldump -h prod-db -u admin -p database_name > backup_before_migration.sql
   ```

7. **Review EF Generated SQL**
   ```bash
   # See SQL that will be applied
   dotnet ef migrations script -o migration.sql
   ```

## Troubleshooting

### Migration Fails to Apply

**Error**: `Duplicate key name 'PRIMARY'`

**Solution**: Check if migration was partially applied:
```sql
-- Check migration history
SELECT * FROM __EFMigrationsHistory;

-- Manually remove if needed
DELETE FROM __EFMigrationsHistory WHERE MigrationId = 'xxx';
```

### Rollback Migration

```bash
# Rollback last migration
dotnet ef database update PreviousMigrationName

# Rollback to initial
dotnet ef database update 0

# Remove migration files (be careful!)
dotnet ef migrations remove
```

### Foreign Key Constraint Fails

**Error**: `Cannot add foreign key constraint`

**Check**:
1. Referenced table exists
2. Referenced column type matches
3. Data in referencing column exists in referenced table

```sql
-- Check existing tables
SHOW TABLES;

-- Check table structure
DESCRIBE table_name;

-- Check indexes
SHOW INDEXES FROM table_name;
```

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2024-01-15 | Add refresh_tokens table for JWT token management |

## Related Documents

- [Database Schema Documentation](../docs/db/README.md)
- [AuthService README](src/AuthService/README.md)
- [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
