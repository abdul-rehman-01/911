# CAR 911 — SECURITY ARCHITECTURE & VALIDATION SPECIFICATION (PHASE 9)

## 1. Overview & Security Baseline

Car 911 is an ultra-luxury automotive platform built on high-precision engineering standards. Phase 9 implements defense-in-depth security hardening across the entire application stack, transitioning from development-grade demo mechanisms to hardened, cryptographically verified production architectures.

---

## 2. Authentication Model

### Cryptographic Token Engine (HMAC-SHA256 JWT)
- **Token Format:** Signed JSON Web Tokens (`header.payload.signature`) encoded in URL-safe base64.
- **Signing Algorithm:** HMAC-SHA256 utilizing Node.js native `crypto.createHmac`.
- **Signature Verification:** Constant-time buffer comparison (`crypto.timingSafeEqual`) to eliminate timing side-channel attacks.
- **Token Claims:**
  - `sub`: Unique user identifier (e.g., `user-demo-member`).
  - `email`: Normalized lowercase client email.
  - `role`: Role claim (`user` or `admin`).
  - `iat`: Timestamp of issuance (seconds).
  - `exp`: Expiration timestamp (default TTL: 24 hours).

### Session Storage & Transport Strategy
1. **Bearer Token Authorization:** Attached via `Authorization: Bearer <token>` in API telemetry requests.
2. **HTTP-Only Cookies:** `car911_session` cookie issued on authentication:
   - `HttpOnly`: Prevents client-side JavaScript access, mitigating XSS token harvesting.
   - `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
   - `Path=/`: Applied platform-wide.
   - `Secure`: Enforced in production (`NODE_ENV=production`) over TLS.
3. **Logout & Invalidation:** Dedicated `POST /api/v1/auth/logout` clears the session cookie with `Max-Age=0`.

### Isolated Development Fallback
- In non-production environments (`NODE_ENV !== 'production'`), fallback headers (`x-user-id`) are retained solely for isolated integration test suites and demo offline access.
- In production (`NODE_ENV === 'production'`), unauthenticated headers are strictly rejected; valid cryptographic credentials are mandatory.

---

## 3. Authorization & Anti-IDOR Model

### Multi-Tier Role Hierarchy
- **Guest (Unauthenticated):**
  - Access permitted to public catalog (`/vehicles`, `/brands`, `/categories`, `/services`, `/dealers`) and health telemetry.
  - Denied access to private garage accounts, bookings management, user administration, and admin operations (HTTP 401).
- **VIP Member (Authenticated `user`):**
  - Access permitted to their own profile, watchlist favorites, and service bookings.
  - Strictly blocked from administrative endpoints (`/admin/*`, CRUD on brands, categories, vehicles, services, dealers) (HTTP 403).
- **Platform Director (`admin`):**
  - Global administrative clearance over inventory catalog, customer management, booking operations, and system telemetry metrics.

### Anti-IDOR (Insecure Direct Object Reference) Protection
- Handled via `requireOwnerOrAdmin(paramKey)` middleware:
  - Verifies that `req.user.id === req.params[paramKey]` OR `req.user.role === 'admin'`.
  - Prevents User A from reading or modifying User B's favorites (`/users/:userId/favorites`), bookings, or profile records (`/users/:id`).
  - Prevents privilege escalation: Client requests attempting to alter `role: 'admin'` are rejected with HTTP 403.

---

## 4. Input Validation & Sanitization

All incoming payloads are strictly validated using centralized rules in `server/src/schemas/validation.ts`:
- **Identifiers:** Validated for safe alphanumeric characters (`^[a-zA-Z0-9_\-\.]+$`), rejecting SQL injection syntax, null bytes, and paths exceeding 128 characters.
- **Email Terminals:** RFC-compliant format verification, max length 254 characters.
- **Numbers & Telemetry:** Year range (1948 to current+2), non-negative pricing, integer pagination (`limit` capped at 100).
- **Enums:** Booking statuses restricted strictly to `['Pending', 'Confirmed', 'Completed', 'Cancelled']`.
- **String Length Limits:** Text fields bounded (e.g., contact message capped at 5000 characters) to mitigate DoS payload inflation.
- **Error Responses:** Rejections return structured HTTP 400 (Bad Request) or HTTP 422 (Unprocessable Entity) errors.

---

## 5. HTTP Security Headers

Configured via `server/src/middleware/securityHeaders.ts`:
- `X-Content-Type-Options: nosniff` — Defends against MIME-sniffing exploits.
- `X-XSS-Protection: 1; mode=block` — Enforces browser XSS filtering.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects telemetry URLs.
- `X-Frame-Options: SAMEORIGIN` — Prevents clickjacking while preserving preview rendering in AI Studio.
- `X-DNS-Prefetch-Control: off` — Restricts passive DNS prefetching.
- `X-Download-Options: noopen` — Prevents forced execution of downloaded files.
- `X-Permitted-Cross-Domain-Policies: none` — Blocks Adobe Flash/Acrobat cross-domain leaks.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` — Enforced in production.
- `X-Powered-By` header stripped to prevent platform fingerprinting.

---

## 6. CORS Policy & Origin Hardening

Implemented in `server/src/app.ts`:
- **Allowed Origins:** Controlled by `CORS_ORIGIN` and `CLIENT_URL` environment variables.
- **Credentials Support:** `credentials: true` enabled only for verified origins.
- **Production Stance:** Never permits `*` when credentials are involved; unlisted origins are rejected with an explicit CORS policy exception.
- **Development Stance:** Permits localhost loopbacks (`localhost:3000`, `127.0.0.1:3000`, `localhost:5173`) for local development.

---

## 7. Rate Limiting Strategy

In-memory sliding-window rate limiters implemented in `server/src/middleware/rateLimiter.ts`:
- **Global API Limiter:** 240 requests/minute per client.
- **Auth Endpoint Limiter:** 15 requests/minute per IP on `/api/v1/auth/login` and `/api/v1/auth/register` to block brute-force attacks.
- **Sensitive Form Limiter:** 25 requests/minute on public booking and contact submissions.
- **Admin Operations Limiter:** 100 requests/minute on administrative endpoints.
- **Response Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`.
- **Status Code:** HTTP 429 (Too Many Requests).

---

## 8. Password Security & Secret Hygiene

### Password Hashing
- Standard: Salted **PBKDF2** with **100,000 iterations**, 64-byte key length, and **SHA-512** digest.
- Salt: 16 cryptographically random bytes generated via `crypto.randomBytes(16)`.
- Passwords and hashes are **NEVER** returned in any API responses or stored in frontend local storage.

### Secret Isolation & Error Sanitization
- Production errors (`errorHandler.ts`) are scrubbed of stack traces, internal paths, SQL snippets, and credentials.
- Accidental console logging of passwords, tokens, auth headers, and `DATABASE_URL` is prohibited.
- `.env` files are gitignored; `.env.example` contains placeholders only.

---

## 9. Database Security (Drizzle ORM & PostgreSQL)

- **Parameterized Queries:** All database interactions utilize Drizzle ORM query builders (`eq`, `desc`, `ilike`, etc.), preventing SQL injection.
- **Credentials Isolation:** `DATABASE_URL` remains strictly server-side; frontend possesses no direct PostgreSQL connection.
- **Column Masking:** `passwordHash` is excluded from all user query selects in `userRepository.ts`.

---

## 10. Known Demo Limitations

1. **In-Memory Rate Limiting:** Rate limit state resides in Node.js process memory. Distributed deployments with multiple stateless instances require an external cache (e.g., Redis).
2. **Demo Persona Presets:** Preset demo credentials (`driver@car911.com` / `admin@car911.com`) are provided for demonstration purposes. In production, these should be replaced with real user onboarding workflows.
3. **Database Fallback:** When `DATABASE_URL` is not supplied, the repository tier operates in an in-memory mock fallback mode for resilience.
