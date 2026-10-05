# Car 911 PostgreSQL Database & Relational Data Layer Specification

## 1. Overview & Technology Stack

Phase 7 introduces enterprise relational database integration into the Car 911 Performance Automotive & Telemetry Platform.

- **RDBMS**: PostgreSQL 15+
- **Object-Relational Mapping (ORM)**: Drizzle ORM (`drizzle-orm`)
- **Database Driver**: `pg` (Node-Postgres) with connection pooling
- **Schema & Migration CLI**: Drizzle Kit (`drizzle-kit`)
- **Query Language**: Type-safe TypeScript queries via Drizzle schema models
- **Architecture**: Layered Repository Pattern with automatic **Mock Fallback Resilience**:
  ```
  Express Route ➔ Controller ➔ Service ➔ Repository ➔ Drizzle ORM ➔ PostgreSQL
                                                │
                                    (Fallback if DB offline)
                                                ▼
                                   In-Memory High-Performance Catalog
  ```

---

## 2. Database Configuration & Environment

Configuration is governed by environment variables loaded through `dotenv`:

```ini
# Primary connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/car911

# Alternative discrete parameters (e.g., containerized / cloud proxy setups)
# SQL_HOST=localhost
# SQL_DB_NAME=car911
# SQL_USER=postgres
# SQL_PASSWORD=YOUR_PASSWORD
```

### Connection Pool Configuration (`server/src/db/index.ts`)
- **Pool Size**: Maximum 10 concurrent clients
- **Connection Timeout**: 5,000ms
- **Idle Timeout**: 30,000ms
- **Pool Cache**: Global process-level cache `global._car911PostgresPool` preserving connection state across development reloads.
- **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to cleanly drain active queries and close client sockets before process termination.

---

## 3. Relational Schema: 15 Core Tables

All tables are defined in `server/src/db/schema.ts` using Drizzle ORM's `pg-core` types.

### 3.1. `users`
Client members, VIP collectors, and administrative profiles.
- `id` (text, PK) — Unique identifier (e.g. `user-demo-member`, `user-demo-admin`)
- `email` (text, unique, not null) — Validated contact email
- `full_name` (text, not null) — Client name
- `role` (text, not null, default: `'user'`) — Access role (`'user'` | `'admin'`)
- `membership_tier` (text, not null, default: `'Platinum'`) — Tier level (`'Platinum'`, `'Track VIP'`, `'Private Collector'`)
- `phone` (text) — Contact phone
- `password_hash` (text) — Secure PBKDF2 hash (never stored in plain text, never returned in API payloads)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)
- **Indexes**: `users_email_idx` (unique), `users_role_idx`

### 3.2. `brands`
Hypercar and supercar manufacturers.
- `id` (text, PK) — Slugified brand ID (e.g. `porsche`, `ferrari`, `mclaren`)
- `name` (text, unique, not null) — Official brand display name
- `country` (text) — Country of origin (e.g. `Germany`, `Italy`, `United Kingdom`)
- `logo_url` (text) — Brand badge vector asset
- `created_at` (timestamptz, default now)
- **Indexes**: `brands_name_idx` (unique)

### 3.3. `categories`
Automotive chassis and body categories.
- `id` (text, PK) — Category ID (e.g. `coupe`, `targa`, `spyder-roadster`)
- `name` (text, unique, not null) — Category title
- `description` (text) — Category engineering overview
- `created_at` (timestamptz, default now)
- **Indexes**: `categories_name_idx` (unique)

### 3.4. `vehicles`
Performance inventory with complete dyno telemetry.
- `id` (text, PK) — Canonical vehicle identifier (e.g. `v-porsche-911-carrera-4-gts`)
- `slug` (text, unique, not null) — URL-safe routing slug
- `brand_id` (text, FK `brands.id`, ON DELETE SET NULL)
- `category_id` (text, FK `categories.id`, ON DELETE SET NULL)
- `make` (text, not null) — Brand name
- `model` (text, not null) — Model designation
- `year` (integer, not null) — Model year
- `trim` (text) — Performance package trim
- `chassis_code` (text) — Factory chassis code (e.g. `992.2`, `F171`)
- `vin` (text, unique) — 17-character VIN identifier
- `price_usd` (integer, not null) — Acquisition price in USD
- `msrp_usd` (integer) — Original window sticker MSRP
- `exterior_color` (text) — Factory exterior paint
- `interior_color` (text) — Cockpit upholstery spec
- `is_certified` (boolean, not null, default false) — Car 911 111-point inspection verified
- `status` (text, not null, default: `'available'`) — Inventory lifecycle
- `output_hp` (integer, not null) — Peak brake horsepower
- `torque_lb_ft` (integer, not null) — Peak torque rating
- `zero_to_sixty_sec` (real, not null) — 0-60 mph launch time
- `top_speed_mph` (integer, not null) — Track velocity ceiling
- `transmission` (text, not null) — Transmission type (e.g., `8-Speed PDK`)
- `drivetrain` (text, not null) — Drive layout (`AWD`, `RWD`)
- `fuel_type` (text, not null) — Powertrain (`Gasoline`, `T-Hybrid`, `Electric`)
- `mileage_miles` (integer, not null) — Odometer reading
- `curb_weight_lbs` (integer) — Factory mass rating
- `engine_spec` (text) — Displacement and aspiration
- `technical_matrix` (jsonb) — Complete structured engineering specs
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)
- **Indexes**: `vehicles_slug_idx`, `vehicles_vin_idx`, `vehicles_make_model_idx`, `vehicles_price_idx`, `vehicles_year_idx`, `vehicles_brand_id_idx`, `vehicles_category_id_idx`

