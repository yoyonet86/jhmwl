# 金鸿马物流安全平台 - Architecture Overview

## Executive Summary

The 金鸿马物流安全平台 (Jin Hong Ma Logistics Safety Platform) is a comprehensive logistics management and safety platform designed to support multiple client types with distinct operational needs. The architecture emphasizes front/back separation with a modern Angular + Ionic-based frontend and an ASP.NET Core microservices backend, leveraging MySQL for persistent storage.

---

## 1. Architecture High-Level Overview

### 1.1 Architectural Pattern

**Front/Back Separation with Microservices Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Angular + Ionic)               │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Web SPA         │  │  Mobile App  │  │  Admin Portal   │   │
│  │  (Chrome, etc.)  │  │  (iOS/Android)  │  (Desktop)      │   │
│  └──────────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    REST API / WebSocket
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│            API GATEWAY & SERVICE MESH (ASP.NET Core)             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐  ┌────────────▼──────┐  ┌─────────────▼───┐
│ Auth Service   │  │ Core Microservices│  │ Utility Services │
│ - JWT/OAuth    │  │                   │  │                 │
│ - SSO           │  │ • User Service    │  │ • Dictionary    │
│ - Permissions  │  │ • Driver Service  │  │ • Notification  │
│ - Audit        │  │ • Vehicle Service │  │ • File Upload   │
└────────────────┘  │ • Order Service   │  │ • Reporting     │
                    │ • Route Service   │  │ • Cache Layer   │
                    │ • GPS/Location    │  │                 │
                    │ • Safety Service  │  │                 │
                    │ • Dispatch        │  │                 │
                    └───────────────────┘  └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐  ┌────────────▼──────┐  ┌─────────────▼───┐
│   MySQL DB     │  │   Redis Cache    │  │  File Storage   │
│                │  │                   │  │  (S3/OSS)       │
│ • Core Tables  │  │ - Sessions       │  │                 │
│ • Audit Logs   │  │ - Tokens         │  │ • Documents     │
│ • Metadata     │  │ - Permissions    │  │ • Images        │
└────────────────┘  │ - Hot Data       │  │ • GPS Tracks    │
                    └───────────────────┘  └─────────────────┘
```

---

## 2. Client Types & Platform Management

### 2.1 Four Client Types

The platform serves four distinct user archetypes, each with specialized interfaces and capabilities:

#### 1. **Logistics Manager (物流经理)**
- **Primary Role**: Oversee fleet operations, drivers, and orders
- **Key Features**:
  - Dashboard with real-time vehicle tracking
  - Driver management and performance analytics
  - Order dispatch and routing
  - Safety incident monitoring
  - Team management (create users, assign roles)
- **Platform Priority**: **HIGHEST** - Core business operations depend on this role
- **Client Types**: Web SPA (desktop primary), Mobile (secondary for field verification)

#### 2. **Driver (驾驶员)**
- **Primary Role**: Execute deliveries and report on-route status
- **Key Features**:
  - Real-time GPS tracking/navigation
  - Order details and step-by-step directions
  - Safety checklist compliance
  - Photo/signature capture for deliveries
  - Incident/accident reporting
  - Daily vehicle inspection logs
- **Platform Priority**: **CRITICAL** - Direct impact on operations
- **Client Types**: Mobile app (primary, iOS/Android via Ionic)

#### 3. **Dispatcher (调度员)**
- **Primary Role**: Real-time assignment and optimization of routes
- **Key Features**:
  - Live vehicle and driver status monitoring
  - Dynamic order assignment
  - Route optimization and suggestion
  - Communication with drivers
  - Emergency response coordination
- **Platform Priority**: **HIGH** - Time-sensitive operations
- **Client Types**: Web SPA (desktop), Mobile for field updates

#### 4. **Administrator/Platform Manager (系统管理员)**
- **Primary Role**: System configuration, user management, and governance
- **Key Features**:
  - Complete user and permission management
  - System configuration and rules
  - Audit log viewing and export
  - Analytics and reporting
  - Data management and cleanup
- **Platform Priority**: **MEDIUM** - Supporting role, but critical for system health
- **Client Types**: Admin Portal (desktop only), specialized interfaces

### 2.2 Platform Management Priority Hierarchy

```
Operations Tier (Highest Priority)
├── Driver (Mobile App) - Direct field operations
├── Logistics Manager (Web) - Strategic oversight
└── Dispatcher (Web) - Real-time coordination

