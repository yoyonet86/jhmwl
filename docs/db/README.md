# Database Schema Documentation

## Overview

This document describes the MySQL database schema for the 金鸿马物流安全平台 (Jin Hong Ma Logistics Safety Platform). The schema is designed to support multi-tenant operations with comprehensive audit trails, role-based access control, and data isolation.

## Design Principles

1. **Multi-Tenant Architecture**: Every table includes `organization_id` for tenant-level data isolation
2. **Audit Metadata**: All tables track creation, modification, and soft deletion
3. **Referential Integrity**: Foreign keys enforce data consistency
4. **Normalization**: Schema follows 3NF with selective denormalization for performance
5. **InnoDB Engine**: Transactional support with row-level locking
6. **UTF-8 Character Set**: Full Unicode support including Chinese characters
7. **Soft Deletes**: Records are marked as deleted rather than physically removed

## Entity Relationship Model

### Core Domain Entities

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION HIERARCHY                        │
└─────────────────────────────────────────────────────────────────────┘

organizations
    ├── departments
    │   └── teams
    └── users
        ├── employees
        └── drivers

┌─────────────────────────────────────────────────────────────────────┐
│                    ACCESS CONTROL & SECURITY                         │
└─────────────────────────────────────────────────────────────────────┘

roles
    └── permissions
        └── role_permissions (mapping)

users
    └── user_roles (mapping)
        └── user_permissions (direct assignments)

┌─────────────────────────────────────────────────────────────────────┐
│                      FLEET MANAGEMENT                                │
└─────────────────────────────────────────────────────────────────────┘

vehicles
    ├── vehicle_maintenance_records
    ├── vehicle_inspections
    └── vehicle_assignments (to drivers)

drivers
    ├── driver_licenses
    ├── driver_certifications
    └── driver_performance_metrics

┌─────────────────────────────────────────────────────────────────────┐
│                      ORDER & DELIVERY                                │
└─────────────────────────────────────────────────────────────────────┘

customers
    └── orders
        ├── order_items
        ├── order_status_history
        └── order_assignments (to drivers/vehicles)
            └── routes
                └── route_waypoints

┌─────────────────────────────────────────────────────────────────────┐
│                     SAFETY & COMPLIANCE                              │
└─────────────────────────────────────────────────────────────────────┘

safety_incidents
    ├── safety_incident_attachments
    └── safety_incident_actions

vehicle_inspections
    └── inspection_checklist_items

driver_violations
    └── violation_resolutions

┌─────────────────────────────────────────────────────────────────────┐
│                   REFERENCE DATA & DICTIONARIES                      │
└─────────────────────────────────────────────────────────────────────┘

dictionaries
    └── dictionary_items

regions
    └── service_areas

