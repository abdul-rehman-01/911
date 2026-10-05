import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * 1. USERS TABLE
 * Stores client members and administrative credentials with role isolation.
 */
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(), // e.g., 'user-demo-member', 'user-demo-admin'
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(),
    role: text('role').notNull().default('user'),
    membershipTier: text('membership_tier').notNull().default('Platinum'),
    phone: text('phone'),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
  ]
);

/**
 * 2. BRANDS TABLE
 * Performance and supercar manufacturers.
 */
export const brands = pgTable(
  'brands',
  {
    id: text('id').primaryKey(), // e.g. 'porsche', 'ferrari', 'mclaren'
    name: text('name').notNull().unique(),
    country: text('country'),
    logoUrl: text('logo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('brands_name_idx').on(table.name),
  ]
);

/**
 * 3. CATEGORIES TABLE
 * Automotive chassis body classes (e.g. Coupe, Targa, Spyder / Roadster).
 */
export const categories = pgTable(
  'categories',
  {
    id: text('id').primaryKey(), // e.g. 'coupe', 'targa', 'spyder-roadster'
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('categories_name_idx').on(table.name),
  ]
);

/**
 * 4. VEHICLES TABLE
 * Catalog vehicle registry with complete dyno telemetry and valuation.
 */
export const vehicles = pgTable(
  'vehicles',
  {
    id: text('id').primaryKey(), // e.g. 'v-porsche-911-carrera-4-gts'
    slug: text('slug').notNull().unique(),
    brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    make: text('make').notNull(),
    model: text('model').notNull(),
    year: integer('year').notNull(),
    trim: text('trim'),
    chassisCode: text('chassis_code'),
    vin: text('vin').unique(),
    priceUsd: integer('price_usd').notNull(),
    msrpUsd: integer('msrp_usd'),
    exteriorColor: text('exterior_color'),
    interiorColor: text('interior_color'),
    isCertified: boolean('is_certified').default(false).notNull(),
    status: text('status').default('available').notNull(),
    outputHp: integer('output_hp').notNull(),
    torqueLbFt: integer('torque_lb_ft').notNull(),
    zeroToSixtySec: real('zero_to_sixty_sec').notNull(),
    topSpeedMph: integer('top_speed_mph').notNull(),
    transmission: text('transmission').notNull(),
    drivetrain: text('drivetrain').notNull(),
    fuelType: text('fuel_type').notNull(),
    mileageMiles: integer('mileage_miles').notNull(),
    curbWeightLbs: integer('curb_weight_lbs'),
    engineSpec: text('engine_spec'),
    technicalMatrix: jsonb('technical_matrix'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('vehicles_slug_idx').on(table.slug),
    uniqueIndex('vehicles_vin_idx').on(table.vin),
    index('vehicles_make_model_idx').on(table.make, table.model),
    index('vehicles_price_idx').on(table.priceUsd),
    index('vehicles_year_idx').on(table.year),
    index('vehicles_brand_id_idx').on(table.brandId),
    index('vehicles_category_id_idx').on(table.categoryId),
  ]
);

/**
 * 5. VEHICLE_IMAGES TABLE
 * Multi-angle high-resolution gallery assets.
 */
export const vehicleImages = pgTable(
  'vehicle_images',
  {
    id: text('id').primaryKey(),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    caption: text('caption'),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('vehicle_images_vehicle_id_idx').on(table.vehicleId),
  ]
);

/**
 * 6. VEHICLE_FEATURES TABLE
 * Technical equipment and bespoke chassis features.
 */
export const vehicleFeatures = pgTable(
  'vehicle_features',
  {
    id: text('id').primaryKey(),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    category: text('category').notNull(), // 'Performance', 'Exterior', 'Interior', 'Telemetry'
    featureName: text('feature_name').notNull(),
    isStandard: boolean('is_standard').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('vehicle_features_vehicle_id_idx').on(table.vehicleId),
  ]
);

/**
 * 7. DEALERS TABLE
 * Certified showrooms, race ateliers, and trackside service facilities.
 */
export const dealers = pgTable(
  'dealers',
  {
    id: text('id').primaryKey(), // e.g. 'dealer-beverly-hills'
    name: text('name').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state'),
    country: text('country').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    isFlagship: boolean('is_flagship').default(false).notNull(),
    latitude: real('latitude'),
    longitude: real('longitude'),
    operatingHours: jsonb('operating_hours'),
    brandSpecializations: jsonb('brand_specializations'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('dealers_city_idx').on(table.city),
    index('dealers_country_idx').on(table.country),
  ]
);

/**
 * 8. DEALER_VEHICLES TABLE
 * Junction table mapping inventory allocation between ateliers and vehicles.
 */
export const dealerVehicles = pgTable(
  'dealer_vehicles',
  {
    id: text('id').primaryKey(),
    dealerId: text('dealer_id')
      .notNull()
      .references(() => dealers.id, { onDelete: 'cascade' }),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('dealer_vehicles_unique_idx').on(table.dealerId, table.vehicleId),
  ]
);

/**
 * 9. FAVORITES TABLE
 * User watchlists with duplicate-prevention constraint.
 */
export const favorites = pgTable(
  'favorites',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('favorites_user_vehicle_unique_idx').on(table.userId, table.vehicleId),
    index('favorites_user_id_idx').on(table.userId),
  ]
);

/**
 * 10. COMPARISONS TABLE
 * Multi-vehicle dynamic telemetry side-by-side comparison sessions.
 */
export const comparisons = pgTable(
  'comparisons',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('comparisons_user_id_idx').on(table.userId),
  ]
);

/**
 * 11. COMPARISON_VEHICLES TABLE
 * Junction table associating up to 4 vehicles to a comparison dyno session.
 */
export const comparisonVehicles = pgTable(
  'comparison_vehicles',
  {
    id: text('id').primaryKey(),
    comparisonId: text('comparison_id')
      .notNull()
      .references(() => comparisons.id, { onDelete: 'cascade' }),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0).notNull(),
  },
  (table) => [
    uniqueIndex('comparison_vehicles_unique_idx').on(table.comparisonId, table.vehicleId),
    index('comparison_vehicles_comp_id_idx').on(table.comparisonId),
  ]
);