Support Tier (Medium Priority)
└── Administrator (Admin Portal) - System maintenance & governance
```

---

## 3. Technology Stack

### 3.1 Frontend

**Framework**: Angular + Ionic

- **Angular**: SPA framework for web and admin portal
- **Ionic**: Cross-platform mobile framework (iOS, Android)
- **Communication**: 
  - REST APIs (primary)
  - WebSockets (real-time GPS tracking, notifications)
- **State Management**: NgRx or Akita
- **UI Framework**: Ionic components + custom Angular components

### 3.2 Backend

**Framework**: ASP.NET Core

- **API Gateway**: Custom or API Gateway pattern implementation
- **Service Architecture**: Microservices
- **Inter-service Communication**: 
  - gRPC (high-performance service-to-service)
  - Message queues (RabbitMQ/Azure Service Bus for async operations)
- **Authentication**: JWT/OAuth2
- **Caching**: Redis
- **Database**: MySQL (shared and service-specific databases)

### 3.3 Data Storage

**Primary Database**: MySQL
- InnoDB engine with transactional support
- Replication for high availability
- Per-service databases or shared schema with isolation

**Cache Layer**: Redis
- Session storage
- Token blacklists
- Permission caching
- Hot data (active orders, vehicle positions)

**File Storage**: S3-compatible (AWS S3, Alibaba OSS, MinIO)
- Document uploads
- Photo evidence
- GPS track files
- Audit logs (optional)

---

## 4. Service Boundaries

### 4.1 Core Microservices

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE CATALOG                           │
└─────────────────────────────────────────────────────────────┘

┌─ AUTHENTICATION & AUTHORIZATION DOMAIN ─────────────────────┐
│                                                              │
│ Service: Auth Service                                       │
│ ├─ User login/logout                                        │
│ ├─ JWT token generation and validation                      │
│ ├─ OAuth2/SSO integration                                   │
│ ├─ Multi-factor authentication                              │
│ └─ Token refresh and expiration management                  │
│                                                              │
│ Service: Permission Service                                 │
│ ├─ Role definition and management                           │
│ ├─ Permission assignment (fine-grained)                     │
│ ├─ Permission validation and caching                        │
│ └─ Audit trail of permission changes                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ USER MANAGEMENT DOMAIN ────────────────────────────────────┐
│                                                              │
│ Service: User Service                                       │
│ ├─ User CRUD operations                                     │
│ ├─ Profile management                                       │
│ ├─ Department/team associations                             │
│ ├─ Deactivation/reactivation                                │
│ ├─ User search and listing                                  │
│ └─ User-role mapping                                        │
│                                                              │
│ Service: Driver Service                                     │
│ ├─ Driver profile management                                │
│ ├─ License verification and expiry tracking                 │
│ ├─ Safety certificate management                            │
│ ├─ Performance metrics and ratings                          │
│ ├─ Driver status (available, on-duty, off-duty)             │
│ └─ Emergency contact information                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ FLEET MANAGEMENT DOMAIN ───────────────────────────────────┐
│                                                              │
│ Service: Vehicle Service                                    │
│ ├─ Vehicle registration and profile                         │
│ ├─ Vehicle maintenance schedule tracking                    │
│ ├─ Insurance and compliance documentation                   │
│ ├─ GPS device management and assignment                     │
│ ├─ Current location and status                              │
│ ├─ Vehicle decommissioning                                  │
│ └─ Vehicle utilization metrics                              │
│                                                              │
│ Service: GPS/Location Service                               │
│ ├─ Real-time location updates from vehicles                 │
│ ├─ Location history and track logging                       │
│ ├─ Geofencing and boundary notifications                    │
│ ├─ Route tracking and playback                              │
│ ├─ Location validation and filtering                        │
│ └─ WebSocket push for live tracking                         │
│                                                              │
│ Service: Safety Service                                     │
│ ├─ Safety incident reporting                                │
│ ├─ Accident documentation                                   │
│ ├─ Vehicle inspection checklists                            │
│ ├─ Driver behavior monitoring (harsh events)                │
│ ├─ Safety metrics and analytics                             │
│ ├─ Alert generation and escalation                          │
│ └─ Evidence collection (photos, videos)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ ORDER & ROUTING DOMAIN ────────────────────────────────────┐
│                                                              │
│ Service: Order Service                                      │
│ ├─ Order creation and lifecycle management                  │
│ ├─ Order status tracking (pending, assigned, in-transit...)│
│ ├─ Order details and item management                        │
│ ├─ Customer information management                          │
│ ├─ Delivery proof and signature capture                     │
│ ├─ Order history and archive                                │
│ ├─ Order cancellation and modification                      │
│ └─ Order-to-vehicle assignment                              │
│                                                              │
│ Service: Route Service                                      │
│ ├─ Route creation and optimization                          │
│ ├─ Route sequencing and waypoint management                 │
│ ├─ Estimated time of arrival (ETA) calculation              │
│ ├─ Traffic integration (optional third-party)               │
│ ├─ Route alternatives and re-optimization                   │
│ ├─ Historical route analytics                               │
│ └─ Multi-order batch optimization                           │
│                                                              │
│ Service: Dispatch Service                                   │
│ ├─ Intelligent order-to-driver assignment                   │
│ ├─ Load balancing across drivers                            │
│ ├─ Capacity management (weight, volume, special handling)   │
│ ├─ Availability and skill matching                          │
│ ├─ Reassignment and cancellation handling                   │
│ ├─ SLA management and breach notification                   │
│ └─ Dispatch event logging and audit                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ REFERENCE DATA & UTILITY DOMAIN ──────────────────────────┐
│                                                              │
│ Service: Dictionary Service                                 │
│ ├─ Enum/reference data management                           │
│ ├─ System constants (status codes, priority levels)         │
│ ├─ Region/area definitions                                  │
│ ├─ Vehicle types and cargo classifications                  │
│ ├─ Service type definitions                                 │
│ ├─ Dictionary caching and versioning                        │
│ └─ Client-side sync for offline support                     │
│                                                              │
│ Service: Notification Service                               │
│ ├─ Email notifications                                      │
│ ├─ SMS notifications                                        │
│ ├─ Push notifications (mobile)                              │
│ ├─ In-app notifications                                     │
│ ├─ Notification template management                         │
│ ├─ Notification preferences and opt-out                     │
│ └─ Notification delivery retry logic                        │
│                                                              │
│ Service: File Service                                       │
│ ├─ Document upload and storage                              │
│ ├─ Image processing and resizing                            │
│ ├─ File download and streaming                              │
│ ├─ File retention and cleanup policies                      │
│ ├─ Virus/malware scanning (optional)                        │
│ ├─ Access control for sensitive files                       │
│ └─ File metadata indexing and search                        │
│                                                              │
│ Service: Reporting & Analytics Service                      │
│ ├─ Predefined report generation                             │
│ ├─ Custom report builder                                    │
│ ├─ Export functionality (PDF, Excel, CSV)                   │
│ ├─ Dashboard data aggregation                               │
│ ├─ KPI calculation and tracking                             │
│ ├─ Historical data analysis                                 │
│ └─ Real-time metrics via WebSocket                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ SYSTEM & OPERATIONS DOMAIN ────────────────────────────────┐
│                                                              │
│ Service: Audit Service                                      │
│ ├─ Activity logging for all entities                        │
│ ├─ User action tracking                                     │
│ ├─ Data change auditing (who, what, when)                   │
│ ├─ Audit log querying and filtering                         │
│ ├─ Log retention and archival                               │
│ ├─ Compliance reporting                                     │
│ └─ Suspicious activity detection                            │
│                                                              │
│ Service: Configuration Service                              │
│ ├─ System-wide configuration management                     │
│ ├─ Feature flags and toggles                                │
│ ├─ Business rules configuration                             │
│ ├─ SLA definitions                                          │
│ ├─ Pricing and cost calculation rules                       │
│ └─ Configuration versioning and rollback                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Service Communication Patterns

**Synchronous (Request-Response)**:
- REST APIs for client-to-backend communication
- gRPC for high-performance service-to-service calls (auth, permission checks)

**Asynchronous (Event-Driven)**:
- Message queue (RabbitMQ/Service Bus) for:
  - Order state changes
  - Safety incident notifications
  - Location update broadcasts
  - Report generation triggers

**Real-Time Bidirectional**:
- WebSockets for:
  - Live GPS tracking feeds
  - Push notifications
  - Real-time order status updates
  - Driver-dispatcher communication

---

## 5. Data Isolation Strategy

### 5.1 Multi-Tenancy & Data Segregation

The platform supports a **single-tenant or multi-organizational setup** with the following isolation strategy:

#### Organizational Hierarchy
```
Platform
├─ Organization/Company A
│  ├─ Department 1
│  │  ├─ Team A
│  │  └─ Team B
│  └─ Department 2
│     └─ Team C
└─ Organization/Company B
   └─ Department 1
      └─ Team A
