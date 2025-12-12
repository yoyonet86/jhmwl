# Backend (ASP.NET Core Microservices)

This repository includes a scaffolded ASP.NET Core backend intended to evolve into a microservices architecture.

## Projects

Solution: `backend/LogisticsSafetyPlatform.Backend.sln`

Services:

- `AuthService` – authentication/token issuing (scaffold)
- `UserService` – users/roles (scaffold)
- `DriverService` – drivers (scaffold)
- `VehicleService` – vehicles/fleet (scaffold)
- `OrderService` – orders/deliveries (scaffold)
- `DictionaryService` – dictionary data (scaffold)
- `Gateway` – API Gateway/BFF (YARP reverse proxy)

Shared:

- `Shared.Contracts` – shared DTO/contract types
- `Shared.ServiceDefaults` – shared hosting/DI defaults (Swagger + health checks)

## Endpoints

Each service exposes:

- `GET /health` – basic health checks (includes MySQL when `ConnectionStrings:Default` is configured)
- `GET /api/v1/status` – simple status payload (`ServiceStatusResponse`)
- `GET /` – convenience endpoint returning `{ service, status }`

The gateway exposes the same `GET /health` and `GET /api/v1/status`, plus reverse proxy routes:

- `/auth/*` → `AuthService`
- `/users/*` → `UserService`
- `/drivers/*` → `DriverService`
- `/vehicles/*` → `VehicleService`
- `/orders/*` → `OrderService`
- `/dictionary/*` → `DictionaryService`

Example (via gateway):

```bash
curl http://localhost:8080/auth/api/v1/status
curl http://localhost:8080/users/api/v1/status
```

## Prerequisites

- .NET SDK 8.x
- Docker + Docker Compose (for running all services + MySQL)

## Build (local)

```bash
cd backend

dotnet build LogisticsSafetyPlatform.Backend.sln
```

## Run a single service (local)

```bash
cd backend

# Example: AuthService
dotnet run --project src/AuthService/AuthService.csproj

# Test
curl http://localhost:5000/api/v1/status
curl http://localhost:5000/health
```

> Note: ports differ depending on your local launch settings; the docker-compose ports are listed below.

## Run everything (Docker Compose)

From the repo root:

```bash
docker compose up --build
```

Services (host → container):

- Gateway: `http://localhost:8080` → `:8080`
- AuthService: `http://localhost:5001` → `:8080`
- UserService: `http://localhost:5002` → `:8080`
- DriverService: `http://localhost:5003` → `:8080`
- VehicleService: `http://localhost:5004` → `:8080`
- OrderService: `http://localhost:5005` → `:8080`
- DictionaryService: `http://localhost:5006` → `:8080`
- MySQL: `localhost:3306`

MySQL initialization:

- Schema: `db/schema/core_tables.sql`
- Seed data: `db/seed/chinese_address_data.sql`

Default MySQL credentials (development):

- user: `root`
- password: `example`
- database: `logistics_platform`

## Notes / Next steps

- Add real domain endpoints per service (CRUD + business workflows).
- Add per-service database migrations (EF Core or Flyway) and avoid cross-service schema coupling.
- Add authN/authZ at the gateway and/or service level.
