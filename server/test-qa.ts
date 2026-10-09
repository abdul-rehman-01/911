import http from 'http';
import { app } from './src/app.ts';
import { closePool } from './src/db/index.ts';
import { generateAuthToken } from './src/utils/security.ts';

async function runQATestSuite() {
  console.log('=====================================================');
  console.log('    CAR 911 PHASE 10: COMPREHENSIVE QA & AUDIT SUITE ');
  console.log('=====================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind QA test server');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`QA test server running on ${baseUrl}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function test(name: string, fn: () => Promise<boolean>) {
    totalTests++;
    try {
      const ok = await fn();
      if (ok) {
        console.log(`  [PASS] ${name}`);
        passedTests++;
      } else {
        console.error(`  [FAIL] ${name}`);
        failedTests++;
      }
    } catch (err) {
      console.error(`  [ERROR] ${name}:`, err);
      failedTests++;
    }
  }

  // Authentic JWTs
  const memberToken = generateAuthToken({
    sub: 'user-demo-member',
    email: 'driver@car911.com',
    role: 'user',
  });

  const adminToken = generateAuthToken({
    sub: 'user-demo-admin',
    email: 'admin@car911.com',
    role: 'admin',
  });

  console.log('--- 1. GUEST ACCESS & PUBLIC ENDPOINTS ---');
  await test('Guest can access catalog vehicles without authentication', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles`);
    const json = await res.json();
    return res.status === 200 && json.success === true && Array.isArray(json.data) && json.data.length > 0;
  });

  await test('Guest can search & filter vehicles by make', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles?make=Porsche`);
    const json = await res.json();
    return res.status === 200 && json.data.every((v: any) => v.make.toLowerCase() === 'porsche');
  });

  await test('Guest can view single vehicle details by slug/id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/v-porsche-911-carrera-4-gts`);
    const json = await res.json();
    return res.status === 200 && json.data.id === 'v-porsche-911-carrera-4-gts';
  });

  await test('Guest requesting non-existent vehicle returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/non-existent-vehicle-chassis`);
    return res.status === 404;
  });

  await test('Guest can view brands directory', async () => {
    const res = await fetch(`${baseUrl}/api/v1/brands`);
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data) && json.data.length > 0;
  });

  await test('Guest can view chassis categories directory', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`);
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data) && json.data.length > 0;
  });

  await test('Guest can view services catalog', async () => {
    const res = await fetch(`${baseUrl}/api/v1/services`);
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data) && json.data.length > 0;
  });

  await test('Guest can view dealer / atelier network', async () => {
    const res = await fetch(`${baseUrl}/api/v1/dealers`);
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data) && json.data.length > 0;
  });

  console.log('\n--- 2. AUTHENTICATION & SESSION LIFECYCLE ---');
  await test('Valid member login returns 200, JWT token, and user payload', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver@car911.com', password: 'MemberPass2026!' }),
    });
    const json = await res.json();
    return res.status === 200 && Boolean(json.data?.token) && json.data?.user?.email === 'driver@car911.com';
  });

  await test('Valid admin login returns 200, JWT token, and admin role', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@car911.com', password: 'AdminPass2026!' }),
    });
    const json = await res.json();
    return res.status === 200 && Boolean(json.data?.token) && json.data?.user?.role === 'admin';
  });

  await test('Invalid password rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver@car911.com', password: 'WrongPassword999!' }),
    });
    return res.status === 401;
  });

  await test('Registration with invalid email format rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Racer',
        email: 'invalid-email-address',
        phone: '+1 555-0100',
        password: 'ValidPassword2026!',
      }),
    });
    return res.status === 422;
  });

  await test('Registration with short password (<8 chars) rejected with 422', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Racer',
        email: 'racer@car911.com',
        phone: '+1 555-0100',
        password: 'short',
      }),
    });
    return res.status === 422;
  });

  await test('Duplicate registration handled gracefully with 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Julian Vance',
        email: 'driver@car911.com',
        phone: '+1 555-0100',
        password: 'ValidPassword2026!',
      }),
    });
    return res.status === 409;
  });

  console.log('\n--- 3. AUTHORIZATION & ROLE-BASED ACCESS CONTROL ---');
  await test('Guest cannot access admin stats (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`);
    return res.status === 401;
  });

  await test('Member cannot access admin stats (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    return res.status === 403;
  });

  await test('Admin receives 200 and telemetry data on admin stats', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.data.catalog && json.data.operations;
  });

  await test('Member cannot access user directory list (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    return res.status === 403;
  });

  await test('Admin can access user directory list (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && Array.isArray(json.data);
  });

  console.log('\n--- 4. FULL ADMIN MUTATION SUITE (CRUD) ---');
  const uniqueSuffix = Date.now().toString().slice(-5);

  // Brand CRUD
  const brandId = `test-brand-${uniqueSuffix}`;
  await test('Admin can create brand (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: brandId,
        name: `Atelier Brand ${uniqueSuffix}`,
        country: 'Italy',
        logoUrl: 'https://example.com/logo.png',
      }),
    });
    return res.status === 201;
  });

  await test('Admin can update brand (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/brands/${brandId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Updated Brand ${uniqueSuffix}`,
        country: 'Germany',
      }),
    });
    return res.status === 200;
  });

  await test('Admin can delete brand (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/brands/${brandId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 200;
  });

  // Category CRUD
  const catId = `test-cat-${uniqueSuffix}`;
  await test('Admin can create category (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: catId,
        name: `Hyper-GT ${uniqueSuffix}`,
        description: 'Aerodynamic grand touring chassis',
      }),
    });
    return res.status === 201;
  });

  await test('Admin can update category (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories/${catId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Hyper-GT Mk II ${uniqueSuffix}`,
        description: 'Advanced aerodynamic chassis',
      }),
    });
    return res.status === 200;
  });

  await test('Admin can delete category (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories/${catId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 200;
  });

  // Vehicle CRUD
  const vehicleId = `v-qa-test-${uniqueSuffix}`;
  await test('Admin can create vehicle in catalog (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: vehicleId,
        slug: vehicleId,
        make: 'Ferrari',
        model: `296 GTB Test ${uniqueSuffix}`,
        year: 2025,
        trim: 'Assetto Fiorano',
        chassisCode: 'F171',
        vin: `ZFF911QA${uniqueSuffix}`,
        priceUsd: 385000,
        bodyClass: 'Coupe',
        exteriorColor: 'Rosso Corsa',
        interiorColor: 'Nero Alcantara',
        isCertified: true,
        telemetry: {
          outputHp: 819,
          torqueLbFt: 546,
          acceleration0to100: 2.9,
          topSpeedMph: 205,
          transmission: '8-Speed Dual-Clutch',
          drivetrain: 'RWD',
          fuelType: 'Hybrid Twin-Turbo V6',
          mileageMiles: 450,
          engineSpec: '3.0L 120° Twin-Turbo V6 PHEV',
        },
      }),
    });
    return res.status === 201;
  });

  await test('Admin can update vehicle specs (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        priceUsd: 395000,
        isCertified: true,
      }),
    });
    return res.status === 200;
  });

  await test('Admin can delete vehicle (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 200;
  });

  // Booking Flow & Status Update
  let createdBookingId = '';
  await test('Booking creation succeeds with valid reservation info (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'service-field-inspection',
        serviceName: 'Trackside Technical Inspection',
        vehicleModel: 'Porsche 911 GT3 RS',
        preferredDate: '2026-10-25',
        preferredTime: '10:00 AM',
        clientName: 'Julian Vance',
        clientEmail: 'driver@car911.com',
        clientPhone: '+1 (555) 911-3829',
        notes: 'Preparation for track day session.',
      }),
    });
    const json = await res.json();
    if (res.status === 201 && json.data?.id) {
      createdBookingId = json.data.id;
      return true;
    }
    return false;
  });

  await test('Admin can update booking status to Confirmed (200)', async () => {
    if (!createdBookingId) return false;
    const res = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const json = await res.json();
    return res.status === 200 && json.data.status === 'Confirmed';
  });

  await test('Admin can cancel booking (200)', async () => {
    if (!createdBookingId) return false;
    const res = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    return res.status === 200;
  });

  // Contact Inquiries Flow
  let createdMessageId = '';
  await test('Contact inquiry submission succeeds (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Marcus Sterling',
        email: 'marcus@collector.org',
        phone: '+1 555-0922',
        subject: 'Allocation Inquiry for 911 S/T',
        message: 'Requesting allocation provenance and dyno logs.',
      }),
    });
    const json = await res.json();
    if (res.status === 201 && json.data?.id) {
      createdMessageId = json.data.id;
      return true;
    }
    return false;
  });

  await test('Admin can update contact message status to read (200)', async () => {
    if (!createdMessageId) return false;
    const res = await fetch(`${baseUrl}/api/v1/contact/${createdMessageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'read' }),
    });
    return res.status === 200;
  });

  await test('Admin can delete contact message (200)', async () => {
    if (!createdMessageId) return false;
    const res = await fetch(`${baseUrl}/api/v1/contact/${createdMessageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 200;
  });

  console.log('\n--- 5. ERROR RESILIENCE & EDGE CASES ---');
  await test('Malformed JSON body returns 400 with clean JSON error', async () => {
    const res = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "invalidJson": broken',
    });
    return res.status === 400;
  });

  await test('Unknown API endpoint returns 404 with standard envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/unknown-sector-endpoint`);
    const json = await res.json();
    return res.status === 404 && json.success === false && (json.error?.code === 'ROUTE_NOT_FOUND' || json.error?.code === 'NOT_FOUND');
  });

  await test('Security headers present on all responses', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const nosniff = res.headers.get('x-content-type-options');
    const xss = res.headers.get('x-xss-protection');
    const frame = res.headers.get('x-frame-options');
    return nosniff === 'nosniff' && xss === '1; mode=block' && frame === 'SAMEORIGIN';
  });

  console.log('\n=====================================================');
  console.log(`  PHASE 10 QA RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('=====================================================');

  await closePool();
  server.close();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runQATestSuite().catch((err) => {
  console.error('[QA Suite Fatal Error]:', err);
  process.exit(1);
});