```

#### Data Isolation Levels

1. **Database-Level Isolation** (Recommended for large deployments)
   - Separate MySQL database per organization
   - Automatic schema provisioning
   - Backup and recovery per tenant
   - Query performance isolation

2. **Schema-Level Isolation**
   - Shared database, separate schemas per organization
   - Cost-effective for smaller deployments
   - Simplified backup and replication

3. **Row-Level Isolation** (Budget option)
   - Shared database and schema
   - Organization ID column in all tables
   - Row-level security (RLS) policies enforced in application layer
   - **Note**: Requires extremely careful query filtering

### 5.2 Data Isolation Rules

**Every data access must include tenant/organization context:**

```csharp
// Bad - will cause data leakage
var orders = dbContext.Orders.Where(o => o.Status == "Pending").ToList();

// Good - enforces tenant isolation
var orders = dbContext.Orders
    .Where(o => o.OrganizationId == currentUserOrgId && 
                o.Status == "Pending")
    .ToList();
```

**Isolation enforcement points:**
1. Database layer - RLS policies (if supported)
2. ORM layer - Query filters (EF Core Global Query Filters)
3. API layer - Authorization middleware validates tenant context
4. Business logic - Explicit tenant parameter passing

### 5.3 Cross-Organization Scenarios

- **Platform Admins**: Can view limited analytics across organizations (never raw data)
- **Inter-company Logistics**: Managed through explicit partner relationships and limited shared data views
- **Reports**: Aggregated and anonymized across organizations only with explicit permission

---

## 6. Fine-Grained Permission Model

### 6.1 Permission Architecture

The system uses a **Role-Based Access Control (RBAC) with Attribute-Based Access Control (ABAC)** hybrid model:

```
User
  ├─ Roles (RBAC)
  │  ├─ Logistics Manager
  │  ├─ Driver
  │  ├─ Dispatcher
  │  ├─ Safety Officer
  │  └─ Administrator
  │
  └─ Attributes (ABAC)
     ├─ Department ID
     ├─ Region/Area
     ├─ Vehicle Type Access
     ├─ Subordinate User IDs (manager scope)
     └─ Custom attributes
