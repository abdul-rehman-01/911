import http from 'http';
import { app } from './src/app.ts';
import { checkDatabaseConnection, closePool } from './src/db/index.ts';

async function runTests() {
  console.log('=====================================================');
  console.log('    CAR 911 PHASE 7 DATABASE & API INTEGRATION SUITE ');
  console.log('=====================================================');

  const dbStatus = await checkDatabaseConnection();
  console.log(`[Database Connection Status]: ${dbStatus.status.toUpperCase()}`);
  if (dbStatus.connected) {
    console.log(`  Live PostgreSQL verified (Latency: ${dbStatus.latencyMs}ms)`);
  } else {
    console.log(`  Operating in Fallback Mode: ${dbStatus.error || 'DATABASE_URL not configured'}`);
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not bind test server');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server bound to ${baseUrl}`);

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

  console.log('\n--- 1. HEALTH & DATABASE DIAGNOSTICS ---');

  // 1. Health endpoint with database status
  await check('GET /api/v1/health reports API & database status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const json = await res.json();
    return (
      res.status === 200 &&
      json.success === true &&
      json.data.status === 'ok' &&
      json.data.api === 'operational' &&
      typeof json.data.database === 'string' &&
      typeof json.data.databaseConnected === 'boolean'
    );
  });

  // 2. Health root alias
  await check('GET /api/health root alias parity', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = await res.json();
    return res.status === 200 && json.success === true && json.data.api === 'operational';
  });

  console.log('\n--- 2. VEHICLE CATALOG & MULTI-DIMENSIONAL QUERY ---');

  // 3. Vehicles list & pagination
  await check('GET /api/v1/vehicles (paginated)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles?limit=5`);
    const json = await res.json();
    return res.status === 200 && json.success === true && json.data.length === 5 && json.pagination.total >= 10;
  });

  // 4. Vehicles filtering by brand
  await check('GET /api/v1/vehicles?brand=Porsche filter', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles?brand=Porsche`);
    const json = await res.json();
    return res.status === 200 && json.data.every((v: any) => v.make.toLowerCase().includes('porsche'));
  });

  // 5. Vehicle by ID
  await check('GET /api/v1/vehicles/:id single lookup', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/v-porsche-911-carrera-4-gts`);
    const json = await res.json();
    return res.status === 200 && json.data.id === 'v-porsche-911-carrera-4-gts';
  });

  // 6. Vehicle 404
  await check('GET /api/v1/vehicles/non-existent returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/non-existent-vehicle-id`);
    const json = await res.json();
    return res.status === 404 && json.success === false && json.error.code === 'VEHICLE_NOT_FOUND';
  });

  // 7. Similar vehicles
  await check('GET /api/v1/vehicles/:id/similar returns class comparables', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/v-porsche-911-carrera-4-gts/similar?limit=3`);
    const json = await res.json();
    return res.status === 200 && json.data.length === 3;
  });

  console.log('\n--- 3. SERVICE CATALOG & DEALER NETWORKS ---');

  // 8. Services list
  await check('GET /api/v1/services', async () => {
    const res = await fetch(`${baseUrl}/api/v1/services`);
    const json = await res.json();
    return res.status === 200 && json.data.length > 0;
  });

  // 9. Dealers list
  await check('GET /api/v1/dealers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/dealers`);
    const json = await res.json();
    return res.status === 200 && json.data.length > 0;
  });

  console.log('\n--- 4. USER PROFILES & SECURITY CONSTRAINTS ---');

  // 10. Users get profile
  await check('GET /api/v1/users/:id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member`);
    const json = await res.json();
    return res.status === 200 && json.data.role === 'user';
  });

  // 11. Privilege escalation protection (403 Forbidden)
  await check('PATCH /api/v1/users/:id role=admin rejected with 403 FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    const json = await res.json();
    return res.status === 403 && json.error.code === 'FORBIDDEN';
  });

  console.log('\n--- 5. CONCIERGE BOOKINGS & STATE CONFLICTS ---');

  // 12. Bookings validation failure (422)
  await check('POST /api/v1/bookings with invalid email returns 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'test-service',
        serviceName: 'Test Service',
        preferredDate: '2026-10-10',
        preferredTime: '10:00 AM',
        clientName: 'Test Client',
        clientEmail: 'not-an-email',
        clientPhone: '1234567890',
      }),
    });
    const json = await res.json();
    return res.status === 422 && json.error.code === 'VALIDATION_ERROR';
  });

  // 13. Bookings creation valid (201)
  let createdBookingId = '';
  await check('POST /api/v1/bookings with valid payload returns 201', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'service-track-prep',
        serviceName: 'Track Dyno Calibration',
        preferredDate: '2026-11-20',
        preferredTime: '10:00 AM',
        clientName: 'Alexander Vance',
        clientEmail: 'member@car911.com',
        clientPhone: '+1 (310) 555-0199',
      }),
    });
    const json = await res.json();
    if (res.status === 201 && json.data.id) {
      createdBookingId = json.data.id;
      return true;
    }
    return false;
  });

  // 14. Booking status update & conflict test (409)
  await check('PATCH /api/v1/bookings/:id updates status', async () => {
    if (!createdBookingId) return false;
    const res = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    const json = await res.json();
    return res.status === 200 && json.data.status === 'Cancelled';
  });

  await check('PATCH /api/v1/bookings/:id immutable transition rejected with 409 CONFLICT', async () => {
    if (!createdBookingId) return false;
    const res = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const json = await res.json();
    return res.status === 409 && json.error.code === 'BOOKING_STATUS_CONFLICT';
  });

  console.log('\n--- 6. WATCHLIST & CONSTRAINTS ---');

  // 15. Favorites list
  await check('GET /api/v1/users/:userId/favorites', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member/favorites`);
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data.favoriteIds);
  });

  // 16. Favorites add & duplicate prevention (idempotency)
  await check('POST /api/v1/users/:userId/favorites (idempotent)', async () => {
    const addRes1 = await fetch(`${baseUrl}/api/v1/users/user-demo-member/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: 'v-audi-rs-etron-gt' }),
    });
    const json1 = await addRes1.json();

    // Add again to verify duplicate constraint handling
    const addRes2 = await fetch(`${baseUrl}/api/v1/users/user-demo-member/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: 'v-audi-rs-etron-gt' }),
    });
    const json2 = await addRes2.json();

    const ids: string[] = json2.data.favoriteIds;
    const countOccurrences = ids.filter((id) => id === 'v-audi-rs-etron-gt').length;

    return addRes1.status === 200 && addRes2.status === 200 && countOccurrences === 1;
  });

  // 17. Favorites add missing vehicle returns 404
  await check('POST /api/v1/users/:userId/favorites with non-existent vehicle returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/user-demo-member/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: 'v-non-existent-chassis' }),
    });
    const json = await res.json();
    return res.status === 404 && json.error.code === 'VEHICLE_NOT_FOUND';
  });

  console.log('\n--- 7. CONTACT & INQUIRIES DESK ---');

  // 18. Contact submission
  await check('POST /api/v1/contact registers inquiry (201 Created)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexander Vance',
        email: 'alex@car911.com',
        subject: 'Telemetry inquiry',
        message: 'Requesting dyno analysis report for 992.2 Carrera 4 GTS.',
      }),
    });
    const json = await res.json();
    return res.status === 201 && json.success === true;
  });

  console.log('\n--- 8. SECURITY HEADERS & ROUTE 404 ---');

  // 19. Security headers check
  await check('Security headers verification (nosniff, X-XSS-Protection)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    return (
      res.headers.get('x-content-type-options') === 'nosniff' &&
      res.headers.get('x-xss-protection') === '1; mode=block'
    );
  });

  // 20. Unhandled route returns 404 structured error
  await check('GET /api/v1/unknown-route returns 404 structured error', async () => {
    const res = await fetch(`${baseUrl}/api/v1/unknown-route`);
    const json = await res.json();
    return res.status === 404 && json.success === false && json.error.code === 'ROUTE_NOT_FOUND';
  });

  server.close();
  await closePool();

  console.log('\n=====================================================');
  console.log(`  PHASE 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (err) => {
  console.error('Fatal test error:', err);
  await closePool();
  process.exit(1);
});
