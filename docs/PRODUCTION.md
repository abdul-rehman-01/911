# Car 911 — Production Deployment & Runtime Architecture

This document outlines the production runtime configuration, environment variables, security guidelines, and container/hosting architecture for the Car 911 Performance Automotive & Telemetry Platform.

---

## 1. Hosting Target & Canonical URL

- **Production Canonical URL**: `https://911-wheat.vercel.app/`
- **Development Runtime URL**: `http://localhost:3000` (or Google Cloud Run AI Studio preview URL)
- **Container Architecture**: Node.js 20+ runtime with full-stack Express REST API backend and optimized Vite-built React single-page frontend.

---

## 2. Environment Variables Specification

All sensitive configuration parameters are strictly isolated on the backend. No secret credentials (database passwords, HMAC keys, API tokens) are bundled into client-facing JavaScript.

| Variable Name | Environment | Required | Default / Placeholder | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | All | Optional | `3000` | Port on which the HTTP/Express server listens. |
| `NODE_ENV` | All | Yes | `production` / `development` | Runtime environment toggle. |
| `CLIENT_URL` | Production | Yes | `https://911-wheat.vercel.app` | Base URL of the client-facing application. |
| `CORS_ORIGIN` | Production | Yes | `https://911-wheat.vercel.app` | Comma-separated allowed origins for cross-origin API requests. |
| `AUTH_SECRET` | Production | **Required** | None | 32+ character random hex or base64 key used for HMAC-SHA256 JWT signing. |
| `SESSION_SECRET` | Production | Optional | Fallback to `AUTH_SECRET` | Secret key for HTTP-only cookie signing. |
| `DATABASE_URL` | Production | Optional* | None | PostgreSQL connection URI (`postgresql://user:password@host:5432/dbname`). |
| `GEMINI_API_KEY` | Server-side | Optional | Injected via Cloud Secret | Server-side Gemini API key for telemetry intelligence features. |

*\*Note on Database*: If `DATABASE_URL` is omitted, the server transparently operates in **Offline Resilient Mock Mode**, utilizing an in-memory high-fidelity data repository with demo credentials and zero downtime.

---

## 3. Build & Optimization Pipeline

1. **Vite Optimization**:
   - `sourcemap: false` prevents reverse engineering and shrinks distribution size.
   - Code-splitting with `manualChunks` isolates React runtime (`vendor-react`).
   - Dynamic `import()` code-splitting splits all non-critical pages (Admin Suite, Client Dashboard, Compare Matrix, Services, Dealers, About, Contact) into isolated chunks.
   - The Home page and Explore Inventory pages are loaded synchronously to guarantee lightning-fast First Contentful Paint (FCP).

2. **Asset Handling**:
   - All vehicle photography and brand logos use explicit `loading="lazy"` attributes when below the fold.
   - Typography uses Google Fonts `preconnect` headers for `Inter`, `JetBrains Mono`, and `Space Grotesk`.

3. **Error Boundaries**:
   - React `ErrorBoundary` wraps page renders, capturing unexpected client exceptions without unmounting navigation headers or telemetry hub triggers.

---

## 4. Backend Production Capabilities

- **Graceful Shutdown**: Listens to `SIGTERM` and `SIGINT` to close the HTTP server and gracefully terminate database connection pools (`closePool()`).
- **Rate Limiting**:
  - Global API: 150 requests per minute per IP.
  - Auth endpoints (`/api/v1/auth/*`): 15 attempts per 15-minute window with 429 lockout.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Request Body Limits**: Capped at 1MB to prevent memory exhaustion attacks.

---

## 5. Deployment Verification Checklist

- [x] TypeScript compiler passes without errors (`tsc --noEmit`).
- [x] Production build passes (`npm run build`).
- [x] Standard automated API regression suite passes (`npm run test:api`).
- [x] Security suite passes (`npm run test:security`).
- [x] Phase 10 QA suite passes (`npm run test:qa`).
- [x] Unverified claims removed from data feeds.
- [x] Robots.txt and sitemap.xml exclude private routes and include public indexable routes.