```

### 6.2 Permission Structure

**Format**: `resource:action[:attribute]`

Examples:
- `order:read` - Can view any order
- `order:read:own-dispatch` - Can view only orders assigned to their dispatch area
- `order:create` - Can create new orders
- `order:update:status` - Can update order status
- `driver:read:managed` - Can view drivers they manage
- `driver:read:self` - Can only view own driver profile
- `vehicle:update` - Can modify vehicle information
- `permission:grant` - Can assign permissions to others
- `audit:read` - Can view audit logs
- `report:export` - Can export reports

### 6.3 Role-Based Permission Templates

#### Role: Driver
```yaml
Permissions:
  - order:read:assigned         # Only assigned orders
  - order:update:status         # Update order status
  - location:write:own          # Submit own GPS location
  - safety:report:incident      # Report safety incidents
  - document:read:assigned      # View assigned route documents
  - profile:read:self           # View own profile
  - profile:update:self         # Update own profile
  - communication:read:messages # Receive notifications/messages
```

#### Role: Dispatcher
```yaml
Permissions:
  - order:read                  # All orders
  - order:create                # Create orders
  - order:assign                # Assign to drivers/vehicles
  - driver:read                 # View all drivers
  - driver:update:status        # Update driver status
  - vehicle:read                # View all vehicles
  - vehicle:update:status       # Update vehicle status
  - location:read:all           # View all vehicle locations
  - route:optimize              # Optimize routes
  - communication:send:message  # Send messages to drivers
  - report:read:dispatch-area   # View reports for own area
```

#### Role: Logistics Manager
```yaml
Permissions:
  - order:read                  # All orders
  - order:create
  - order:cancel
  - driver:read
  - driver:create
  - driver:update
  - driver:deactivate           # Soft delete
  - vehicle:read
  - vehicle:create
  - vehicle:update
  - vehicle:decommission
  - team:manage                 # Create/modify team
  - user:manage                 # Manage team members
  - report:read:all             # All reports
  - report:export
  - location:read:all
  - safety:read:all             # View safety incidents
  - safety:escalate
```

#### Role: Administrator
```yaml
Permissions:
  - '*:*'                       # All permissions (unrestricted)
  
# OR more restrictive:
  - user:read
  - user:create
  - user:update
  - user:deactivate
  - role:manage
  - permission:grant
  - permission:revoke
  - audit:read
  - configuration:read
  - configuration:update
  - system:health
  - backup:manage
```

### 6.4 Attribute-Based Filtering

**Scenario**: Manager can only view/manage drivers in their assigned regions

```yaml
User: John (Logistics Manager)
Permissions:
  - driver:read:managed
  - driver:update:managed
  
Attributes:
  - Assigned Regions: [Region_North, Region_East]
  - Managed Team IDs: [Team_001, Team_002]

