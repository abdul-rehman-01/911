# Car 911 — High-Performance Automotive & Telemetry Platform

Car 911 is an end-to-end full-stack automotive ecosystem delivering digital showroom browsing, dyno spec comparisons, certified dealer ateliers, bespoke concierge maintenance bookings, and user watchlists.

---

## 1. Full-Stack Architecture

- **Frontend**: React 19 SPA, Tailwind CSS v4, Lucide icons, Motion animations.
- **Backend API**: Node.js v22 Express server (`server/src/app.ts`), modular routes (`/api/v1/*`), controller/service layers, and structured error responses.
- **Database Layer**: PostgreSQL 15+ relational schema managed via Drizzle ORM and Drizzle Kit.
- **Resilience Engine**: Dual-mode data access with seamless in-memory mock fallback when operating without an external PostgreSQL instance.

---

## 2. Quick Start & Commands

```bash
# Install dependencies
npm install

# Start full-stack development server (Express API + Vite SPA on port 3000)
npm run dev

# Run TypeScript type-checking across frontend and backend
npm run lint

# Build production bundle
npm run build

# Run automated API integration test suite
npm run test:api
```

---

## 3. Database Management (Phase 7)

```bash
# Generate SQL migrations based on Drizzle schema (server/src/db/schema.ts)
npm run db:generate

# Apply migrations to live PostgreSQL database
npm run db:migrate

# Push schema directly to database (development)
npm run db:push

# Open Drizzle Studio visual database inspector
npm run db:studio

# Run idempotent seed script to populate demo inventory and users
npm run db:seed
```

---

## 4. Environment Configuration

Copy `.env.example` to `.env`:

```ini
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# PostgreSQL Connection String (Phase 7)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/car911
```

*Note: If `DATABASE_URL` is omitted or PostgreSQL is unreachable, the system automatically runs in local mock fallback mode without crashing.*

---

## 5. Documentation Directory

- **`docs/DATABASE.md`**: Complete relational database schema, all 15 tables, indexes, relationships, and migration documentation.
- **`docs/API.md`**: Complete REST API endpoints reference, query parameters, request bodies, and JSON response examples.
