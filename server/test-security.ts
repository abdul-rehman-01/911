import http from 'http';
import { app } from './src/app.ts';
import { closePool } from './src/db/index.ts';
import { generateAuthToken } from './src/utils/security.ts';

async function runSecurityAuditTests() {
  console.log('=====================================================');
  console.log('    CAR 911 PHASE 9: SECURITY & VALIDATION TEST SUITE');
  console.log('=====================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind security test server');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Security test terminal listening on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<boolean>) {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`  [PASS] ${name}`);
        passed++;
      } else {
        console.error(`  [FAIL] ${name}`);
        failed++;
      }
    } catch (err) {
      console.error(`  [ERROR] ${name}:`, err);
      failed++;
    }
  }

  // Generate verified cryptographically signed JWT tokens
  const validMemberToken = generateAuthToken({
    sub: 'user-demo-member',
    email: 'driver@car911.com',
    role: 'user',
  });

  const validAdminToken = generateAuthToken({
    sub: 'user-demo-admin',
    email: 'admin@car911.com',
    role: 'admin',
  });

  // Tampered/forged token (bad signature)
  const forgedToken = `${validMemberToken.split('.').slice(0, 2).join('.')}.InVaLiD_SiGnAtUrE_HaCk_AtTeMpT`;

  // Expired token (exp in past)
  const expiredToken = generateAuthToken(
    { sub: 'user-demo-member', email: 'driver@car911.com', role: 'user' },
    -10000 // expired 10 seconds ago
  );

  console.log('--- 1. AUTHENTICATION & CRYPTOGRAPHIC TOKEN VERIFICATION ---');

  // 1. Unauthenticated request to protected endpoint returns 401
  await check('Unauthenticated request to protected admin endpoint returns 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`);
    const json = await res.json();
    return res.status === 401 && json.success === false && json.error.code === 'UNAUTHORIZED';
  });

  // 2. Forged signature token returns 401
  await check('Forged/tampered signature token returns 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    const json = await res.json();
    return res.status === 401 && json.success === false && json.error.code === 'UNAUTHORIZED';
  });

  // 3. Expired token returns 401
  await check('Expired JWT token returns 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const json = await res.json();
    return res.status === 401 && json.success === false && json.error.code === 'UNAUTHORIZED';
  });

  // 4. Valid signed member token allowed on public/member endpoints
  await check('Valid signed member token authenticates successfully on /auth/me', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${validMemberToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success === true && json.data.id === 'user-demo-member';
  });

  // 5. Valid signed admin token allowed on admin endpoint
  await check('Valid signed admin token grants access to /admin/stats', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${validAdminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success === true && json.data.catalog;
  });

  console.log('\n--- 2. AUTHORIZATION & ANTI-IDOR ENFORCEMENT ---');

  // 6. Member accessing admin endpoint returns 403
  await check('Member accessing admin endpoint returns 403 FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${validMemberToken}` },
    });
    const json = await res.json();
    return res.status === 403 && json.success === false && json.error.code === 'FORBIDDEN';
  });

  // 7. Member attempting to access another user profile returns 403 (Anti-IDOR)
  await check('Member accessing another user account profile returns 403 FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-admin`, {
      headers: { Authorization: `Bearer ${validMemberToken}` },
    });
    const json = await res.json();
    return res.status === 403 && json.success === false && json.error.code === 'FORBIDDEN';
  });

  // 8. Member accessing their own profile returns 200
  await check('Member accessing their own account profile returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member`, {
      headers: { Authorization: `Bearer ${validMemberToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success === true && json.data.id === 'user-demo-member';
  });

  // 9. Privilege escalation attempt via client payload is rejected (403)
  await check('Client privilege escalation attempt (body: { role: "admin" }) rejected with 403', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validMemberToken}`,
      },
      body: JSON.stringify({ role: 'admin' }),
    });
    const json = await res.json();
    return res.status === 403 && json.success === false && json.error.code === 'FORBIDDEN';
  });

  console.log('\n--- 3. INPUT VALIDATION & PAYLOAD SANITIZATION ---');

  // 10. Contact form invalid email rejected (422)
  await check('Contact submission with invalid email format rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexander Vance',
        email: 'invalid-email-address',
        subject: 'Telemetry query',
        message: 'Telemetry test message with adequate length.',
      }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false && json.error.code === 'VALIDATION_ERROR';
  });

  // 11. Contact form missing required field rejected (422)
  await check('Contact submission with missing message rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexander Vance',
        email: 'alex@car911.com',
        subject: 'Telemetry query',
      }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false;
  });

  // 12. Booking creation missing required date rejected (422)
  await check('Booking reservation with missing preferredDate rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'service-track-prep',
        serviceName: 'Track Dyno Calibration',
        clientName: 'Alexander Vance',
        clientEmail: 'member@car911.com',
        clientPhone: '+1 (310) 555-0199',
      }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false;
  });

  // 13. Booking invalid enum status rejected (422)
  await check('Booking status update with illegal enum value rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings/bk-1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'HackedStatus' }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false;
  });

  // 14. Brand creation with empty name rejected (422)
  await check('Admin Brand creation with empty name rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validAdminToken}`,
      },
      body: JSON.stringify({ name: '' }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false;
  });

  // 15. Vehicle creation with missing required fields rejected (422)
  await check('Admin Vehicle creation with missing parameters rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validAdminToken}`,
      },
      body: JSON.stringify({ make: 'Porsche' }),
    });
    const json = await res.json();
    return res.status === 422 && json.success === false;
  });

  console.log('\n--- 4. HTTP SECURITY HEADERS & FINGERPRINT PROTECTION ---');

  // 16. Security headers presence
  await check('Security headers verification (nosniff, XSS, Referrer, Frame-Options)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const nosniff = res.headers.get('x-content-type-options') === 'nosniff';
    const xss = res.headers.get('x-xss-protection') === '1; mode=block';
    const frame = res.headers.get('x-frame-options') === 'SAMEORIGIN';
    const referrer = res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin';
    const poweredBy = res.headers.get('x-powered-by');

    return nosniff && xss && frame && referrer && poweredBy === null;
  });

  console.log('\n--- 5. CORS SECURITY AUDIT ---');

  // 17. Permitted origin receives valid CORS headers
  await check('Allowed localhost origin receives proper Access-Control-Allow-Origin', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    return (
      res.headers.get('access-control-allow-origin') === 'http://localhost:3000' &&
      res.headers.get('access-control-allow-credentials') === 'true'
    );
  });

  console.log('\n--- 6. SECRETS & ERROR HYGIENE AUDIT ---');

  // 18. User profile responses never leak passwordHash
  await check('User profile endpoints do NOT expose passwordHash, salt, or secrets', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member`, {
      headers: { Authorization: `Bearer ${validMemberToken}` },
    });
    const json = await res.json();
    return (
      json.success === true &&
      json.data.passwordHash === undefined &&
      json.data.salt === undefined &&
      json.data.password === undefined
    );
  });

  // 19. Database error or unhandled 404 does not expose stack traces or SQL strings
  await check('API 404 does not expose stack traces, filesystem paths, or internal details', async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent-endpoint`);
    const json = await res.json();
    return (
      res.status === 404 &&
      json.success === false &&
      json.error.stack === undefined &&
      json.error.code === 'ROUTE_NOT_FOUND'
    );
  });

  console.log('\n--- 7. RATE LIMITING AUDIT ---');

  // 20. Rate limiter attaches RateLimit headers
  await check('Rate limiter attaches RateLimit-Limit and RateLimit-Remaining headers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    return (
      res.headers.has('ratelimit-limit') &&
      res.headers.has('ratelimit-remaining')
    );
  });

  // 21. Auth limiter rejects burst attempts on /auth/login (simulated 16 attempts)
  await check('Auth rate limiter enforces lockout (429) after threshold', async () => {
    let hit429 = false;
    for (let i = 0; i < 18; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `rate-test-${i}@car911.com`, password: 'BadPassword123!' }),
      });
      if (res.status === 429) {
        hit429 = true;
        break;
      }
    }
    return hit429;
  });

  server.close();
  await closePool();

  console.log('\n=====================================================');
  console.log(`  CAR 911 SECURITY AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch(async (err) => {
  console.error('Fatal security test execution failure:', err);
  await closePool();
  process.exit(1);
});