Query: SELECT drivers WHERE
        - RegionId IN ('Region_North', 'Region_East') 
        - TeamId IN ('Team_001', 'Team_002')
```

### 6.5 Permission Validation Flow

```
Client Request
    │
    ▼
┌─────────────────────┐
│  Extract JWT Token  │
└─────────────────────┘
    │
    ▼
┌──────────────────────────┐
│  Middleware: Validate    │
│  Token + Get User Context│
└──────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│  Load User Roles & Perms     │
│  (from cache if available)   │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│  Check Permission            │
│  [resource:action]           │
│  + Attribute Matching        │
└──────────────────────────────┘
    │
    ├─ Denied ──────▶ 403 Forbidden
    │
    └─ Allowed ─────▶ Process Request
                         │
                         ▼
                    ┌──────────────────────┐
                    │ Apply Row-Level Filters│
                    │ (org, region, team)   │
                    └──────────────────────┘
                         │
                         ▼
                    Return Results
```

### 6.6 Permission Caching

To optimize performance:

- **Permissions cached in Redis** with TTL of 5-15 minutes
- **Cache key**: `permissions:{userId}:{organizationId}`
- **Invalidation triggers**:
  - User role change
  - Permission assignment/revocation
  - Admin invalidation
  - Explicit cache clear
  
```csharp
// Service with permission caching
public async Task<bool> HasPermissionAsync(int userId, string permission)
{
    var cacheKey = $"permissions:{userId}:{GetCurrentOrgId()}";
    var permissions = await _cache.GetAsync<List<string>>(cacheKey);
    
    if (permissions == null)
    {
        permissions = await _db.GetUserPermissionsAsync(userId);
        await _cache.SetAsync(cacheKey, permissions, TimeSpan.FromMinutes(10));
    }
    
    return permissions.Contains(permission);
}
```

---

## 7. Component Architecture

### 7.1 Frontend Component Structure (Angular/Ionic)

```
src/
├── app/
│  ├── shared/                      # Shared across all features
│  │  ├── components/               # UI components (navbar, modals, etc.)
│  │  ├── directives/               # Custom directives
│  │  ├── pipes/                    # Custom pipes
│  │  ├── interceptors/             # HTTP interceptors (auth, error handling)
│  │  ├── guards/                   # Route guards (auth, permission checks)
│  │  ├── services/                 # Shared services
│  │  │  ├── auth.service.ts
│  │  │  ├── permission.service.ts
│  │  │  ├── notification.service.ts
│  │  │  └── api.service.ts
│  │  └── models/                   # Shared interfaces/models
│  │
│  ├── features/                    # Feature modules
│  │  ├── driver/
│  │  │  ├── components/
│  │  │  │  ├── order-list/
│  │  │  │  ├── order-detail/
│  │  │  │  ├── navigation/
│  │  │  │  ├── safety-report/
│  │  │  │  └── ...
│  │  │  ├── services/
│  │  │  └── driver.module.ts
│  │  │
│  │  ├── dispatcher/
│  │  │  ├── components/
│  │  │  │  ├── dashboard/
│  │  │  │  ├── map-view/
│  │  │  │  ├── order-assignment/
│  │  │  │  ├── driver-management/
│  │  │  │  └── ...
│  │  │  ├── services/
│  │  │  └── dispatcher.module.ts
│  │  │
│  │  ├── logistics-manager/
│  │  │  ├── components/
│  │  │  │  ├── dashboard/
│  │  │  │  ├── analytics/
│  │  │  │  ├── team-management/
│  │  │  │  ├── vehicle-fleet/
│  │  │  │  └── ...
│  │  │  ├── services/
│  │  │  └── logistics-manager.module.ts
│  │  │
│  │  ├── admin/
│  │  │  ├── components/
│  │  │  │  ├── user-management/
│  │  │  │  ├── role-management/
│  │  │  │  ├── permission-settings/
│  │  │  │  ├── audit-logs/
│  │  │  │  └── ...
│  │  │  ├── services/
│  │  │  └── admin.module.ts
│  │  │
│  │  └── auth/
│  │     ├── components/
│  │     │  ├── login/
│  │     │  ├── mfa/
│  │     │  └── password-reset/
│  │     └── auth.module.ts
│  │
│  ├── layouts/                     # Layout components
│  │  ├── mobile-layout/
│  │  │  ├── bottom-navigation/
│  │  │  ├── header/
│  │  │  └── mobile-layout.component.ts
│  │  │
│  │  └── desktop-layout/
│  │     ├── sidebar-navigation/
│  │     ├── header/
│  │     ├── footer/
│  │     └── desktop-layout.component.ts
│  │
│  ├── state/                       # NgRx store
│  │  ├── user/
│  │  ├── orders/
│  │  ├── drivers/
│  │  ├── vehicles/
│  │  └── ui/
│  │
│  └── app-routing.module.ts
│
├── environments/                   # Environment configs
│  ├── environment.ts
│  └── environment.prod.ts
│
└── styles/                         # Global styles
   ├── variables.scss
   ├── mixins.scss
   └── responsive.scss