vehicle_types
cargo_types
```

## Table Descriptions

### 1. Organizations & Structure

#### 1.1 organizations
Primary entity for multi-tenant data isolation. Represents companies using the platform.

**Key Fields:**
- `id`: Primary key (BIGINT UNSIGNED AUTO_INCREMENT)
- `name`: Organization name
- `code`: Unique organization code
- `type`: Organization type (PLATFORM, LOGISTICS_ENTERPRISE, SHIPPER)
- `status`: Active status (ACTIVE, SUSPENDED, INACTIVE)
- `tenant_id`: Self-referential for platform-level operations
- `parent_organization_id`: Support for organization hierarchy
- `contact_email`, `contact_phone`: Primary contact information
- `address`, `city`, `province`, `country`: Location details
- `business_license_number`: Legal identification
- `tax_registration_number`: Tax identifier

#### 1.2 departments
Organizational subdivisions within a company.

**Key Fields:**
- `organization_id`: Parent organization (FK)
- `parent_department_id`: Support for nested departments
- `name`: Department name
- `code`: Unique department code within organization
- `manager_user_id`: Department head (FK to users)

#### 1.3 teams
Operational teams within departments.

**Key Fields:**
- `organization_id`: Tenant scoping
- `department_id`: Parent department (FK)
- `name`: Team name
- `team_leader_user_id`: Team leader (FK to users)
- `region_id`: Operating region (FK to regions)

### 2. User Management

#### 2.1 users
Core user entity for all platform users.

**Key Fields:**
- `organization_id`: Tenant scoping
- `username`: Unique login identifier
- `email`: Unique email address
- `phone`: Unique phone number
- `password_hash`: Bcrypt/Argon2 password hash
- `first_name`, `last_name`: User name
- `user_type`: Type of user (EMPLOYEE, DRIVER, ADMIN)
- `status`: Account status (ACTIVE, INACTIVE, LOCKED, PENDING)
- `last_login_at`: Last successful login timestamp
- `failed_login_attempts`: Security tracking
- `mfa_enabled`: Multi-factor authentication flag
- `mfa_secret`: TOTP secret for MFA
- `language_preference`: UI language (zh, en)
- `timezone`: User timezone

#### 2.2 employees
Extended profile for employees (non-drivers).

**Key Fields:**
- `user_id`: Foreign key to users (1:1)
- `organization_id`: Tenant scoping
- `employee_number`: Unique employee identifier
- `department_id`: Assigned department (FK)
- `team_id`: Assigned team (FK)
- `job_title`: Position title
- `hire_date`: Employment start date
- `employment_status`: Employment status (FULL_TIME, PART_TIME, CONTRACT)
- `manager_user_id`: Direct manager (FK to users)

#### 2.3 drivers
Extended profile for driver users.

**Key Fields:**
- `user_id`: Foreign key to users (1:1)
- `organization_id`: Tenant scoping
- `driver_number`: Unique driver identifier
- `license_number`: Driver's license number
- `license_type`: License classification (CDL A, B, C, etc.)
- `license_expiry_date`: License expiration
- `license_issuing_authority`: License issuer
- `date_of_birth`: Driver's DOB
- `emergency_contact_name`, `emergency_contact_phone`: Emergency contact
- `current_status`: Operational status (AVAILABLE, ON_DUTY, OFF_DUTY, ON_BREAK)
- `rating`: Performance rating (1-5 scale)
- `total_deliveries`: Lifetime delivery count
- `safety_score`: Safety performance score

### 3. Access Control

#### 3.1 roles
Role definitions for RBAC.

**Key Fields:**
- `organization_id`: Tenant scoping (NULL for system-wide roles)
- `name`: Role name
- `code`: Unique role code (ADMIN, MANAGER, DISPATCHER, DRIVER)
- `description`: Role description
- `is_system_role`: System-defined vs. custom role
- `level`: Role hierarchy level for permission inheritance

#### 3.2 permissions
Permission definitions for fine-grained access control.

**Key Fields:**
- `resource`: Resource type (order, driver, vehicle, etc.)
- `action`: Action type (read, create, update, delete)
- `scope`: Permission scope (all, own, managed, department, team)
- `code`: Combined permission code (resource:action:scope)
- `description`: Human-readable description
- `is_system_permission`: System-defined vs. custom

#### 3.3 role_permissions
Maps permissions to roles (many-to-many).

**Key Fields:**
- `role_id`: Role identifier (FK)
- `permission_id`: Permission identifier (FK)
- `organization_id`: Tenant scoping

#### 3.4 user_roles
Maps users to roles (many-to-many).

**Key Fields:**
- `user_id`: User identifier (FK)
- `role_id`: Role identifier (FK)
- `organization_id`: Tenant scoping
- `assigned_by_user_id`: Who granted this role
- `valid_from`: Role validity start date
- `valid_until`: Role validity end date (nullable)

#### 3.5 user_permissions
Direct permission assignments to users (override role permissions).

**Key Fields:**
- `user_id`: User identifier (FK)
- `permission_id`: Permission identifier (FK)
- `organization_id`: Tenant scoping
- `is_granted`: Whether permission is granted or explicitly denied
- `assigned_by_user_id`: Who granted this permission
- `valid_until`: Permission expiry (nullable)

### 4. Fleet Management

#### 4.1 vehicles
Vehicle inventory and details.

**Key Fields:**
- `organization_id`: Tenant scoping
- `vehicle_number`: Unique vehicle identifier
- `vehicle_type_id`: Vehicle type (FK to vehicle_types)
- `make`, `model`: Vehicle manufacturer and model
- `year`: Manufacturing year
- `vin`: Vehicle Identification Number
- `license_plate`: License plate number
- `license_plate_region`: Registration region
- `capacity_weight_kg`: Maximum weight capacity
- `capacity_volume_m3`: Maximum volume capacity
- `fuel_type`: Fuel type (GASOLINE, DIESEL, ELECTRIC, HYBRID)
- `status`: Vehicle status (ACTIVE, MAINTENANCE, INACTIVE, DECOMMISSIONED)
- `current_mileage_km`: Current odometer reading
- `last_maintenance_date`: Last maintenance date
- `next_maintenance_due_km`: Mileage for next maintenance
- `insurance_policy_number`: Insurance policy ID
- `insurance_expiry_date`: Insurance expiration
- `gps_device_id`: GPS tracking device ID
- `current_driver_id`: Currently assigned driver (FK to drivers)
- `current_location_lat`, `current_location_lng`: Last known location

#### 4.2 vehicle_types
Reference table for vehicle classifications.

**Key Fields:**
- `organization_id`: Tenant scoping (NULL for system-wide)
- `code`: Unique type code
- `name`: Type name
- `description`: Type description
- `default_capacity_weight_kg`: Default weight capacity
- `default_capacity_volume_m3`: Default volume capacity

#### 4.3 vehicle_maintenance_records
Maintenance history for vehicles.

**Key Fields:**
- `organization_id`: Tenant scoping
- `vehicle_id`: Vehicle identifier (FK)
- `maintenance_type`: Type of maintenance (ROUTINE, REPAIR, INSPECTION)
- `maintenance_date`: Service date
- `mileage_at_service_km`: Odometer reading at service
- `description`: Service description
- `cost`: Service cost
- `service_provider`: Service provider name
- `next_service_due_km`: Next service mileage
- `technician_name`: Technician who performed service
- `parts_replaced`: JSON array of parts replaced

#### 4.4 vehicle_inspections
Pre-trip and periodic vehicle inspections.

**Key Fields:**
- `organization_id`: Tenant scoping
- `vehicle_id`: Vehicle identifier (FK)
- `driver_id`: Inspector (FK to drivers)
- `inspection_type`: Type (PRE_TRIP, POST_TRIP, PERIODIC, RANDOM)
- `inspection_date`: Inspection timestamp
- `status`: Overall status (PASSED, FAILED, CONDITIONAL)
- `odometer_reading_km`: Mileage at inspection
- `notes`: Inspector notes
- `signature_url`: Digital signature reference

#### 4.5 vehicle_inspection_items
Individual checklist items for inspections.

**Key Fields:**
- `inspection_id`: Parent inspection (FK)
- `item_category`: Category (BRAKES, LIGHTS, TIRES, ENGINE, etc.)
- `item_name`: Checklist item name
- `status`: Item status (PASS, FAIL, N/A)
- `notes`: Item-specific notes
- `photo_url`: Evidence photo reference

#### 4.6 vehicle_assignments
Assignment history of vehicles to drivers.

**Key Fields:**
- `organization_id`: Tenant scoping
- `vehicle_id`: Vehicle identifier (FK)
- `driver_id`: Driver identifier (FK)
- `assigned_date`: Assignment start
- `expected_return_date`: Expected return
- `actual_return_date`: Actual return
- `start_mileage_km`: Odometer at assignment
- `end_mileage_km`: Odometer at return
- `assignment_status`: Status (ACTIVE, COMPLETED, CANCELLED)
- `assigned_by_user_id`: Who made the assignment

### 5. Customers & Orders

#### 5.1 customers
Customer/shipper information.

**Key Fields:**
- `organization_id`: Tenant scoping
- `customer_number`: Unique customer identifier
- `customer_type`: Type (INDIVIDUAL, BUSINESS)
- `company_name`: Company name (for business customers)
- `contact_name`: Primary contact
- `contact_phone`, `contact_email`: Contact details
- `billing_address`, `billing_city`, `billing_province`: Billing location
- `shipping_address`, `shipping_city`, `shipping_province`: Default shipping location
- `credit_limit`: Credit limit (if applicable)
- `payment_terms`: Payment terms
- `status`: Customer status (ACTIVE, SUSPENDED, INACTIVE)
- `rating`: Customer rating (1-5)

#### 5.2 orders
Delivery orders.

**Key Fields:**
- `organization_id`: Tenant scoping
- `order_number`: Unique order identifier
- `customer_id`: Customer (FK)
- `order_type`: Type (DELIVERY, PICKUP, ROUND_TRIP)
- `priority`: Priority level (LOW, NORMAL, HIGH, URGENT)
- `status`: Current status (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED)
- `origin_address`, `origin_lat`, `origin_lng`: Pickup location
- `destination_address`, `destination_lat`, `destination_lng`: Delivery location
- `scheduled_pickup_time`: Planned pickup timestamp
- `scheduled_delivery_time`: Planned delivery timestamp
- `actual_pickup_time`: Actual pickup timestamp
- `actual_delivery_time`: Actual delivery timestamp
- `assigned_driver_id`: Assigned driver (FK)
- `assigned_vehicle_id`: Assigned vehicle (FK)
- `distance_km`: Route distance
- `estimated_duration_minutes`: Estimated time
- `total_weight_kg`: Total cargo weight
- `total_volume_m3`: Total cargo volume
- `special_instructions`: Special handling instructions
- `delivery_proof_signature_url`: Delivery signature reference
- `delivery_proof_photo_url`: Delivery photo reference
- `customer_rating`: Customer satisfaction rating (1-5)
- `customer_feedback`: Customer comments

#### 5.3 order_items
Individual items within an order.

**Key Fields:**
- `order_id`: Parent order (FK)
- `item_number`: Item sequence number
- `cargo_type_id`: Cargo type (FK to cargo_types)
- `description`: Item description
- `quantity`: Item quantity
- `unit_of_measure`: UOM (PIECES, PALLETS, BOXES)
- `weight_kg`: Item weight
- `volume_m3`: Item volume
- `value`: Declared value
- `special_handling`: Special requirements (FRAGILE, REFRIGERATED, HAZMAT)

#### 5.4 order_status_history
Audit trail of order status changes.

**Key Fields:**
- `order_id`: Order identifier (FK)
- `from_status`: Previous status
- `to_status`: New status
- `changed_at`: Change timestamp
- `changed_by_user_id`: Who made the change
- `reason`: Reason for status change
- `location_lat`, `location_lng`: Location at status change
- `notes`: Additional notes

#### 5.5 cargo_types
Reference table for cargo classifications.

**Key Fields:**
- `organization_id`: Tenant scoping (NULL for system-wide)
- `code`: Unique type code
- `name`: Type name
- `description`: Type description
- `requires_special_handling`: Special handling flag
- `hazmat_classification`: Hazardous material classification

### 6. Routes & Navigation

#### 6.1 routes
Planned or executed routes.

**Key Fields:**
- `organization_id`: Tenant scoping
- `route_number`: Unique route identifier
- `driver_id`: Assigned driver (FK)
- `vehicle_id`: Assigned vehicle (FK)
- `route_date`: Route execution date
- `status`: Route status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `start_time`: Actual start time
- `end_time`: Actual end time
- `start_location_lat`, `start_location_lng`: Start coordinates
- `end_location_lat`, `end_location_lng`: End coordinates
- `total_distance_km`: Total route distance
- `total_duration_minutes`: Total route duration
- `planned_stops`: Number of planned stops
- `completed_stops`: Number of completed stops

#### 6.2 route_waypoints
Waypoints/stops along a route.

**Key Fields:**
- `route_id`: Parent route (FK)
- `order_id`: Associated order (FK, nullable)
- `sequence_number`: Stop sequence
- `waypoint_type`: Type (PICKUP, DELIVERY, BREAK, REFUEL)
- `address`: Waypoint address
- `latitude`, `longitude`: Waypoint coordinates
- `planned_arrival_time`: Planned arrival
- `planned_departure_time`: Planned departure
- `actual_arrival_time`: Actual arrival
- `actual_departure_time`: Actual departure
- `status`: Waypoint status (PENDING, ARRIVED, COMPLETED, SKIPPED)
- `notes`: Stop notes

### 7. Safety & Compliance

#### 7.1 safety_incidents
Safety incident reports.

**Key Fields:**
- `organization_id`: Tenant scoping
- `incident_number`: Unique incident identifier
- `incident_type`: Type (ACCIDENT, NEAR_MISS, VIOLATION, EQUIPMENT_FAILURE)
- `severity`: Severity level (LOW, MEDIUM, HIGH, CRITICAL)
- `incident_date`: Incident timestamp
- `driver_id`: Involved driver (FK)
- `vehicle_id`: Involved vehicle (FK)
- `order_id`: Related order (FK, nullable)
- `location_address`: Incident location
- `location_lat`, `location_lng`: Incident coordinates
- `description`: Detailed description
- `weather_conditions`: Weather at time of incident
- `road_conditions`: Road conditions
- `injuries`: Number of injuries
- `fatalities`: Number of fatalities
- `property_damage_estimate`: Estimated damage cost
- `police_report_number`: Police report reference
- `insurance_claim_number`: Insurance claim reference
- `status`: Incident status (REPORTED, INVESTIGATING, RESOLVED, CLOSED)
- `reported_by_user_id`: Who reported
- `assigned_investigator_user_id`: Assigned investigator

#### 7.2 safety_incident_attachments
Evidence attachments for incidents.

**Key Fields:**
- `incident_id`: Parent incident (FK)
- `attachment_type`: Type (PHOTO, VIDEO, DOCUMENT, AUDIO)
- `file_url`: File storage reference
- `file_name`: Original file name
- `file_size_bytes`: File size
- `description`: Attachment description
- `uploaded_by_user_id`: Uploader

#### 7.3 safety_incident_actions
Corrective actions for incidents.

**Key Fields:**
- `incident_id`: Parent incident (FK)
- `action_type`: Type (DISCIPLINARY, TRAINING, EQUIPMENT_REPAIR, POLICY_UPDATE)
- `description`: Action description
- `assigned_to_user_id`: Action assignee
- `due_date`: Action due date
- `completed_date`: Action completion date
- `status`: Action status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `notes`: Action notes

#### 7.4 driver_licenses
Driver license tracking.

**Key Fields:**
- `driver_id`: Driver identifier (FK)
- `license_number`: License number
- `license_type`: License type/class
- `issuing_authority`: Issuing authority
- `issue_date`: Issue date
- `expiry_date`: Expiration date
- `status`: License status (VALID, EXPIRED, SUSPENDED, REVOKED)
- `restrictions`: License restrictions (JSON array)
- `endorsements`: License endorsements (JSON array)
- `verification_date`: Last verification date
- `document_url`: License document reference

#### 7.5 driver_certifications
Driver certifications and training.

**Key Fields:**
- `driver_id`: Driver identifier (FK)
- `certification_type`: Type (HAZMAT, FORKLIFT, FIRST_AID, DEFENSIVE_DRIVING)
- `certification_number`: Certificate number
- `issuing_authority`: Issuing authority
- `issue_date`: Issue date
- `expiry_date`: Expiration date
- `status`: Status (VALID, EXPIRED, SUSPENDED)
- `document_url`: Certificate document reference

#### 7.6 driver_violations
Driver violations and infractions.

**Key Fields:**
- `organization_id`: Tenant scoping
- `driver_id`: Driver identifier (FK)
- `violation_type`: Type (SPEEDING, UNSAFE_DRIVING, LOG_VIOLATION, SUBSTANCE)
- `violation_date`: Violation date
- `description`: Violation description
- `location`: Violation location
- `citation_number`: Citation/ticket number
- `issuing_authority`: Authority (POLICE, DOT, COMPANY)
- `fine_amount`: Fine amount
- `points`: Points assessed
- `status`: Status (PENDING, PAID, DISPUTED, RESOLVED)
- `resolution_date`: Resolution date
- `resolution_notes`: Resolution notes

#### 7.7 driver_performance_metrics
Driver performance tracking.

**Key Fields:**
- `organization_id`: Tenant scoping
- `driver_id`: Driver identifier (FK)
- `metric_period_start`: Period start date
- `metric_period_end`: Period end date
- `total_deliveries`: Deliveries in period
- `on_time_deliveries`: On-time deliveries
- `total_distance_km`: Total distance driven
- `total_drive_time_hours`: Total drive time
- `fuel_efficiency_l_per_100km`: Fuel efficiency
- `safety_score`: Safety score (0-100)
- `customer_rating_avg`: Average customer rating
- `incidents_count`: Number of incidents
- `violations_count`: Number of violations
- `harsh_braking_events`: Harsh braking count
- `harsh_acceleration_events`: Harsh acceleration count
- `speeding_events`: Speeding event count

### 8. Dictionaries & Reference Data

#### 8.1 dictionaries
Dictionary categories for reference data.

**Key Fields:**
- `organization_id`: Tenant scoping (NULL for system-wide)
- `code`: Dictionary code (STATUS_TYPES, PRIORITY_LEVELS, etc.)
- `name`: Dictionary name
- `description`: Dictionary description
- `is_system_dictionary`: System vs. custom dictionary
- `allow_custom_values`: Allow custom entries

#### 8.2 dictionary_items
Dictionary values.

**Key Fields:**
- `dictionary_id`: Parent dictionary (FK)
- `code`: Item code
- `value`: Item display value
- `display_order`: Sort order
- `is_default`: Default selection flag
- `is_active`: Active status
- `metadata`: Additional metadata (JSON)

#### 8.3 regions
Geographic regions for operations.

**Key Fields:**
- `organization_id`: Tenant scoping
- `parent_region_id`: Parent region for hierarchy
- `code`: Region code
- `name`: Region name
- `region_type`: Type (COUNTRY, PROVINCE, CITY, DISTRICT, ZONE)
- `boundary_geojson`: GeoJSON boundary definition
- `center_lat`, `center_lng`: Region center point
- `is_service_area`: Active service area flag

#### 8.4 service_areas
Service coverage areas.

**Key Fields:**
- `organization_id`: Tenant scoping
- `region_id`: Associated region (FK)
- `name`: Service area name
- `boundary_geojson`: GeoJSON boundary
- `is_active`: Active status
- `service_level`: Service level (STANDARD, EXPRESS, PREMIUM)

### 9. System & Audit

#### 9.1 audit_logs
Comprehensive audit trail.

**Key Fields:**
- `organization_id`: Tenant scoping
- `user_id`: Acting user (FK)
- `action`: Action type (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT)
- `entity_type`: Affected entity type (users, orders, vehicles, etc.)
- `entity_id`: Affected entity ID
- `old_values`: Previous values (JSON)
- `new_values`: New values (JSON)
- `ip_address`: User IP address
- `user_agent`: User agent string
- `request_id`: Request correlation ID
- `timestamp`: Action timestamp

## Common Field Patterns

### Audit Fields (all tables)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `created_by_user_id` BIGINT UNSIGNED
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `updated_by_user_id` BIGINT UNSIGNED
- `deleted_at` TIMESTAMP NULL
- `version` INT DEFAULT 1 (for optimistic locking)

### Tenant Scoping
- `organization_id` BIGINT UNSIGNED (in every table except organizations)

## Indexes Strategy

### Primary Indexes
- Primary key on `id` for all tables
- Composite primary keys for mapping tables

### Foreign Key Indexes
- Index on all foreign key columns
- Composite indexes on (organization_id, foreign_key)

### Query Optimization Indexes
- Composite index on (organization_id, status) for frequently filtered tables
- Index on commonly searched fields (order_number, driver_number, etc.)
- Full-text indexes on description and notes fields
- Spatial indexes on lat/lng columns for geospatial queries

### Unique Constraints
- Unique on (organization_id, code/number) for business identifiers
- Unique on email and username in users table

## Data Isolation Implementation

### Application-Level Enforcement
All queries must include organization_id in WHERE clause:

```sql
-- Bad - data leakage risk
SELECT * FROM orders WHERE status = 'PENDING';

