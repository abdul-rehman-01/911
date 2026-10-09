/**
 * Car 911 - Core TypeScript Definitions
 * Precision automotive engineering, telemetry intelligence, and platform domain models.
 */

export type RoutePath =
  | 'home'
  | 'explore-cars'
  | 'vehicle-details'
  | 'compare'
  | 'services'
  | 'service-details'
  | 'dealers'
  | 'dashboard'
  | 'favorites'
  | 'login'
  | 'register'
  | 'about'
  | 'contact'
  | 'not-found'
  | 'admin'
  | 'admin/vehicles'
  | 'admin/brands'
  | 'admin/categories'
  | 'admin/services'
  | 'admin/dealers'
  | 'admin/users'
  | 'admin/bookings'
  | 'admin/messages';

export interface TelemetrySpec {
  outputHp: number;
  outputKw?: number;
  peakRpm: number;
  acceleration0to100: number; // in seconds
  topSpeedKmh: number;
  topSpeedMph: number;
  torqueNm: number;
  torqueLbFt: number;
  torqueRpm: number;
  transmission: string;
  drivetrain: 'AWD' | 'RWD' | 'Quattro' | 'FWD';
  mileageMiles: number;
  fuelType: 'Petrol Twin-Turbo' | 'Naturally Aspirated' | 'PHEV' | 'Full Electric';
  engineDisplacement: string;
}

export interface TechnicalMatrix {
  displacementCc: number;
  compressionRatio: string;
  cylinderConfiguration: string;
  driveArchitecture: string;
  curbWeightKg: number;
  curbWeightLbs: number;
  fuelTankCapacityLiters: number;
  frontBrakeDisc: string;
  rearBrakeDisc: string;
  dragCoefficient: string;
}

export interface EquipmentItem {
  id: string;
  title: string;
  description: string;
}

export interface EquipmentCategory {
  category: 'chassis' | 'tech' | 'interior' | 'safety' | 'exterior';
  label: string;
  items: EquipmentItem[];
}

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  chassisCode: string;
  vin: string;
  priceUsd: number;
  estMonthlyUsd: number;
  exteriorColor: string;
  interiorColor: string;
  bodyClass: 'Coupe' | 'Supercars' | 'Luxury Sedan' | 'Perf SUV' | 'Electric GT' | 'Cabriolet';
  isCertified: boolean;
  tags: string[];
  primaryImage: string;
  galleryImages: {
    url: string;
    caption: string;
    alt: string;
  }[];
  telemetry: TelemetrySpec;
  technicalMatrix: TechnicalMatrix;
  equipment: EquipmentCategory[];
  dealerId: string;
  inStock: boolean;
  deliveryStatus: string;
  locationOrigin: string;
  warranty: string;
  factoryBuildDate: string;
  ecuHealthScore: number;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  priceEstimate: string;
  turnaroundTime: string;
  features: string[];
}

export interface Dealer {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapStaticImage: string;
  allocatedInventoryCount: number;
  isFlagship: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  vehicleModel?: string;
  preferredDate: string;
  preferredTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  membershipTier: 'Platinum' | 'Track VIP' | 'Private Collector';
  savedVehiclesCount: number;
  createdAt: string;
}

export type AuthRole = 'guest' | 'member' | 'admin';

export interface SessionState {
  role: AuthRole;
  user: UserProfile | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface VehicleFilterState {
  searchQuery: string;
  makes: string[];
  bodyClasses: string[];
  priceRange: [number, number];
  yearRange: [number, number];
  transmissions: string[];
  drivetrains: string[];
  powertrains: string[];
  maxMileage: number | null;
  onlyCertified: boolean;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'horsepower' | 'mileage' | 'year';
  viewMode: 'grid' | 'list';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  durationMs?: number;
}

export interface Brand {
  id: string;
  name: string;
  country?: string;
  logoUrl?: string;
  vehicleCount?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  vehicleCount?: number;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType?: string;
  vehicleOfInterest?: string;
  status?: 'unread' | 'read' | 'archived';
  createdAt: string;
}

export interface AdminStats {
  catalog: {
    totalVehicles: number;
    totalValuationUsd: number;
    totalHorsepower: number;
    certifiedCount: number;
    brandsCount: number;
    categoriesCount: number;
  };
  operations: {
    servicesCount: number;
    dealersCount: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
  users: {
    totalUsers: number;
    adminCount: number;
    memberCount: number;
  };
  communications: {
    totalInquiries: number;
    unreadInquiries: number;
  };
  recentBookings: Booking[];
  recentInquiries: ContactMessage[];
  systemHealth: {
    status: string;
    databaseEngine: string;
    architecture: string;
    timestamp: string;
  };
}
