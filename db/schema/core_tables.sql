-- ============================================================================
-- Jin Hong Ma Logistics Safety Platform - Core Database Schema
-- ============================================================================
-- Version: 1.0.0
-- Database: MySQL 8.0+
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- Engine: InnoDB
-- ============================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- ============================================================================
-- 1. ORGANIZATION & STRUCTURE TABLES
-- ============================================================================

-- 1.1 Organizations (Multi-tenant root)
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_organization_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('PLATFORM', 'LOGISTICS_ENTERPRISE', 'SHIPPER', 'PARTNER') NOT NULL DEFAULT 'LOGISTICS_ENTERPRISE',
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    contact_email VARCHAR(255) NULL,
    contact_phone VARCHAR(20) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'CN',
    postal_code VARCHAR(20) NULL,
    business_license_number VARCHAR(100) NULL,
    tax_registration_number VARCHAR(100) NULL,
    website_url VARCHAR(255) NULL,
    logo_url VARCHAR(500) NULL,
    settings JSON NULL COMMENT 'Organization-specific settings',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_parent_org (parent_organization_id),
    INDEX idx_type_status (type, status),
    INDEX idx_deleted (deleted_at),
    CONSTRAINT fk_org_parent FOREIGN KEY (parent_organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Organization/tenant master table';

-- 1.2 Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    parent_department_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT NULL,
    manager_user_id BIGINT UNSIGNED NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_parent_dept (parent_department_id),
    INDEX idx_manager (manager_user_id),
    INDEX idx_status (status),
    CONSTRAINT fk_dept_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_dept_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 Teams
CREATE TABLE IF NOT EXISTS teams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT NULL,
    team_leader_user_id BIGINT UNSIGNED NULL,
    region_id BIGINT UNSIGNED NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_dept_id (department_id),
    INDEX idx_leader (team_leader_user_id),
    INDEX idx_region (region_id),
    INDEX idx_status (status),
    CONSTRAINT fk_team_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_team_dept FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. USER MANAGEMENT TABLES
-- ============================================================================

-- 2.1 Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('EMPLOYEE', 'DRIVER', 'ADMIN', 'SYSTEM') NOT NULL DEFAULT 'EMPLOYEE',
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires_at TIMESTAMP NULL,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255) NULL,
    language_preference VARCHAR(10) NOT NULL DEFAULT 'zh',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Shanghai',
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_username (username, deleted_at),
    UNIQUE KEY uk_email (email, deleted_at),
    UNIQUE KEY uk_phone (phone, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status),
    INDEX idx_last_login (last_login_at),
    CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    organization_id BIGINT UNSIGNED NOT NULL,
    employee_number VARCHAR(50) NOT NULL,
    department_id BIGINT UNSIGNED NULL,
    team_id BIGINT UNSIGNED NULL,
    job_title VARCHAR(100) NULL,
    hire_date DATE NULL,
    employment_status ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TERMINATED') NOT NULL DEFAULT 'FULL_TIME',
    manager_user_id BIGINT UNSIGNED NULL,
    work_phone VARCHAR(20) NULL,
    work_email VARCHAR(255) NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    emergency_contact_relationship VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_emp_number (organization_id, employee_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_user_id (user_id),
    INDEX idx_dept_id (department_id),
    INDEX idx_team_id (team_id),
    INDEX idx_manager (manager_user_id),
    INDEX idx_employment_status (employment_status),
    CONSTRAINT fk_emp_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_emp_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_emp_team FOREIGN KEY (team_id) REFERENCES teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    organization_id BIGINT UNSIGNED NOT NULL,
    driver_number VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    license_issuing_authority VARCHAR(100) NULL,
    date_of_birth DATE NOT NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relationship VARCHAR(50) NULL,
    blood_type VARCHAR(5) NULL,
    current_status ENUM('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'ON_BREAK', 'UNAVAILABLE') NOT NULL DEFAULT 'OFF_DUTY',
    rating DECIMAL(3,2) NOT NULL DEFAULT 5.00 COMMENT 'Rating from 0.00 to 5.00',
    total_deliveries INT UNSIGNED NOT NULL DEFAULT 0,
    total_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    safety_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Safety score 0-100',
    hire_date DATE NULL,
    termination_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_driver_number (organization_id, driver_number, deleted_at),
    UNIQUE KEY uk_org_license (organization_id, license_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_user_id (user_id),
    INDEX idx_current_status (current_status),
    INDEX idx_license_expiry (license_expiry_date),
    INDEX idx_rating (rating),
    CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_driver_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. ACCESS CONTROL TABLES
-- ============================================================================

-- 3.1 Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL COMMENT 'NULL for system-wide roles',
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    level INT NOT NULL DEFAULT 0 COMMENT 'Role hierarchy level',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_code (code),
    INDEX idx_system_role (is_system_role),
    CONSTRAINT fk_role_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resource VARCHAR(50) NOT NULL COMMENT 'Resource type: order, driver, vehicle, etc.',
    action VARCHAR(50) NOT NULL COMMENT 'Action: read, create, update, delete, etc.',
    scope VARCHAR(50) NULL COMMENT 'Scope: all, own, managed, department, team',
    code VARCHAR(150) NOT NULL UNIQUE COMMENT 'Format: resource:action:scope',
    description TEXT NULL,
    is_system_permission BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_resource (resource),
    INDEX idx_code (code),
    INDEX idx_system_perm (is_system_permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3 Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    organization_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    INDEX idx_org_id (organization_id),
    CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_perm_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 User Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    organization_id BIGINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    valid_from DATE NULL,
    valid_until DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_user_role_org (user_id, role_id, organization_id, deleted_at),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_org_id (organization_id),
    INDEX idx_valid_dates (valid_from, valid_until),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.5 User Permissions (Direct assignments)
CREATE TABLE IF NOT EXISTS user_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    organization_id BIGINT UNSIGNED NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE for grant, FALSE for explicit deny',
    assigned_by_user_id BIGINT UNSIGNED NULL,
    valid_until DATE NULL,
    reason TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_user_perm_org (user_id, permission_id, organization_id, deleted_at),
    INDEX idx_user_id (user_id),
    INDEX idx_permission_id (permission_id),
    INDEX idx_org_id (organization_id),
    INDEX idx_valid_until (valid_until),
    CONSTRAINT fk_user_perm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_perm_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_perm_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. FLEET MANAGEMENT TABLES
-- ============================================================================

-- 4.1 Vehicle Types (Reference)
CREATE TABLE IF NOT EXISTS vehicle_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL COMMENT 'NULL for system-wide types',
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    default_capacity_weight_kg DECIMAL(10,2) NULL,
    default_capacity_volume_m3 DECIMAL(10,2) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_active (is_active),
    CONSTRAINT fk_vtype_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2 Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type_id BIGINT UNSIGNED NOT NULL,
    make VARCHAR(50) NULL,
    model VARCHAR(50) NULL,
    year INT NULL,
    vin VARCHAR(50) NULL COMMENT 'Vehicle Identification Number',
    license_plate VARCHAR(20) NOT NULL,
    license_plate_region VARCHAR(50) NULL,
    capacity_weight_kg DECIMAL(10,2) NULL,
    capacity_volume_m3 DECIMAL(10,2) NULL,
    fuel_type ENUM('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG') NULL,
    status ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
    current_mileage_km DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_maintenance_date DATE NULL,
    next_maintenance_due_km DECIMAL(10,2) NULL,
    next_maintenance_due_date DATE NULL,
    insurance_policy_number VARCHAR(100) NULL,
    insurance_expiry_date DATE NULL,
    registration_expiry_date DATE NULL,
    gps_device_id VARCHAR(100) NULL,
    gps_device_phone VARCHAR(20) NULL,
    current_driver_id BIGINT UNSIGNED NULL,
    current_location_lat DECIMAL(10,8) NULL,
    current_location_lng DECIMAL(11,8) NULL,
    current_location_updated_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_vehicle_number (organization_id, vehicle_number, deleted_at),
    UNIQUE KEY uk_org_license_plate (organization_id, license_plate, deleted_at),
    UNIQUE KEY uk_vin (vin, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_vehicle_type (vehicle_type_id),
    INDEX idx_status (status),
    INDEX idx_current_driver (current_driver_id),
    INDEX idx_location (current_location_lat, current_location_lng),
    INDEX idx_insurance_expiry (insurance_expiry_date),
    INDEX idx_maintenance_due (next_maintenance_due_date),
    CONSTRAINT fk_vehicle_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_vehicle_type FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id),
    CONSTRAINT fk_vehicle_driver FOREIGN KEY (current_driver_id) REFERENCES drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.3 Vehicle Maintenance Records
CREATE TABLE IF NOT EXISTS vehicle_maintenance_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    maintenance_type ENUM('ROUTINE', 'REPAIR', 'INSPECTION', 'RECALL', 'ACCIDENT_REPAIR', 'OTHER') NOT NULL,
    maintenance_date DATE NOT NULL,
    mileage_at_service_km DECIMAL(10,2) NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) NULL,
    service_provider VARCHAR(255) NULL,
    invoice_number VARCHAR(100) NULL,
    next_service_due_km DECIMAL(10,2) NULL,
    next_service_due_date DATE NULL,
    technician_name VARCHAR(100) NULL,
    parts_replaced JSON NULL COMMENT 'Array of parts replaced',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_org_id (organization_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_type (maintenance_type),
    INDEX idx_next_due (next_service_due_date),
    CONSTRAINT fk_maint_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_maint_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.4 Vehicle Inspections
CREATE TABLE IF NOT EXISTS vehicle_inspections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    inspection_type ENUM('PRE_TRIP', 'POST_TRIP', 'PERIODIC', 'RANDOM', 'ANNUAL') NOT NULL,
    inspection_date TIMESTAMP NOT NULL,
    status ENUM('PASSED', 'FAILED', 'CONDITIONAL', 'PENDING') NOT NULL DEFAULT 'PENDING',
    odometer_reading_km DECIMAL(10,2) NULL,
    location_lat DECIMAL(10,8) NULL,
    location_lng DECIMAL(11,8) NULL,
    notes TEXT NULL,
    signature_url VARCHAR(500) NULL,
    inspector_name VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_org_id (organization_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_type (inspection_type),
    INDEX idx_status (status),
    CONSTRAINT fk_insp_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_insp_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_insp_driver FOREIGN KEY (driver_id) REFERENCES drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.5 Vehicle Inspection Items
CREATE TABLE IF NOT EXISTS vehicle_inspection_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inspection_id BIGINT UNSIGNED NOT NULL,
    item_category ENUM('BRAKES', 'LIGHTS', 'TIRES', 'ENGINE', 'STEERING', 'SUSPENSION', 'EXHAUST', 'BODY', 'INTERIOR', 'SAFETY_EQUIPMENT', 'FLUID_LEVELS', 'ELECTRICAL', 'OTHER') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    status ENUM('PASS', 'FAIL', 'ATTENTION_NEEDED', 'NOT_APPLICABLE') NOT NULL DEFAULT 'PASS',
    notes TEXT NULL,
    photo_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inspection_id (inspection_id),
    INDEX idx_category (item_category),
    INDEX idx_status (status),
    CONSTRAINT fk_insp_item_inspection FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.6 Vehicle Assignments
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    assigned_date TIMESTAMP NOT NULL,
    expected_return_date TIMESTAMP NULL,
    actual_return_date TIMESTAMP NULL,
    start_mileage_km DECIMAL(10,2) NULL,
    end_mileage_km DECIMAL(10,2) NULL,
    assignment_status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    assigned_by_user_id BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_org_id (organization_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_assigned_date (assigned_date),
    INDEX idx_status (assignment_status),
    INDEX idx_active_assignments (vehicle_id, assignment_status),
    CONSTRAINT fk_assign_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_assign_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_assign_driver FOREIGN KEY (driver_id) REFERENCES drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CUSTOMER & ORDER MANAGEMENT TABLES
-- ============================================================================

-- 5.1 Customers
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    customer_number VARCHAR(50) NOT NULL,
    customer_type ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL',
    company_name VARCHAR(255) NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NULL,
    billing_address TEXT NULL,
    billing_city VARCHAR(100) NULL,
    billing_province VARCHAR(100) NULL,
    billing_country VARCHAR(100) NULL,
    billing_postal_code VARCHAR(20) NULL,
    shipping_address TEXT NULL,
    shipping_city VARCHAR(100) NULL,
    shipping_province VARCHAR(100) NULL,
    shipping_country VARCHAR(100) NULL,
    shipping_postal_code VARCHAR(20) NULL,
    credit_limit DECIMAL(12,2) NULL,
    payment_terms VARCHAR(50) NULL,
    tax_registration_number VARCHAR(100) NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    rating DECIMAL(3,2) NULL COMMENT 'Customer rating 0-5',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_customer_number (organization_id, customer_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_customer_type (customer_type),
    INDEX idx_status (status),
    INDEX idx_contact_phone (contact_phone),
    INDEX idx_contact_email (contact_email),
    CONSTRAINT fk_customer_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5.2 Cargo Types (Reference)
CREATE TABLE IF NOT EXISTS cargo_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL COMMENT 'NULL for system-wide types',
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    requires_special_handling BOOLEAN NOT NULL DEFAULT FALSE,
    hazmat_classification VARCHAR(50) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_active (is_active),
    CONSTRAINT fk_cargo_type_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5.3 Orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_type ENUM('DELIVERY', 'PICKUP', 'ROUND_TRIP', 'TRANSFER') NOT NULL DEFAULT 'DELIVERY',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    status ENUM('PENDING', 'ASSIGNED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100) NULL,
    origin_province VARCHAR(100) NULL,
    origin_postal_code VARCHAR(20) NULL,
    origin_lat DECIMAL(10,8) NULL,
    origin_lng DECIMAL(11,8) NULL,
    origin_contact_name VARCHAR(100) NULL,
    origin_contact_phone VARCHAR(20) NULL,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100) NULL,
    destination_province VARCHAR(100) NULL,
    destination_postal_code VARCHAR(20) NULL,
    destination_lat DECIMAL(10,8) NULL,
    destination_lng DECIMAL(11,8) NULL,
    destination_contact_name VARCHAR(100) NULL,
    destination_contact_phone VARCHAR(20) NULL,
    scheduled_pickup_time TIMESTAMP NULL,
    scheduled_delivery_time TIMESTAMP NULL,
    actual_pickup_time TIMESTAMP NULL,
    actual_delivery_time TIMESTAMP NULL,
    assigned_driver_id BIGINT UNSIGNED NULL,
    assigned_vehicle_id BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP NULL,
    distance_km DECIMAL(10,2) NULL,
    estimated_duration_minutes INT NULL,
    total_weight_kg DECIMAL(10,2) NULL,
    total_volume_m3 DECIMAL(10,2) NULL,
    special_instructions TEXT NULL,
    delivery_proof_signature_url VARCHAR(500) NULL,
    delivery_proof_photo_url VARCHAR(500) NULL,
    customer_rating DECIMAL(3,2) NULL,
    customer_feedback TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_order_number (organization_id, order_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_driver (assigned_driver_id),
    INDEX idx_assigned_vehicle (assigned_vehicle_id),
    INDEX idx_scheduled_pickup (scheduled_pickup_time),
    INDEX idx_scheduled_delivery (scheduled_delivery_time),
    INDEX idx_origin_location (origin_lat, origin_lng),
    INDEX idx_destination_location (destination_lat, destination_lng),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_order_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_order_driver FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id),
    CONSTRAINT fk_order_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5.4 Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    item_number INT NOT NULL,
    cargo_type_id BIGINT UNSIGNED NULL,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NULL COMMENT 'PIECES, PALLETS, BOXES, KG, etc.',
    weight_kg DECIMAL(10,2) NULL,
    volume_m3 DECIMAL(10,2) NULL,
    value DECIMAL(12,2) NULL COMMENT 'Declared value',
    special_handling TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_cargo_type (cargo_type_id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_cargo_type FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5.5 Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id BIGINT UNSIGNED NULL,
    reason TEXT NULL,
    location_lat DECIMAL(10,8) NULL,
    location_lng DECIMAL(11,8) NULL,
    notes TEXT NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_to_status (to_status),
    CONSTRAINT fk_order_status_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. ROUTE & NAVIGATION TABLES
-- ============================================================================

-- 6.1 Routes
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    route_number VARCHAR(50) NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    route_date DATE NOT NULL,
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    start_location_lat DECIMAL(10,8) NULL,
    start_location_lng DECIMAL(11,8) NULL,
    end_location_lat DECIMAL(10,8) NULL,
    end_location_lng DECIMAL(11,8) NULL,
    total_distance_km DECIMAL(10,2) NULL,
    total_duration_minutes INT NULL,
    planned_stops INT NOT NULL DEFAULT 0,
    completed_stops INT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_route_number (organization_id, route_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_route_date (route_date),
    INDEX idx_status (status),
    CONSTRAINT fk_route_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_route_driver FOREIGN KEY (driver_id) REFERENCES drivers(id),
    CONSTRAINT fk_route_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.2 Route Waypoints
CREATE TABLE IF NOT EXISTS route_waypoints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NULL,
    sequence_number INT NOT NULL,
    waypoint_type ENUM('PICKUP', 'DELIVERY', 'BREAK', 'REFUEL', 'CHECKPOINT', 'OTHER') NOT NULL,
    address TEXT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    planned_arrival_time TIMESTAMP NULL,
    planned_departure_time TIMESTAMP NULL,
    actual_arrival_time TIMESTAMP NULL,
    actual_departure_time TIMESTAMP NULL,
    status ENUM('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_id (route_id),
    INDEX idx_order_id (order_id),
    INDEX idx_sequence (route_id, sequence_number),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    CONSTRAINT fk_waypoint_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_waypoint_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. SAFETY & COMPLIANCE TABLES
-- ============================================================================

-- 7.1 Safety Incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    incident_number VARCHAR(50) NOT NULL,
    incident_type ENUM('ACCIDENT', 'NEAR_MISS', 'VIOLATION', 'EQUIPMENT_FAILURE', 'INJURY', 'PROPERTY_DAMAGE', 'HAZMAT_SPILL', 'OTHER') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    driver_id BIGINT UNSIGNED NULL,
    vehicle_id BIGINT UNSIGNED NULL,
    order_id BIGINT UNSIGNED NULL,
    route_id BIGINT UNSIGNED NULL,
    location_address TEXT NULL,
    location_lat DECIMAL(10,8) NULL,
    location_lng DECIMAL(11,8) NULL,
    description TEXT NOT NULL,
    weather_conditions VARCHAR(100) NULL,
    road_conditions VARCHAR(100) NULL,
    injuries INT NOT NULL DEFAULT 0,
    fatalities INT NOT NULL DEFAULT 0,
    property_damage_estimate DECIMAL(12,2) NULL,
    police_report_number VARCHAR(100) NULL,
    insurance_claim_number VARCHAR(100) NULL,
    status ENUM('REPORTED', 'INVESTIGATING', 'PENDING_ACTION', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'REPORTED',
    reported_by_user_id BIGINT UNSIGNED NULL,
    assigned_investigator_user_id BIGINT UNSIGNED NULL,
    investigation_notes TEXT NULL,
    resolution_notes TEXT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_incident_number (organization_id, incident_number, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_incident_type (incident_type),
    INDEX idx_severity (severity),
    INDEX idx_incident_date (incident_date),
    INDEX idx_driver_id (driver_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_location (location_lat, location_lng),
    CONSTRAINT fk_incident_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incident_driver FOREIGN KEY (driver_id) REFERENCES drivers(id),
    CONSTRAINT fk_incident_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_incident_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_incident_route FOREIGN KEY (route_id) REFERENCES routes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.2 Safety Incident Attachments
CREATE TABLE IF NOT EXISTS safety_incident_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT UNSIGNED NOT NULL,
    attachment_type ENUM('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NULL,
    mime_type VARCHAR(100) NULL,
    description TEXT NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incident_id (incident_id),
    INDEX idx_attachment_type (attachment_type),
    CONSTRAINT fk_incident_attach_incident FOREIGN KEY (incident_id) REFERENCES safety_incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.3 Safety Incident Actions
CREATE TABLE IF NOT EXISTS safety_incident_actions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT UNSIGNED NOT NULL,
    action_type ENUM('DISCIPLINARY', 'TRAINING', 'EQUIPMENT_REPAIR', 'POLICY_UPDATE', 'FOLLOW_UP', 'OTHER') NOT NULL,
    description TEXT NOT NULL,
    assigned_to_user_id BIGINT UNSIGNED NULL,
    due_date DATE NULL,
    completed_date DATE NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    INDEX idx_incident_id (incident_id),
    INDEX idx_action_type (action_type),
    INDEX idx_assigned_to (assigned_to_user_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    CONSTRAINT fk_incident_action_incident FOREIGN KEY (incident_id) REFERENCES safety_incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.4 Driver Licenses
CREATE TABLE IF NOT EXISTS driver_licenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    driver_id BIGINT UNSIGNED NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_type VARCHAR(20) NOT NULL COMMENT 'CDL Class A, B, C, etc.',
    issuing_authority VARCHAR(100) NOT NULL,
    issuing_country VARCHAR(3) NOT NULL DEFAULT 'CN',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED') NOT NULL DEFAULT 'VALID',
    restrictions JSON NULL COMMENT 'Array of license restrictions',
    endorsements JSON NULL COMMENT 'Array of license endorsements',
    verification_date DATE NULL,
    verified_by_user_id BIGINT UNSIGNED NULL,
    document_url VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_driver_id (driver_id),
    INDEX idx_license_number (license_number),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status),
    CONSTRAINT fk_license_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.5 Driver Certifications
CREATE TABLE IF NOT EXISTS driver_certifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    driver_id BIGINT UNSIGNED NOT NULL,
    certification_type VARCHAR(50) NOT NULL COMMENT 'HAZMAT, FORKLIFT, FIRST_AID, etc.',
    certification_number VARCHAR(100) NULL,
    issuing_authority VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NULL,
    status ENUM('VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED') NOT NULL DEFAULT 'VALID',
    document_url VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_driver_id (driver_id),
    INDEX idx_certification_type (certification_type),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status),
    CONSTRAINT fk_cert_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.6 Driver Violations
CREATE TABLE IF NOT EXISTS driver_violations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NULL,
    violation_type ENUM('SPEEDING', 'UNSAFE_DRIVING', 'LOG_VIOLATION', 'SUBSTANCE_ABUSE', 'TRAFFIC', 'POLICY', 'OTHER') NOT NULL,
    violation_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NULL,
    citation_number VARCHAR(100) NULL,
    issuing_authority ENUM('POLICE', 'DOT', 'COMPANY', 'COURT', 'OTHER') NOT NULL,
    fine_amount DECIMAL(10,2) NULL,
    points INT NULL,
    status ENUM('PENDING', 'PAID', 'DISPUTED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    resolution_date DATE NULL,
    resolution_notes TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    INDEX idx_org_id (organization_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_violation_type (violation_type),
    INDEX idx_violation_date (violation_date),
    INDEX idx_status (status),
    CONSTRAINT fk_violation_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_violation_driver FOREIGN KEY (driver_id) REFERENCES drivers(id),
    CONSTRAINT fk_violation_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.7 Driver Performance Metrics
CREATE TABLE IF NOT EXISTS driver_performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    metric_period_start DATE NOT NULL,
    metric_period_end DATE NOT NULL,
    total_deliveries INT UNSIGNED NOT NULL DEFAULT 0,
    on_time_deliveries INT UNSIGNED NOT NULL DEFAULT 0,
    late_deliveries INT UNSIGNED NOT NULL DEFAULT 0,
    total_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_drive_time_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    fuel_efficiency_l_per_100km DECIMAL(5,2) NULL,
    safety_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT '0-100 scale',
    customer_rating_avg DECIMAL(3,2) NULL COMMENT '0-5 scale',
    incidents_count INT UNSIGNED NOT NULL DEFAULT 0,
    violations_count INT UNSIGNED NOT NULL DEFAULT 0,
    harsh_braking_events INT UNSIGNED NOT NULL DEFAULT 0,
    harsh_acceleration_events INT UNSIGNED NOT NULL DEFAULT 0,
    speeding_events INT UNSIGNED NOT NULL DEFAULT 0,
    idle_time_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_driver_period (driver_id, metric_period_start, metric_period_end),
    INDEX idx_org_id (organization_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_period (metric_period_start, metric_period_end),
    INDEX idx_safety_score (safety_score),
    CONSTRAINT fk_perf_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_perf_driver FOREIGN KEY (driver_id) REFERENCES drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. REFERENCE DATA & DICTIONARY TABLES
-- ============================================================================

-- 8.1 Dictionaries
CREATE TABLE IF NOT EXISTS dictionaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL COMMENT 'NULL for system-wide dictionaries',
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_system_dictionary BOOLEAN NOT NULL DEFAULT TRUE,
    allow_custom_values BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_code (code),
    INDEX idx_system (is_system_dictionary),
    CONSTRAINT fk_dict_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.2 Dictionary Items
CREATE TABLE IF NOT EXISTS dictionary_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dictionary_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    value_en VARCHAR(255) NULL COMMENT 'English translation',
    display_order INT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSON NULL COMMENT 'Additional metadata',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_dict_code (dictionary_id, code, deleted_at),
    INDEX idx_dictionary_id (dictionary_id),
    INDEX idx_active (is_active),
    INDEX idx_display_order (display_order),
    CONSTRAINT fk_dict_item_dict FOREIGN KEY (dictionary_id) REFERENCES dictionaries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.3 Regions
CREATE TABLE IF NOT EXISTS regions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL COMMENT 'NULL for system-wide regions',
    parent_region_id BIGINT UNSIGNED NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NULL,
    region_type ENUM('COUNTRY', 'PROVINCE', 'CITY', 'DISTRICT', 'ZONE', 'AREA') NOT NULL,
    boundary_geojson JSON NULL COMMENT 'GeoJSON boundary definition',
    center_lat DECIMAL(10,8) NULL,
    center_lng DECIMAL(11,8) NULL,
    is_service_area BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_parent_region (parent_region_id),
    INDEX idx_region_type (region_type),
    INDEX idx_active (is_active),
    INDEX idx_center_location (center_lat, center_lng),
    CONSTRAINT fk_region_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_region_parent FOREIGN KEY (parent_region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.4 Service Areas
CREATE TABLE IF NOT EXISTS service_areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    boundary_geojson JSON NULL COMMENT 'GeoJSON boundary',
    center_lat DECIMAL(10,8) NULL,
    center_lng DECIMAL(11,8) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    service_level ENUM('STANDARD', 'EXPRESS', 'PREMIUM', 'ECONOMY') NOT NULL DEFAULT 'STANDARD',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT UNSIGNED NULL,
    deleted_at TIMESTAMP NULL,
    version INT NOT NULL DEFAULT 1,
    UNIQUE KEY uk_org_code (organization_id, code, deleted_at),
    INDEX idx_org_id (organization_id),
    INDEX idx_region_id (region_id),
    INDEX idx_active (is_active),
    INDEX idx_center_location (center_lat, center_lng),
    CONSTRAINT fk_service_area_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_service_area_region FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. AUDIT & SYSTEM TABLES
-- ============================================================================

-- 9.1 Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'OTHER') NOT NULL,
    entity_type VARCHAR(50) NOT NULL COMMENT 'Table name or entity type',
    entity_id BIGINT UNSIGNED NULL,
    old_values JSON NULL COMMENT 'Previous values (for UPDATE/DELETE)',
    new_values JSON NULL COMMENT 'New values (for CREATE/UPDATE)',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    request_id VARCHAR(100) NULL COMMENT 'Request correlation ID',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_org_id (organization_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_request_id (request_id),
    CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
    PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
    PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
    PARTITION p_2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
    PARTITION p_2024_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ============================================================================
-- RESTORE SETTINGS
-- ============================================================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