-- Good - tenant isolated
SELECT * FROM orders 
WHERE organization_id = ? AND status = 'PENDING';
```

### Database-Level Enforcement (Recommended)
Use MySQL views with security context:

```sql
CREATE VIEW v_orders AS
SELECT * FROM orders 
WHERE organization_id = @current_organization_id;
```

## Soft Delete Pattern

All tables support soft deletion using `deleted_at` timestamp:

```sql
-- Soft delete
UPDATE orders 
SET deleted_at = NOW(), 
    updated_by_user_id = ?
WHERE id = ? AND organization_id = ?;

-- Query active records
SELECT * FROM orders 
WHERE organization_id = ? 
  AND deleted_at IS NULL;
```

## Migration Strategy

1. **Initial Schema**: Execute core_tables.sql to create all tables
2. **Seed Data**: Populate system dictionaries and reference data
3. **Version Control**: Use migration tools (Flyway, Liquibase) for subsequent changes
4. **Backwards Compatibility**: All migrations must be backwards compatible
5. **Rollback Plan**: Test rollback for every migration

## Performance Considerations

1. **Partitioning**: Consider partitioning large tables (audit_logs, order_status_history) by date
2. **Archival**: Archive old records to history tables after retention period
3. **Read Replicas**: Use read replicas for reporting and analytics
4. **Connection Pooling**: Configure appropriate connection pool sizes
5. **Query Optimization**: Monitor slow query log and optimize problematic queries

## Security Recommendations

1. **Principle of Least Privilege**: Grant minimal required permissions
2. **Separate User Accounts**: Different accounts for app, admin, read-only access
3. **Encrypted Connections**: Use SSL/TLS for all database connections
4. **Data Encryption**: Encrypt sensitive fields (passwords, PII) at rest
5. **Audit Everything**: Enable MySQL audit log for compliance
6. **Regular Backups**: Automated daily backups with point-in-time recovery
7. **Backup Testing**: Regular restore testing to validate backup integrity

## Maintenance Tasks

### Daily
- Monitor slow queries
- Check replication lag
- Review error logs
- Validate backups

### Weekly
- Optimize tables with high fragmentation
- Update table statistics
- Review index usage
- Archive old audit logs

### Monthly
- Review and optimize slow queries
- Analyze storage growth trends
- Update capacity planning
- Security patch review

## Schema Version

- **Version**: 1.0.0
- **Last Updated**: 2024
- **MySQL Version**: 8.0+
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Engine**: InnoDB
- **Row Format**: DYNAMIC

## Related Documentation

- [API Documentation](../api/README.md)
- [Architecture Overview](../architecture/overview.md)
- [Migration Guide](./migrations/README.md)
- [Backup & Recovery](./backup/README.md)