```

### 7.2 Navigation Pattern

#### Mobile (iOS/Android via Ionic)
**Primary**: Bottom Tab Navigation
```
┌────────────────────────────────────┐
│            Header / Title           │
├────────────────────────────────────┤
│                                    │
│                                    │
│          Main Content Area         │
│                                    │
│                                    │
├────────────────────────────────────┤
│ 🏠   📦   📍   👤   ≡              │
│ Home Orders Tracking Profile Menu  │
└────────────────────────────────────┘
```

**Role-specific tabs:**
- **Driver**: Home, My Orders, Live Tracking, Profile, More
- **Dispatcher**: Map, Orders, Drivers, Alerts, More
- **Logistics Manager**: Dashboard, Orders, Fleet, Analytics, Profile

**Secondary Navigation**: Hamburger menu (≡) for less frequent actions

#### Desktop/Web
**Primary**: Sidebar Navigation
```
┌───────────────────────────────────────────────────┐
│  Company Logo | App Name | User Menu | Notifications
├───────────────────────────────────────────────────┤
│ 🏠 Dashboard                                       │
│ 📦 Orders                                          │
│ 📍 Tracking                                        │
│ 👥 Team Management                                 │
│ 🚗 Fleet Management                                │
│ 📊 Analytics & Reports                             │
│ ⚙️ Settings                                        │
│ 🔒 Audit Logs                                      │
│ ❓ Help & Support                                  │
│ 🚪 Logout                                          │
└─────┬─────────────────────────────────────────────┘
      │
      └─────► [Main Content Area with breadcrumb]
```

**Secondary Navigation**: Top action bar and context menus

#### Responsive Design

- **Breakpoints**:
  - Mobile: < 640px (portrait primary)
  - Tablet: 640px - 1024px (landscape support)
  - Desktop: > 1024px

- **Layout Switching**:
  - Automatic switch from bottom nav to side nav at tablet breakpoint
  - Collapsible sidebar on tablet
  - Full sidebar on desktop

---

## 8. Deployment Architecture

### 8.1 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN / WAF                             │
│              (CloudFlare / Alibaba WAF)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼──────┐  ┌─────────▼──────┐
│  Web (SPA)     │  │  Mobile API   │  │  Admin Portal  │
│  Hosting       │  │  Gateway      │  │  Hosting       │
│  (Static)      │  │  (Load Bal.)  │  │  (Static)      │
└────────────────┘  └────────────────┘  └────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────────────────▼────────────────────▼────────┐
│              Kubernetes Cluster (K8s)                     │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth Pod    │  │  User Pod    │  │  Order Pod   │   │
│  │  (x3 inst.)  │  │  (x2 inst.)  │  │  (x3 inst.)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Driver Pod   │  │ Vehicle Pod  │  │ Dispatch Pod │   │
│  │  (x2 inst.)  │  │  (x2 inst.)  │  │  (x3 inst.)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Utility Services (x2 instances each)      │   │
│  │  ├─ Dictionary Service                           │   │
│  │  ├─ Notification Service                         │   │
│  │  ├─ File Service                                 │   │
│  │  ├─ Reporting Service                            │   │
│  │  ├─ Audit Service                                │   │
│  │  └─ GPS/Location Service                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Message Queue (RabbitMQ / Service Bus)  │   │
│  │          (Cluster mode, x3 nodes minimum)        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└──────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼──────┐  ┌─────────▼──────┐
│   MySQL       │  │   Redis       │  │ File Storage   │
│   Primary DB  │  │   Cluster     │  │ (S3/OSS/MinIO) │
│   (HA Mode)   │  │   (3 nodes)   │  │                │
│               │  │   + Sentinel  │  │ Backup Storage │
│ Replicas (x2)│  │               │  │                │
└───────────────┘  └───────────────┘  └────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼──────┐  ┌─────────▼──────┐
│  Logging       │  │  Monitoring   │  │  Backup System │
│  (ELK/EFK)     │  │  (Prometheus/ │  │  (Daily)       │
│  (Aggregation) │  │   Grafana)    │  │  (Replication) │
└────────────────┘  └───────────────┘  └────────────────┘
```

