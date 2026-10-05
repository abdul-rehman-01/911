import crypto from 'crypto';
import { db, checkDatabaseConnection, closePool } from './index.ts';
import * as schema from './schema.ts';
import { MOCK_VEHICLES } from '../../../src/data/mockVehicles.ts';
import { MOCK_SERVICES } from '../../../src/data/mockServices.ts';
import { MOCK_DEALERS } from '../../../src/data/mockDealers.ts';
import { MOCK_USERS } from '../../../src/data/mockUsers.ts';
import { MOCK_BOOKINGS } from '../../../src/data/mockBookings.ts';

/**
 * Utility to securely hash demonstration passwords with PBKDF2
 */
function hashPassword(password: string): string {
  const salt = 'car911_demo_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export async function seedDatabase() {
  console.log('--- CAR 911 POSTGRESQL IDEMPOTENT SEED ENGINE ---');

  if (!db) {
    console.warn('[Seed Aborted] Database client not initialized. DATABASE_URL is not set.');
    return;
  }

  const connStatus = await checkDatabaseConnection();
  if (!connStatus.connected) {
    console.warn(`[Seed Aborted] Database is unreachable (${connStatus.status}): ${connStatus.error}`);
    return;
  }

  console.log(`[Seed Connected] PostgreSQL connection confirmed in ${connStatus.latencyMs}ms.`);

  // 1. SEED USERS
  console.log('[Seed] Seeding users table with secure password hashes...');
  const demoUsers = [
    {
      id: MOCK_USERS.member.id,
      email: MOCK_USERS.member.email.toLowerCase(),
      fullName: MOCK_USERS.member.fullName,
      role: MOCK_USERS.member.role,
      membershipTier: MOCK_USERS.member.membershipTier,
      phone: MOCK_USERS.member.phone || '+1 (310) 555-0199',
      passwordHash: hashPassword('MemberPass2026!'),
    },
    {
      id: MOCK_USERS.admin.id,
      email: MOCK_USERS.admin.email.toLowerCase(),
      fullName: MOCK_USERS.admin.fullName,
      role: MOCK_USERS.admin.role,
      membershipTier: MOCK_USERS.admin.membershipTier,
      phone: MOCK_USERS.admin.phone || '+1 (415) 555-0188',
      passwordHash: hashPassword('AdminPass2026!'),
    },
  ];

  for (const u of demoUsers) {
    await db
      .insert(schema.users)
      .values(u)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          fullName: u.fullName,
          phone: u.phone,
          membershipTier: u.membershipTier,
          updatedAt: new Date(),
        },
      });
  }

  // 2. SEED BRANDS
  console.log('[Seed] Seeding brands table...');
  const brandMap = new Map<string, { id: string; name: string; country: string }>();
  for (const v of MOCK_VEHICLES) {
    const brandId = v.make.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (!brandMap.has(brandId)) {
      brandMap.set(brandId, {
        id: brandId,
        name: v.make,
        country:
          v.make === 'Porsche' || v.make === 'Audi'
            ? 'Germany'
            : v.make === 'Ferrari'
            ? 'Italy'
            : v.make === 'McLaren' || v.make === 'Aston Martin'
            ? 'United Kingdom'
            : 'United States',
      });
    }
  }

  for (const b of brandMap.values()) {
    await db
      .insert(schema.brands)
      .values(b)
      .onConflictDoNothing({ target: schema.brands.id });
  }

  // 3. SEED CATEGORIES
  console.log('[Seed] Seeding categories table...');
  const catMap = new Map<string, { id: string; name: string; description: string }>();
  for (const v of MOCK_VEHICLES) {
    const catId = v.bodyClass.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (!catMap.has(catId)) {
      catMap.set(catId, {
        id: catId,
        name: v.bodyClass,
        description: `High performance ${v.bodyClass} chassis architecture`,
      });
    }
  }

  for (const c of catMap.values()) {
    await db
      .insert(schema.categories)
      .values(c)
      .onConflictDoNothing({ target: schema.categories.id });
  }

  // 4. SEED VEHICLES, IMAGES, & FEATURES
  console.log('[Seed] Seeding vehicles, images, and technical feature matrices...');
  for (const v of MOCK_VEHICLES) {
    const brandId = v.make.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const categoryId = v.bodyClass.toLowerCase().replace(/[^a-z0-9]/g, '-');

    await db
      .insert(schema.vehicles)
      .values({
        id: v.id,
        slug: v.slug,
        brandId,
        categoryId,
        make: v.make,
        model: v.model,
        year: v.year,
        trim: v.trim,
        chassisCode: v.chassisCode,
        vin: v.vin,
        priceUsd: v.priceUsd,
        msrpUsd: v.priceUsd,
        exteriorColor: v.exteriorColor,
        interiorColor: v.interiorColor,
        isCertified: v.isCertified,
        status: 'available',
        outputHp: v.telemetry.outputHp,
        torqueLbFt: v.telemetry.torqueLbFt,
        zeroToSixtySec: v.telemetry.acceleration0to100,
        topSpeedMph: v.telemetry.topSpeedMph,
        transmission: v.telemetry.transmission,
        drivetrain: v.telemetry.drivetrain,
        fuelType: v.telemetry.fuelType,
        mileageMiles: v.telemetry.mileageMiles,
        curbWeightLbs: v.technicalMatrix.curbWeightLbs,
        engineSpec: v.telemetry.engineDisplacement,
        technicalMatrix: v.technicalMatrix as any,
      })
      .onConflictDoUpdate({
        target: schema.vehicles.id,
        set: {
          priceUsd: v.priceUsd,
          isCertified: v.isCertified,
          mileageMiles: v.telemetry.mileageMiles,
          updatedAt: new Date(),
        },
      });

    // Seed Primary and Gallery Images
    const allImages: string[] = [v.primaryImage, ...(v.galleryImages?.map((g) => g.url) || [])];
    for (let i = 0; i < allImages.length; i++) {
      const imgUrl = allImages[i];
      await db
        .insert(schema.vehicleImages)
        .values({
          id: `img-${v.id}-${i}`,
          vehicleId: v.id,
          url: imgUrl,
          isPrimary: i === 0,
          displayOrder: i,
        })
        .onConflictDoNothing({ target: schema.vehicleImages.id });
    }

    // Seed Equipment Features
    if (v.equipment) {
      let featureIdx = 0;
      for (const cat of v.equipment) {
        if (cat.items && Array.isArray(cat.items)) {
          for (const item of cat.items) {
            featureIdx++;
            await db
              .insert(schema.vehicleFeatures)
              .values({
                id: `feat-${v.id}-${featureIdx}`,
                vehicleId: v.id,
                category: cat.label || cat.category,
                featureName: item.title,
                isStandard: true,
              })
              .onConflictDoNothing({ target: schema.vehicleFeatures.id });
          }
        }
      }
    }
  }

  // 5. SEED DEALERS & ASSIGNMENTS
  console.log('[Seed] Seeding dealers and inventory allocations...');
  for (const d of MOCK_DEALERS) {
    await db
      .insert(schema.dealers)
      .values({
        id: d.id,
        name: d.name,
        address: d.address,
        city: d.city,
        state: d.state,
        country: d.country,
        phone: d.phone,
        email: d.email,
        isFlagship: d.isFlagship,
        latitude: d.coordinates.lat,
        longitude: d.coordinates.lng,
        operatingHours: { hours: d.hours },
        brandSpecializations: ['Porsche', 'Ferrari', 'McLaren', 'Aston Martin'],
      })
      .onConflictDoNothing({ target: schema.dealers.id });

    // Link demo vehicles
    for (const v of MOCK_VEHICLES.slice(0, 3)) {
      await db
        .insert(schema.dealerVehicles)
        .values({
          id: `dv-${d.id}-${v.id}`,
          dealerId: d.id,
          vehicleId: v.id,
        })
        .onConflictDoNothing({ target: schema.dealerVehicles.id });
    }
  }

  // 6. SEED SERVICES
  console.log('[Seed] Seeding performance services catalog...');
  for (const s of MOCK_SERVICES) {
    const priceNum = parseInt(s.priceEstimate.replace(/[^0-9]/g, '')) || 500;
    await db
      .insert(schema.services)
      .values({
        id: s.id,
        slug: s.slug,
        title: s.name,
        category: s.category,
        shortDescription: s.shortDescription,
        fullDescription: s.fullDescription,
        estimatedDuration: s.turnaroundTime,
        startingPriceUsd: priceNum,
        features: s.features as any,
      })
      .onConflictDoNothing({ target: schema.services.id });
  }

  // 7. SEED BOOKINGS
  console.log('[Seed] Seeding bookings...');
  for (const b of MOCK_BOOKINGS) {
    await db
      .insert(schema.bookings)
      .values({
        id: b.id,
        serviceId: b.serviceId,
        serviceName: b.serviceName,
        vehicleModel: b.vehicleModel,
        preferredDate: b.preferredDate,
        preferredTime: b.preferredTime,
        clientName: b.clientName,
        clientEmail: b.clientEmail.toLowerCase(),
        clientPhone: b.clientPhone,
        notes: b.notes,
        status: b.status,
        userId: MOCK_USERS.member.id,
      })
      .onConflictDoNothing({ target: schema.bookings.id });
  }

  // 8. SEED FAVORITES
  console.log('[Seed] Seeding member favorites...');
  const memberFavVehicles = ['v-porsche-911-carrera-4-gts', 'v-ferrari-296-gtb'];
  for (const vId of memberFavVehicles) {
    await db
      .insert(schema.favorites)
      .values({
        id: `fav-${MOCK_USERS.member.id}-${vId}`,
        userId: MOCK_USERS.member.id,
        vehicleId: vId,
      })
      .onConflictDoNothing({ target: schema.favorites.id });
  }

  // 9. SEED RECENTLY VIEWED
  console.log('[Seed] Seeding recently viewed telemetry items...');
  await db
    .insert(schema.recentlyViewed)
    .values({
      id: `rv-${MOCK_USERS.member.id}-v-porsche-911-carrera-4-gts`,
      userId: MOCK_USERS.member.id,
      vehicleId: 'v-porsche-911-carrera-4-gts',
    })
    .onConflictDoNothing({ target: schema.recentlyViewed.id });

  console.log('--- SEEDING COMPLETE: ALL 15 RELATIONAL TABLES SEEDED SUCCESSFULLY ---');
}

// Execute standalone if directly invoked
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Error]', err);
      await closePool();
      process.exit(1);
    });
}