### 3.5. `vehicle_images`
Curated multi-angle gallery assets.
- `id` (text, PK)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `url` (text, not null) — High-definition image CDN URL
- `is_primary` (boolean, not null, default false)
- `caption` (text)
- `display_order` (integer, not null, default 0)
- `created_at` (timestamptz, default now)
- **Indexes**: `vehicle_images_vehicle_id_idx`

### 3.6. `vehicle_features`
Factory equipment and bespoke performance options.
- `id` (text, PK)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `category` (text, not null) — Category (`Performance`, `Exterior`, `Interior`, `Safety`)
- `feature_name` (text, not null)
- `is_standard` (boolean, not null, default true)
- `created_at` (timestamptz, default now)
- **Indexes**: `vehicle_features_vehicle_id_idx`

### 3.7. `dealers`
Official partner showrooms, race ateliers, and trackside support hubs.
- `id` (text, PK) — e.g. `dealer-beverly-hills`
- `name` (text, not null)
- `address` (text, not null)
- `city` (text, not null)
- `state` (text)
- `country` (text, not null)
- `phone` (text, not null)
- `email` (text, not null)
- `is_flagship` (boolean, not null, default false)
- `latitude` (real)
- `longitude` (real)
- `operating_hours` (jsonb) — Schedule dictionary
- `brand_specializations` (jsonb) — Array of certified brands
- `created_at` (timestamptz, default now)
- **Indexes**: `dealers_city_idx`, `dealers_country_idx`

### 3.8. `dealer_vehicles`
Inventory allocations mapping vehicles to showrooms.
- `id` (text, PK)
- `dealer_id` (text, FK `dealers.id`, ON DELETE CASCADE)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `assigned_at` (timestamptz, default now)
- **Constraints**: Unique index on `(dealer_id, vehicle_id)`

### 3.9. `favorites`
Member watchlists with duplicate-entry protection.
- `id` (text, PK)
- `user_id` (text, FK `users.id`, ON DELETE CASCADE)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `created_at` (timestamptz, default now)
- **Constraints**: Unique index on `(user_id, vehicle_id)` prevents duplicates.
- **Indexes**: `favorites_user_id_idx`

### 3.10. `comparisons`
Multi-vehicle dyno comparison workspaces.
- `id` (text, PK)
- `user_id` (text, FK `users.id`, ON DELETE CASCADE, nullable for guest sessions)
- `title` (text)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)
- **Indexes**: `comparisons_user_id_idx`

### 3.11. `comparison_vehicles`
Junction table mapping up to 4 vehicles to a dyno session.
- `id` (text, PK)
- `comparison_id` (text, FK `comparisons.id`, ON DELETE CASCADE)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `display_order` (integer, not null, default 0)
- **Constraints**: Unique index on `(comparison_id, vehicle_id)` prevents duplicate chassis in same comparison.
- **Indexes**: `comparison_vehicles_comp_id_idx`

### 3.12. `services`
Performance engineering, track prep, and concierge maintenance programs.
- `id` (text, PK) — e.g. `service-field-inspection`
- `slug` (text, unique, not null)
- `title` (text, not null)
- `category` (text, not null) — `'Engineering'`, `'Logistics'`, `'Maintenance'`
- `short_description` (text, not null)
- `full_description` (text)
- `estimated_duration` (text)
- `starting_price_usd` (integer, not null)
- `features` (jsonb) — Bullet point offerings
- `created_at` (timestamptz, default now)
- **Indexes**: `services_slug_idx`, `services_category_idx`