### 8.2 Deployment Strategy

**Containerization**:
- Docker containers for all services
- Multi-stage builds for optimization
- One container image per service

**Orchestration**:
- Kubernetes for microservices orchestration
- Helm charts for templated deployments
- Namespace isolation (dev, staging, prod)

**CI/CD Pipeline**:
```
Code Push
    ↓
[Git Hooks: Lint, Format, Test]
    ↓
[GitHub Actions / GitLab CI]
    ├─ Build & Test
    ├─ Security Scan (SAST, Dependency Check)
    ├─ Build Docker Images
    ├─ Push to Registry
    ├─ Deploy to Staging
    └─ Run Integration Tests
    ↓
[Manual Approval]
    ↓
Deploy to Production
    ├─ Blue-Green Deployment
    ├─ Health Checks
    └─ Smoke Tests
```

**Database Deployment**:
- Flyway/Liquibase for schema migrations
- Backwards-compatible migrations (no breaking changes)
- Staging database approval before production

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

- **JWT tokens** with short expiration (15-30 minutes)
- **Refresh tokens** for long-lived sessions (7 days, stored in HttpOnly cookies)
- **Multi-Factor Authentication (MFA)** for sensitive roles (Admin, Manager)
- **OAuth2** for potential third-party integrations
- **API Key** management for service-to-service calls

### 9.2 Data Security

- **HTTPS/TLS** for all data in transit
- **Encryption at rest** for sensitive data (driver PII, payment info)
- **Database encryption** (Transparent Data Encryption - TDE)
- **Redis encryption** for sensitive cached data

### 9.3 API Security

- **Rate limiting** (per-user, per-IP)
- **Request validation** (size limits, content-type checks)
- **CORS** configuration (domain whitelist)
- **CSRF protection** for state-changing operations
- **SQL injection prevention** (parameterized queries)

### 9.4 Audit & Compliance

- **Comprehensive audit logging** of all data modifications
- **Immutable audit trails** (write-once logs)
- **Data retention policies** (compliance with local regulations)
- **PII handling** (data minimization, anonymization where possible)
- **GDPR/CCPA** compliance features (data export, deletion)

---

## 10. Assumptions

1. **Single Organization Deployment** - Assumes initial deployment for single organization; multi-tenancy can be added later
2. **Autonomous Vehicle Integration** - Future feature; current architecture supports GPS tracking but not autonomous dispatch
3. **Offline Capability** - Mobile app designed with optional offline support (cached data, sync-on-reconnect)
4. **Third-Party Integrations** - Payment, mapping, and SMS services are external (abstracted via adapters)
5. **High-Speed Connectivity** - Architecture assumes consistent mobile network connectivity; real-time features degrade gracefully on poor connections
6. **Scale Assumptions** - Designed for 10,000-100,000 vehicles and drivers; scaling beyond requires architectural adjustments
7. **Time Zone Handling** - All timestamps stored in UTC; client-side conversion to local time
8. **Language Support** - Designed for internationalization (i18n); initial implementation in Chinese with English support
9. **Browser Support** - Modern browsers (Chrome, Safari, Edge); IE11 not supported
10. **Docker/Kubernetes Availability** - Deployment assumes access to container orchestration platform; on-premises deployment may require adjustments

---

## 11. Open Questions & Future Considerations

### Architecture Decisions Pending Input

1. **Multi-Tenancy Implementation**
   - When will multi-tenant requirements materialize?
   - Should architecture support day-one multi-tenancy or plan for migration later?
   - How should cost allocation work across tenants?

2. **Real-Time Tracking Update Frequency**
   - What's acceptable GPS update frequency (5s, 30s, 1min)?
   - How long should location history be retained?
   - Client-side or server-side track smoothing?

3. **Payment & Billing Integration**
   - Will the platform handle payments directly or integrate with external billing?
   - Are subscriptions, per-order, or hybrid models supported?
   - Who manages refunds and disputes?

4. **Mobile App Distribution**
   - Will apps be published to App Store/Google Play or internal distribution?
   - How to handle app versioning and updates?
   - Mandatory vs. optional update policy?

5. **Analytics & Reporting**
   - What analytics are critical vs. nice-to-have?
   - Real-time analytics or batch processing?
   - Third-party analytics platform (Segment, Mixpanel) or custom solution?

6. **International Expansion**
   - Which countries/regions will be supported?
   - Regional compliance requirements (data residency)?
   - Multi-language support priority?

