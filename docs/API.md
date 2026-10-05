# Car 911 Performance & Telemetry REST API Specification (v1)

Welcome to the Car 911 High-Performance Automotive & Telemetry REST API documentation.
This API provides full-stack access to hypercar vehicle listings, dyno telemetry matrices, concierge maintenance services, certified atelier networks, user profiles, watchlist synchronization, and concierge reservations.

---

## 1. Architecture & Design Principles

Car 911 adheres to a layered **Repository Architecture**:

```
Client Request
      │
      ▼
┌──────────────┐
│ Express Route│  server/src/routes/*.ts
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │  server/src/controllers/*.ts (HTTP transport, status codes, param parsing)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │  server/src/services/*.ts (Domain logic, validation, business rules)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Repository  │  server/src/repositories/*.ts (Encapsulated data access)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Data Source  │  In-Memory Mock Store (Phase 6) ➔ PostgreSQL / Drizzle (Phase 7)
└──────────────┘
```

- **Base URL**: `/api/v1` (with `/api/health` root diagnostic alias)
- **Data Format**: `application/json` (UTF-8)
- **Security & Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - CORS with configurable origins and credential support
- **Information Protection**: Server error handling strictly excludes stack traces, database credentials, or server secrets from all API responses.

---

## 2. Standard Response & Error Envelope

All responses adhere to a consistent JSON envelope.

### 2.1 Success Response Envelope (`200 OK`, `201 Created`)

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message",
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

### 2.2 Standard Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Descriptive error message",
    "details": [ ... ]
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

### 2.3 HTTP Status Codes Reference

| HTTP Status | Error Code Constant | Usage Scenario |
| :--- | :--- | :--- |
| `200 OK` | — | Successful query or idempotent update. |
| `201 Created` | — | Resource created (new booking, contact transmission). |
| `400 Bad Request` | `BAD_REQUEST` / `MISSING_*` | Malformed parameters, missing required body arguments. |
| `401 Unauthorized`| `UNAUTHORIZED` | Unauthenticated telemetry request. |
| `403 Forbidden` | `FORBIDDEN` | Access denied; privilege escalation blocked (e.g., modifying `role`). |
| `404 Not Found` | `*_NOT_FOUND` | Target entity (vehicle, dealer, booking, user) does not exist. |
| `409 Conflict` | `CONFLICT` / `BOOKING_STATUS_CONFLICT`| State conflict (e.g. attempting to cancel an already completed booking). |
| `422 Unprocessable`| `VALIDATION_ERROR` | Schema validation error (invalid email, too short, illegal enum). |
| `500 Server Error`| `INTERNAL_SERVER_ERROR` | Unexpected backend error (stack traces censored). |

---

## 3. Endpoints Documentation

### 3.1 Health Diagnostics

#### `GET /api/v1/health`
*(Alias: `GET /api/health`)*

Checks the availability, version, uptime, and database connectivity status of the Car 911 API.

**Response `200 OK` (Live PostgreSQL connected)**:
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
    "uptime": 142.8,
    "uptimeSeconds": 142.8
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

**Response `200 OK` (Mock Fallback mode / DB offline)**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api": "operational",
    "database": "mock_fallback",
    "databaseConnected": false,
    "databaseMessage": "DATABASE_URL not configured. Operating in local mock fallback mode.",
    "service": "Car 911 Performance Automotive & Telemetry API",
    "version": "1.0.0",
    "environment": "development",
    "uptime": 142.8,
    "uptimeSeconds": 142.8
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

---

### 3.2 Vehicles API

#### `GET /api/v1/vehicles`
Retrieves a paginated list of catalog vehicles with multi-dimensional filtering and telemetry sorting.

**Query Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `search` | string | Free-text search matching make, model, trim, chassis code, VIN, color |
| `brand` / `make` | string | Filter by manufacturer (e.g., `Porsche`, `Ferrari`, `McLaren`) |
| `category` / `bodyClass` | string | Filter by body style (e.g., `Coupe`, `Targa`, `Spyder / Roadster`) |
| `minPrice` | number | Minimum valuation in USD |
| `maxPrice` | number | Maximum valuation in USD |
| `transmission` | string | Substring match for transmission (e.g., `PDK`, `Manual`) |
| `drivetrain` | string | Drive configuration (`AWD`, `RWD`) |
| `powertrain` / `fuelType`| string | Powertrain (`Gasoline`, `Hybrid`, `Electric`) |
| `minYear` | number | Earliest model year |
| `maxYear` | number | Latest model year |
| `maxMileage` | number | Mileage ceiling in miles |
| `onlyCertified`| boolean| When `true`, filters only factory-certified units |
| `sort` | string | `recommended` \| `price-asc` \| `price-desc` \| `horsepower` \| `mileage` \| `year` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12, max: 100) |

**Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "v-porsche-911-carrera-4-gts",
      "slug": "porsche-911-carrera-4-gts-2025",
      "make": "Porsche",
      "model": "911 Carrera 4 GTS",
      "year": 2025,
      "priceUsd": 178500,
      "isCertified": true,
      "telemetry": {
        "outputHp": 532,
        "torqueLbFt": 449,
        "zeroToSixtySec": 2.9,
        "topSpeedMph": 194,
        "transmission": "8-Speed Porsche Doppelkupplung (PDK)",
        "drivetrain": "AWD",
        "fuelType": "T-Hybrid"
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

#### `GET /api/v1/vehicles/:id`
Retrieves full vehicle telemetry and equipment matrix by ID or URL slug.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "v-porsche-911-carrera-4-gts",
    "make": "Porsche",
    "model": "911 Carrera 4 GTS",
    "year": 2025,
    "priceUsd": 178500,
    "chassisCode": "992.2",
    "telemetry": { ... },
    "technicalMatrix": { ... },
    "equipment": [ ... ]
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

**Error `404 Not Found`**:
```json
{
  "success": false,
  "error": {
    "code": "VEHICLE_NOT_FOUND",
    "message": "Vehicle with identifier 'v-unknown' was not found in the telemetry catalog."
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

#### `GET /api/v1/vehicles/:id/similar`
Retrieves comparable class vehicles ranked by similarity scoring algorithms.

**Query Parameters:**
- `limit` (optional number, default: 3)

---

### 3.3 Services API

#### `GET /api/v1/services`
Retrieves available atelier performance and concierge services.

**Query Parameters:**
- `category` (optional string): Filter by category (e.g., `Engineering`, `Logistics`, `Maintenance`)
- `search` (optional string): Keyword match

#### `GET /api/v1/services/:id`
Retrieves details for a single performance service.

---

### 3.4 Dealers & Partner Ateliers API

#### `GET /api/v1/dealers`
Retrieves partner certified showrooms, race ateliers, and trackside hubs.

**Query Parameters:**
- `search` (optional string): Keyword match in name or address
- `city` (optional string): Filter by metropolitan area
- `country` (optional string): Filter by ISO or country name
- `brand` (optional string): Filter by certified brand specialization
- `isFlagship` (optional boolean): Filter flagship ateliers only

#### `GET /api/v1/dealers/:id`
Retrieves single atelier details, operating hours, and location telemetry.

---

### 3.5 Users API

#### `GET /api/v1/users/:id`
Retrieves the profile of a member or administrator.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "user-demo-member",
    "fullName": "Alexander Vance",
    "email": "member@car911.com",
    "role": "user",
    "membershipTier": "Track VIP",
    "phone": "+1 (310) 555-0199",
    "savedVehiclesCount": 2,
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
}
```

#### `PATCH /api/v1/users/:id`
Updates client profile settings.

**Request Body:**
```json
{
  "fullName": "Alexander Vance Jr.",
  "phone": "+1 (310) 555-9988",
  "membershipTier": "Platinum"
}
```

**Security & Privilege Escalation Rules:**
Clients can never elevate their own privileges or modify their assigned `role` to `admin`. Attempts return `403 Forbidden`:

**Error `403 Forbidden`**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Client privilege escalation is forbidden. Role modification is not permitted via this endpoint.",
    "details": [
      "role: Client privilege escalation is forbidden. Role modification is not permitted via this endpoint."
    ]
  },
  "timestamp": "2026-10-05T05:00:00.000Z"
}
```

---

### 3.6 Favorites (Watchlist) API

#### `GET /api/v1/users/:userId/favorites`
Retrieves the user's saved vehicle identifiers and populated vehicle models.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "favoriteIds": [
      "v-porsche-911-carrera-4-gts",
      "v-ferrari-296-gtb"
    ],
    "vehicles": [ ... ],
    "count": 2
  }
}
```

#### `POST /api/v1/users/:userId/favorites`
Adds a vehicle to the client's watchlist.

**Request Body:**
```json
{
  "vehicleId": "v-porsche-911-gt3-rs"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "favoriteIds": [
      "v-porsche-911-carrera-4-gts",
      "v-ferrari-296-gtb",
      "v-porsche-911-gt3-rs"
    ],
    "count": 3
  },
  "message": "Vehicle added to client favorites."
}
```

#### `DELETE /api/v1/users/:userId/favorites/:vehicleId`
Removes a vehicle from the client's watchlist.

---

### 3.7 Concierge Bookings API

#### `GET /api/v1/bookings`
Retrieves service reservations with optional client filtering.

**Query Parameters:**
- `userEmail` (optional string): Filter reservations by client email
- `serviceId` (optional string): Filter by service identifier
- `status` (optional string): Filter by status (`Pending`, `Confirmed`, `Completed`, `Cancelled`)

#### `GET /api/v1/bookings/:id`
Retrieves single booking reservation details.