/**
 * 12. SERVICES TABLE
 * Concierge engineering, track prep, and white-glove transport catalog.
 */
export const services = pgTable(
  'services',
  {
    id: text('id').primaryKey(), // e.g. 'service-field-inspection'
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    shortDescription: text('short_description').notNull(),
    fullDescription: text('full_description'),
    estimatedDuration: text('estimated_duration'),
    startingPriceUsd: integer('starting_price_usd').notNull(),
    features: jsonb('features'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('services_slug_idx').on(table.slug),
    index('services_category_idx').on(table.category),
  ]
);

/**
 * 13. BOOKINGS TABLE
 * Service reservations logged with immutable state tracking.
 */
export const bookings = pgTable(
  'bookings',
  {
    id: text('id').primaryKey(), // e.g. 'bk-911-123456'
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    serviceName: text('service_name').notNull(),
    vehicleModel: text('vehicle_model'),
    preferredDate: text('preferred_date').notNull(),
    preferredTime: text('preferred_time').notNull(),
    clientName: text('client_name').notNull(),
    clientEmail: text('client_email').notNull(),
    clientPhone: text('client_phone').notNull(),
    notes: text('notes'),
    status: text('status').notNull().default('Pending'), // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('bookings_client_email_idx').on(table.clientEmail),
    index('bookings_service_id_idx').on(table.serviceId),
    index('bookings_status_idx').on(table.status),
  ]
);

/**
 * 14. CONTACT_MESSAGES TABLE
 * Inquiries submitted through the concierge transmission desk.
 */
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    inquiryType: text('inquiry_type'),
    vehicleOfInterest: text('vehicle_of_interest'),
    status: text('status').default('unread').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('contact_messages_email_idx').on(table.email),
    index('contact_messages_created_at_idx').on(table.createdAt),
  ]
);

/**
 * 15. RECENTLY_VIEWED TABLE
 * Telemetry log of inspected vehicles per user or session.
 */
export const recentlyViewed = pgTable(
  'recently_viewed',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('recently_viewed_user_id_idx').on(table.userId),
    index('recently_viewed_vehicle_id_idx').on(table.vehicleId),
  ]
);

// ---------------------------------------------------------------------------
// RELATIONS DEFINITIONS (DRIZZLE ORM)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  comparisons: many(comparisons),
  bookings: many(bookings),
  recentlyViewed: many(recentlyViewed),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  brand: one(brands, {
    fields: [vehicles.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [vehicles.categoryId],
    references: [categories.id],
  }),
  images: many(vehicleImages),
  features: many(vehicleFeatures),
  dealerAssignments: many(dealerVehicles),
  favoritedBy: many(favorites),
  comparedIn: many(comparisonVehicles),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleImages.vehicleId],
    references: [vehicles.id],
  }),
}));

export const vehicleFeaturesRelations = relations(vehicleFeatures, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleFeatures.vehicleId],
    references: [vehicles.id],
  }),
}));

export const dealersRelations = relations(dealers, ({ many }) => ({
  vehicles: many(dealerVehicles),
}));

export const dealerVehiclesRelations = relations(dealerVehicles, ({ one }) => ({
  dealer: one(dealers, {
    fields: [dealerVehicles.dealerId],
    references: [dealers.id],
  }),
  vehicle: one(vehicles, {
    fields: [dealerVehicles.vehicleId],
    references: [vehicles.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [favorites.vehicleId],
    references: [vehicles.id],
  }),
}));

export const comparisonsRelations = relations(comparisons, ({ one, many }) => ({
  user: one(users, {
    fields: [comparisons.userId],
    references: [users.id],
  }),
  vehicles: many(comparisonVehicles),
}));

export const comparisonVehiclesRelations = relations(comparisonVehicles, ({ one }) => ({
  comparison: one(comparisons, {
    fields: [comparisonVehicles.comparisonId],
    references: [comparisons.id],
  }),
  vehicle: one(vehicles, {
    fields: [comparisonVehicles.vehicleId],
    references: [vehicles.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

export const recentlyViewedRelations = relations(recentlyViewed, ({ one }) => ({
  user: one(users, {
    fields: [recentlyViewed.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [recentlyViewed.vehicleId],
    references: [vehicles.id],
  }),
}));
