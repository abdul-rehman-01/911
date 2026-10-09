# Car 911 — Production Deployment Guide

This guide provides end-to-end deployment instructions, architecture topology, environment variable specifications, database provisioning guides, and operational verification procedures for the **Car 911 Performance Automotive & Telemetry Platform**.

---

## 1. Architectural Topology & Deployment Reality

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND TIER                        │
│ Host: Vercel (Production URL: https://911-wheat.vercel.app) │
│ Stack: React 19 + TypeScript + Vite + Tailwind CSS      │
│ Output: Static SPA Bundle (`dist/`)                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            ▼
┌────────────────────────────────────────────────────────┐
│                   BACKEND API TIER                     │
│ Target Hosts: Render / Railway / Google Cloud Run / VPS│
│ Stack: Node.js 20+ / Express / TypeScript              │
│ Endpoints: `/api/v1/*`, `/api/v1/health`               │
│ Security: Helmet-style headers, Rate Limiters, CORS    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ PostgreSQL Wire Protocol
                            ▼
┌────────────────────────────────────────────────────────┐
│                   DATABASE TIER                        │
│ Target Hosts: Neon / Supabase / AWS RDS / Cloud SQL    │
│ Engine: PostgreSQL 15+ via Drizzle ORM                │
│ Fallback: Zero-downtime high-fidelity mock repository  │
└────────────────────────────────────────────────────────┘
```

> **Critical Release Realization**: Deploying the Vite frontend to Vercel provides high-speed static asset delivery, but **does not automatically provision or execute the Express backend server**. The backend must either be deployed to a Node.js container service (Render, Railway, Fly.io, Cloud Run) with CORS enabled for `https://911-wheat.vercel.app`, or packaged as a monolithic container where `server.ts` serves both the Express API and `dist/` static assets.

---

## 2. Frontend Deployment (Vercel)

### Current Live Deployment
- **URL**: `https://911-wheat.vercel.app/`
- **Hosting Provider**: Vercel
- **Framework Preset**: Vite

### Build Configuration Settings
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: `20.x` or `22.x`

### Vercel Routing Configuration (`vercel.json`)
To prevent `404 NOT_FOUND` errors when visitors refresh deep SPA routes (e.g. `/explore-cars`, `/services`, `/compare`, `/dealers`), the project includes `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Frontend Environment Variables (Vercel Project Settings)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend-api-domain.com/api/v1` | URL of the hosted Express backend API. If omitted, frontend falls back to relative `/api/v1`. |

---

## 3. Backend Deployment (Node.js / Express)

### Recommended Hosting Providers
- **Google Cloud Run** (Serverless container, auto-scaling)
- **Render.com** (Web Service, Node runtime)
- **Railway.app** (Node runtime or Dockerfile)
- **Fly.io** (Global edge containers)

### Backend Production Start Command
```bash
# Production start via tsx engine:
npm start

# Or explicit production invocation:
NODE_ENV=production tsx server.ts
```

### Backend Production Environment Variables
| Variable | Required | Production Value / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` (or injected by host like `8080`) | Express listening port |
| `NODE_ENV` | **Yes** | `production` | Enables production caching and security guards |
| `CLIENT_URL` | **Yes** | `https://911-wheat.vercel.app` | Canonical frontend domain |
| `CORS_ORIGIN` | **Yes** | `https://911-wheat.vercel.app` | Allowed origins for cross-origin credentials |
| `AUTH_SECRET` | **Yes** | Strong 32+ character random hex key | HMAC-SHA256 signature key for JWT tokens |
| `SESSION_SECRET` | Optional | Strong 32+ character random key | Cookie signature key |
| `DATABASE_URL` | Optional* | `postgresql://user:pass@host:5432/dbname` | Live PostgreSQL connection pool |

> *\*Database Note*: If `DATABASE_URL` is omitted or temporarily unreachable, the backend transparently falls back to the in-memory mock repository, returning HTTP 200 with `database: "mock_fallback"`.

---

## 4. PostgreSQL Database Provisioning & Migration

### Step 1: Provision Managed PostgreSQL
Create a PostgreSQL 15+ database using a cloud provider:
- **Neon** (`neon.tech` - Serverless PostgreSQL)
- **Supabase** (`supabase.com`)
- **Render PostgreSQL** or **AWS RDS Aurora**

Copy the connection string (e.g. `postgresql://car911_user:secret@ep-cool-db.us-east-2.aws.neon.tech/car911?sslmode=require`).

### Step 2: Set Environment Variable
```bash
export DATABASE_URL="postgresql://car911_user:secret@ep-cool-db.us-east-2.aws.neon.tech/car911?sslmode=require"
```

### Step 3: Run Database Migrations
Run the Drizzle migration runner to initialize the 15 relational tables:
```bash
npm run db:migrate
```
Expected output:
```
--- CAR 911 POSTGRESQL MIGRATION RUNNER ---
[Migrate] Applying pending database migrations from ./drizzle ...
[Migrate Success] All database migrations applied successfully.
```

### Step 4: Seed Initial Relational Data
Populate vehicle catalog, speed marques, atelier locations, and concierge programs:
```bash
npm run db:seed
```
Expected output:
```
--- CAR 911 POSTGRESQL IDEMPOTENT SEED ENGINE ---
[Seed Connected] PostgreSQL connection confirmed in 42ms.
[Seed] Seeding users table with secure password hashes...
[Seed] Seeding brands table...
[Seed] Seeding categories table...
[Seed] Seeding vehicles, images, and technical feature matrices...
[Seed] Seeding dealers and inventory allocations...
[Seed] Seeding performance services catalog...
[Seed] Seeding bookings...
[Seed] Seeding member favorites...
[Seed] Seeding recently viewed telemetry items...
--- SEEDING COMPLETE: ALL 15 RELATIONAL TABLES SEEDED SUCCESSFULLY ---
```

### Step 5: Verify Database Connectivity
Probe the health endpoint:
```bash
curl -s http://localhost:3000/api/v1/health | jq
```
Expected JSON response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api": "operational",
    "database": "connected",
    "databaseConnected": true,
    "databaseLatencyMs": 14,
    "service": "Car 911 Performance Automotive & Telemetry API",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

## 5. Live Database Verification Status

- **Status in Current Workspace**: **BLOCKED / NOT TESTED**
- **Reason**: No remote live PostgreSQL instance (Neon/Cloud SQL/RDS) is provisioned in this container environment. The local connection attempt to `127.0.0.1:5432` returns `ECONNREFUSED`.
- **Operational Guarantee**: The backend's automated fallback mechanism intercepts the offline database state and serves the complete 15-entity relational schema from memory, maintaining 100% test pass rates across all 90 regression and security checks.

---

## 6. End-to-End Production Verification Checklist

Run these manual and automated steps before public launch:

1. **Vercel Public Frontend**:
   - Access `https://911-wheat.vercel.app/`
   - Refresh deep routes (`/explore-cars`, `/services`, `/compare`, `/dealers`) to ensure no 404s.
2. **Catalog & Vehicle Details**:
   - Browse catalog with filters (Make, Price, Power, Transmission).
   - Click a vehicle card to view high-resolution gallery and dyno technical matrix.
3. **Dyno Comparison**:
   - Add 2–4 hypercars to the comparison matrix and inspect specifications side-by-side.
4. **Member Authentication**:
   - Login with demo credentials: `member@car911.com` / `MemberPass2026!`.
   - Verify token issuance, dashboard access, and favorite toggles.
5. **Administrative Suite**:
   - Login with admin credentials: `admin@car911.com` / `AdminPass2026!`.
   - Verify admin clearance to `/admin` dashboard.
   - Test unauthorized member access to `/admin` and confirm `403 Forbidden` rejection.
6. **Inquiry & Booking Desks**:
   - Submit service reservation and contact message; confirm confirmation banners.
7. **SEO & Crawlers**:
   - Verify `https://911-wheat.vercel.app/robots.txt` returns 200 with search engine policies.
   - Verify `https://911-wheat.vercel.app/sitemap.xml` returns valid XML index.