#### `POST /api/v1/bookings`
Creates a new performance concierge reservation.

**Request Body:**
```json
{
  "serviceId": "service-track-prep",
  "serviceName": "Track Telemetry & Dyno Calibration",
  "vehicleModel": "Porsche 911 GT3 RS",
  "preferredDate": "2026-11-15",
  "preferredTime": "10:00 AM",
  "clientName": "Alexander Vance",
  "clientEmail": "member@car911.com",
  "clientPhone": "+1 (310) 555-0199",
  "notes": "Include differential oil analysis"
}
```

**Validation & Response `201 Created`**:
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "bk-911-829104",
    "serviceId": "service-track-prep",
    "serviceName": "Track Telemetry & Dyno Calibration",
    "vehicleModel": "Porsche 911 GT3 RS",
    "preferredDate": "2026-11-15",
    "preferredTime": "10:00 AM",
    "clientName": "Alexander Vance",
    "clientEmail": "member@car911.com",
    "clientPhone": "+1 (310) 555-0199",
    "notes": "Include differential oil analysis",
    "status": "Pending",
    "createdAt": "2026-10-05T05:00:00.000Z"
  },
  "message": "Concierge performance service booking logged successfully."
}
```

**Error `422 Unprocessable Entity` (Validation failure):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking parameters.",
    "details": [
      "clientEmail: A valid client email address is required"
    ]
  }
}
```

#### `PATCH /api/v1/bookings/:id` (and `PATCH /api/v1/bookings/:id/status`)
Updates the reservation status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).

**Conflict Detection (`409 Conflict`):**
Completed or cancelled bookings are immutable. Attempts to transition them return:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_STATUS_CONFLICT",
    "message": "Cannot transition booking from 'Completed' to 'Pending'. Completed or cancelled reservations are immutable."
  }
}
```

#### `DELETE /api/v1/bookings/:id`
Removes a booking reservation from the system.

---

### 3.8 Contact & Inquiries API

#### `POST /api/v1/contact`
Submits a concierge inquiry, track day request, or vehicle purchase interest.

**Request Body:**
```json
{
  "name": "Julian Thorne",
  "email": "j.thorne@atelier.com",
  "phone": "+1 415 555 0122",
  "subject": "Acquisition Inquiry: 911 GT3 RS",
  "message": "Interested in track telemetry setup and enclosed transport to Monterey.",
  "inquiryType": "Sales & Bespoke Sourcing",
  "vehicleOfInterest": "2025 Porsche 911 GT3 RS"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "contact-1728104592000",
    "name": "Julian Thorne",
    "email": "j.thorne@atelier.com",
    "phone": "+1 415 555 0122",
    "subject": "Acquisition Inquiry: 911 GT3 RS",
    "message": "Interested in track telemetry setup and enclosed transport to Monterey.",
    "createdAt": "2026-10-05T05:00:00.000Z"
  },
  "message": "Your concierge inquiry has been securely registered in the Car 911 telemetry system."
}
```

#### `GET /api/v1/contact`
Retrieves all registered concierge inquiries (administrative telemetry audit).

---

## 4. Frontend API Client & Fallback Resilience

The frontend utilizes a centralized client `src/services/apiClient.ts` to perform all network requests.

```typescript
import { apiClient } from './apiClient';

// Example GET
const response = await apiClient.get<Vehicle[]>('/vehicles', { brand: 'Porsche' });

// Example POST
const booking = await apiClient.post<Booking>('/bookings', newBookingPayload);
```

### Mock Repository Fallback Strategy
If network connectivity is disrupted or the backend is operating in standalone mock mode:
1. `vehicleService`: Falls back seamlessly to `MOCK_VEHICLES` with complete client-side multi-parameter filtering and dyno sorting.
2. `bookingService`: Persists to browser `localStorage` under `car911_bookings` and mirrors asynchronously to `/api/v1/bookings`.
3. `authService`: Authenticates demo users (`member@car911.com` / `admin@car911.com`) and persists profile updates locally while syncing to `/api/v1/users/:id`.
4. `favoriteService`: Preserves watchlist in `localStorage` under `car911_favorites` while syncing changes to `/api/v1/users/:userId/favorites`.
5. `contactService`: Returns graceful fallback confirmation if endpoint is temporarily unreachable.

---

## 5. Phase 7 Preparation

The data layer is prepared for immediate migration to PostgreSQL:
- `DATABASE_URL` environment variable is defined in `.env.example` and parsed in `server/src/config/env.ts`.
- Repositories (`VehicleRepository`, `BookingRepository`, `UserRepository`, etc.) isolate data querying logic behind standardized asynchronous interfaces (`findAll`, `findById`, `create`, `update`, `delete`), requiring zero changes to controllers or client services when migrating to Drizzle ORM in Phase 7.