### 3.13. `bookings`
Concierge and performance maintenance service appointments.
- `id` (text, PK) — e.g. `bk-911-829104`
- `service_id` (text, FK `services.id`, ON DELETE RESTRICT)
- `service_name` (text, not null)
- `vehicle_model` (text)
- `preferred_date` (text, not null)
- `preferred_time` (text, not null)
- `client_name` (text, not null)
- `client_email` (text, not null)
- `client_phone` (text, not null)
- `notes` (text)
- `status` (text, not null, default: `'Pending'`) — `'Pending'`, `'Confirmed'`, `'Completed'`, `'Cancelled'`
- `user_id` (text, FK `users.id`, ON DELETE SET NULL)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)
- **Indexes**: `bookings_client_email_idx`, `bookings_service_id_idx`, `bookings_status_idx`

### 3.14. `contact_messages`
Inquiries submitted through the concierge desk.
- `id` (text, PK)
- `name` (text, not null)
- `email` (text, not null)
- `phone` (text)
- `subject` (text, not null)
- `message` (text, not null)
- `inquiry_type` (text)
- `vehicle_of_interest` (text)
- `status` (text, not null, default: `'unread'`)
- `created_at` (timestamptz, default now)
- **Indexes**: `contact_messages_email_idx`, `contact_messages_created_at_idx`

### 3.15. `recently_viewed`
Inspected chassis viewing history.
- `id` (text, PK)
- `user_id` (text, FK `users.id`, ON DELETE CASCADE, nullable)
- `session_id` (text)
- `vehicle_id` (text, FK `vehicles.id`, ON DELETE CASCADE)
- `viewed_at` (timestamptz, default now)
- **Indexes**: `recently_viewed_user_id_idx`, `recently_viewed_vehicle_id_idx`

---

## 4. Drizzle Relationships Graph

All bidirectional and foreign relations are declared via `drizzle-orm/relations`:
- `users`: Many `favorites`, Many `comparisons`, Many `bookings`, Many `recentlyViewed`
- `brands`: Many `vehicles`
- `categories`: Many `vehicles`
- `vehicles`: One `brand`, One `category`, Many `images`, Many `features`, Many `dealerAssignments`, Many `favoritedBy`, Many `comparedIn`
- `dealers`: Many `dealerVehicles`
- `services`: Many `bookings`
- `comparisons`: One `user`, Many `comparisonVehicles`

---

## 5. Migration & Seed Operations

Commands configured in `package.json`:

```bash
# Generate SQL migrations based on server/src/db/schema.ts
npm run db:generate

# Execute pending migrations against live PostgreSQL database
npm run db:migrate

# Push schema directly to database (development prototype sync)
npm run db:push

# Launch Drizzle Studio web GUI for visual schema inspection
npm run db:studio

# Run idempotent seed script populating demo inventory and users
npm run db:seed
```

### Idempotent Seed System (`server/src/db/seed.ts`)
- Imports authentic vehicle telemetry, atelier locations, and concierge programs from demo data files.
- Uses `onConflictDoUpdate` and `onConflictDoNothing` ensuring zero duplicate rows when re-executed.
- Generates salted PBKDF2 password hashes for demo accounts:
  - `member@car911.com` ➔ `MemberPass2026!`
  - `admin@car911.com` ➔ `AdminPass2026!`
- Flags all demo entities clearly as fictional demonstration data.

---

## 6. Health Diagnostics & Error Isolation

### Endpoint: `GET /api/v1/health` & `GET /api/health`
Actively probes the database connection using `SELECT 1` without crashing:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api": "operational",
    "database": "connected",
    "databaseConnected": true,
    "databaseLatencyMs": 4,
    "service": "Car 911 Performance Automotive & Telemetry API",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 48.2
  },
  "timestamp": "2026-10-05T05:15:00.000Z"
}
```

If PostgreSQL is unreachable, the API continues operating smoothly:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api": "operational",
    "database": "mock_fallback",
    "databaseConnected": false,
    "databaseMessage": "DATABASE_URL not configured. Operating in local mock fallback mode.",
    "service": "Car 911 Performance Automotive & Telemetry API"
  }
}
```

---

## 7. Security Hardening

1. **SQL Injection Defense**: 100% of database interactions utilize parameterized Drizzle queries or ORM helper expressions.
2. **Sanitized Errors**: Database internal exceptions, connection strings, and schema definitions are stripped by the central error middleware before returning to clients.
3. **Role Escalation Immunity**: Client user updates are filtered at schema and repository layers; modification of `role` returns `403 Forbidden`.
4. **Password Protection**: Passwords are encrypted with PBKDF2 (10,000 iterations, SHA-512) and omitted from all API response models.