7. **Machine Learning / AI Features**
   - Route optimization - use third-party (Google Maps, Alibaba) or build custom?
   - Driver behavior analysis - what metrics matter most?
   - Predictive maintenance - how many sensors available?
   - Demand forecasting - priority level?

8. **Emergency & Safety Features**
   - SOS button implementation required?
   - Integration with emergency services?
   - Geofence breach actions (alert vs. automatic action)?
   - Speed monitoring enforcement?

9. **Communication Platform**
   - What's the preferred channel between drivers and dispatchers (in-app, SMS, voice)?
   - Does driver-to-customer communication need to be supported?
   - Message retention requirements?

10. **Scalability Strategy**
    - Expected concurrent users at launch?
    - Peak vs. average load patterns?
    - Geographic distribution of users (single region vs. global)?
    - Plans for horizontal scaling (databases, services)?

11. **Third-Party Integrations**
    - Which mapping service? (Google Maps, Alibaba, OpenStreetMap)
    - SMS provider preference? (Aliyun, Twilio, local provider)
    - File storage backend? (AWS S3, Alibaba OSS, MinIO)
    - Email service? (SES, SendGrid, local SMTP)

12. **Legacy System Integration**
    - Are there existing logistics systems to integrate with?
    - Data migration requirements from legacy systems?
    - Parallel run period needed?

### Technical Debt & Future Refactoring

- Service discovery pattern (Consul, Eureka, or K8s native)
- API versioning strategy (URL-based, header-based, or hybrid)
- Rate limiting implementation (per-user, per-API, or global)
- Distributed tracing setup (Jaeger, Zipkin)
- Service mesh consideration (Istio, Linkerd)
- Database read replicas for reporting workloads

---

## 12. Next Steps

1. **Detailed API Specification** - OpenAPI/Swagger specs for all service endpoints
2. **Database Schema Design** - ER diagrams and migration scripts
3. **Security Threat Model** - Formal threat assessment and mitigation strategies
4. **Frontend Component Library** - Reusable Angular/Ionic component documentation
5. **DevOps Pipeline Configuration** - Terraform scripts, Docker Compose, Kubernetes manifests
6. **Testing Strategy** - Unit test, integration test, and E2E test specifications
7. **Operational Runbook** - Deployment, scaling, disaster recovery procedures
8. **Team Onboarding Guide** - Developer setup, code style, review process

---

## Document Metadata

- **Author**: Architecture Team
- **Version**: 1.0 (Draft)
- **Last Updated**: 2024
- **Status**: In Review
- **Reviewers Needed**: Product Manager, Tech Lead, DevOps Lead

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Microservices** | Independently deployable services, each with specific business capability |
| **RBAC** | Role-Based Access Control - permissions assigned to roles, roles assigned to users |
| **ABAC** | Attribute-Based Access Control - decisions based on user, resource, and environment attributes |
| **RLS** | Row-Level Security - database enforcement of data access at row level |
| **JWT** | JSON Web Token - stateless token for authentication |
| **Geofence** | Virtual boundary on a map, used to trigger alerts when vehicles enter/exit |
| **SLA** | Service Level Agreement - promise of service availability and performance |
| **KPI** | Key Performance Indicator - measurable metric of business/operational performance |
| **Tenant** | Organization or company using the platform (in multi-tenant scenarios) |
| **Saga** | Long-running transaction pattern for distributed systems |

---

## Appendix B: Technology Decision Matrix

| Component | Chosen | Alternative | Rationale |
|-----------|--------|-------------|-----------|
| Frontend | Angular + Ionic | React Native, Flutter | Mature ecosystem, strong for form-heavy apps, single codebase for web/mobile |
| Backend | ASP.NET Core | Node.js, Java Spring | Strong microservices support, good performance, Windows compatibility if needed |
| Database | MySQL | PostgreSQL, MongoDB | Relational model fits well, good replication, proven at scale |
| Cache | Redis | Memcached, Hazelcast | Rich data structures, pub/sub support, persistence options |
| Message Queue | RabbitMQ | Kafka, NATS | Good for transactional guarantees, proven reliability |
| Orchestration | Kubernetes | Docker Compose, ECS | Industry standard, cloud-agnostic, strong community |
| Container Registry | Docker Hub / Private Registry | Quay, ECR | Docker standard, easy to self-host if needed |
| Logging | ELK / EFK Stack | Datadog, Splunk | Open-source option, self-hostable |
| Monitoring | Prometheus + Grafana | Datadog, New Relic | Open-source with community support |
| API Gateway | Custom / Kong | AWS API Gateway, nginx | Flexibility, cost control, fine-grained permission integration |

