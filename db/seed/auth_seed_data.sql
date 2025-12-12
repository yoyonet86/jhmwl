-- ============================================================================
-- Auth Service Seed Data
-- Version: 1.0.0
-- Purpose: Seed default roles and base permissions for the platform
-- ============================================================================

-- Set SQL mode to handle errors gracefully
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- ============================================================================
-- 1. INSERT PLATFORM SYSTEM ROLES
-- ============================================================================

-- Platform Administrator Role
INSERT IGNORE INTO roles (
    organization_id, name, code, description, is_system_role, level,
    created_at, updated_at, version
) VALUES (
    NULL, 'Platform Administrator', 'ADMIN',
    'Full platform access with administrative privileges',
    TRUE, 100,
    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1
);

-- Logistics Manager Role
INSERT IGNORE INTO roles (
    organization_id, name, code, description, is_system_role, level,
    created_at, updated_at, version
) VALUES (
    NULL, 'Logistics Manager', 'MANAGER',
    'Manage fleet, drivers, and operations within organization',
    TRUE, 50,
    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1
);

-- Dispatcher Role
INSERT IGNORE INTO roles (
    organization_id, name, code, description, is_system_role, level,
    created_at, updated_at, version
) VALUES (
    NULL, 'Dispatcher', 'DISPATCHER',
    'Coordinate routes and driver assignments',
    TRUE, 30,
    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1
);

-- Driver Role
INSERT IGNORE INTO roles (
    organization_id, name, code, description, is_system_role, level,
    created_at, updated_at, version
) VALUES (
    NULL, 'Driver', 'DRIVER',
    'Field delivery personnel',
    TRUE, 10,
    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1
);

-- Employee Role
INSERT IGNORE INTO roles (
    organization_id, name, code, description, is_system_role, level,
    created_at, updated_at, version
) VALUES (
    NULL, 'Employee', 'EMPLOYEE',
    'General staff members with limited access',
    TRUE, 5,
    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1
);

-- ============================================================================
-- 2. INSERT BASE PERMISSIONS
-- ============================================================================

-- Order Management Permissions
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('order', 'read', 'all', 'order:read:all', 'Read all orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'read', 'own', 'order:read:own', 'Read own orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'create', 'all', 'order:create:all', 'Create orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'update', 'all', 'order:update:all', 'Update all orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'update', 'own', 'order:update:own', 'Update own orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'delete', 'all', 'order:delete:all', 'Delete orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('order', 'approve', 'all', 'order:approve:all', 'Approve orders', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- Driver Management Permissions
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('driver', 'read', 'all', 'driver:read:all', 'Read all drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'read', 'managed', 'driver:read:managed', 'Read managed drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'create', 'all', 'driver:create:all', 'Create drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'update', 'all', 'driver:update:all', 'Update all drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'update', 'managed', 'driver:update:managed', 'Update managed drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'delete', 'all', 'driver:delete:all', 'Delete drivers', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('driver', 'assign', 'all', 'driver:assign:all', 'Assign drivers to routes', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- Vehicle Management Permissions
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('vehicle', 'read', 'all', 'vehicle:read:all', 'Read all vehicles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('vehicle', 'read', 'managed', 'vehicle:read:managed', 'Read managed vehicles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('vehicle', 'create', 'all', 'vehicle:create:all', 'Create vehicles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('vehicle', 'update', 'all', 'vehicle:update:all', 'Update all vehicles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('vehicle', 'delete', 'all', 'vehicle:delete:all', 'Delete vehicles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('vehicle', 'maintain', 'all', 'vehicle:maintain:all', 'Manage vehicle maintenance', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- User Management Permissions
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('user', 'read', 'all', 'user:read:all', 'Read all users', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'read', 'organization', 'user:read:organization', 'Read organization users', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'create', 'all', 'user:create:all', 'Create users', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'update', 'all', 'user:update:all', 'Update all users', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'update', 'own', 'user:update:own', 'Update own profile', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'delete', 'all', 'user:delete:all', 'Delete users', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('user', 'reset_password', 'all', 'user:reset_password:all', 'Reset user passwords', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- Role & Permission Management
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('role', 'read', 'all', 'role:read:all', 'Read roles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('role', 'create', 'all', 'role:create:all', 'Create roles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('role', 'update', 'all', 'role:update:all', 'Update roles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('role', 'delete', 'all', 'role:delete:all', 'Delete roles', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- Report & Analytics Permissions
INSERT IGNORE INTO permissions (resource, action, scope, code, description, is_system_permission, created_at, updated_at, version) VALUES
('report', 'read', 'all', 'report:read:all', 'Read all reports', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('report', 'read', 'organization', 'report:read:organization', 'Read organization reports', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1),
('report', 'export', 'all', 'report:export:all', 'Export reports', TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1);

-- ============================================================================
-- 3. ASSIGN PERMISSIONS TO SYSTEM ROLES
-- ============================================================================

-- Platform Administrator gets all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'ADMIN' AND p.is_system_permission = TRUE;

-- Logistics Manager - Order, Driver, Vehicle, User (organization scope), Reports
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'MANAGER' AND p.code IN (
    'order:read:all', 'order:create:all', 'order:update:all', 'order:approve:all',
    'driver:read:all', 'driver:create:all', 'driver:update:all', 'driver:assign:all',
    'vehicle:read:all', 'vehicle:create:all', 'vehicle:update:all', 'vehicle:maintain:all',
    'user:read:organization', 'user:create:all', 'user:update:all',
    'report:read:organization', 'report:export:all'
);

-- Dispatcher - Order & Driver (assignment only)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'DISPATCHER' AND p.code IN (
    'order:read:all', 'order:update:all',
    'driver:read:all', 'driver:assign:all',
    'vehicle:read:all',
    'report:read:organization'
);

-- Driver - Own orders and vehicle
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'DRIVER' AND p.code IN (
    'order:read:own',
    'vehicle:read:managed',
    'user:update:own'
);

-- Employee - Read-only access
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'EMPLOYEE' AND p.code IN (
    'order:read:own',
    'user:update:own'
);

-- ============================================================================
-- 4. VERIFICATION QUERIES
-- ============================================================================

-- Verify roles were created
SELECT 'Roles Created:' as Status;
SELECT code, name, level FROM roles WHERE is_system_role = TRUE ORDER BY level DESC;

-- Verify permissions were created
SELECT 'Permissions Created:' as Status;
SELECT COUNT(*) as TotalPermissions FROM permissions WHERE is_system_permission = TRUE;

-- Verify role-permission mappings
SELECT 'Role Permissions Assigned:' as Status;
SELECT r.code, COUNT(rp.permission_id) as PermissionCount
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.is_system_role = TRUE
GROUP BY r.code
ORDER BY COUNT(rp.permission_id) DESC;

-- ============================================================================
-- RESTORE ORIGINAL SQL MODE
-- ============================================================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
