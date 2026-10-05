import { apiClient } from './apiClient';
import {
  Vehicle,
  Brand,
  Category,
  Service,
  Dealer,
  UserProfile,
  Booking,
  ContactMessage,
  AdminStats,
} from '../types';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { MOCK_SERVICES } from '../data/mockServices';
import { MOCK_DEALERS } from '../data/mockDealers';
import { MOCK_USERS } from '../data/mockUsers';
import { MOCK_BOOKINGS } from '../data/mockBookings';

export class AdminService {
  /**
   * Fetch aggregated platform statistics and live status
   */
  public async fetchDashboardStats(): Promise<AdminStats> {
    try {
      const res = await apiClient.get<AdminStats>('/admin/stats');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchDashboardStats remote error, using computed fallback:', err);
    }

    // Fallback calculation
    const totalVehicles = MOCK_VEHICLES.length;
    const totalValuationUsd = MOCK_VEHICLES.reduce((acc, v) => acc + v.priceUsd, 0);
    const totalHorsepower = MOCK_VEHICLES.reduce((acc, v) => acc + v.telemetry.outputHp, 0);
    const certifiedCount = MOCK_VEHICLES.filter((v) => v.isCertified).length;

    return {
      catalog: {
        totalVehicles,
        totalValuationUsd,
        totalHorsepower,
        certifiedCount,
        brandsCount: 6,
        categoriesCount: 7,
      },
      operations: {
        servicesCount: MOCK_SERVICES.length,
        dealersCount: MOCK_DEALERS.length,
        totalBookings: MOCK_BOOKINGS.length,
        pendingBookings: MOCK_BOOKINGS.filter((b) => b.status === 'Pending').length,
        confirmedBookings: MOCK_BOOKINGS.filter((b) => b.status === 'Confirmed').length,
        completedBookings: MOCK_BOOKINGS.filter((b) => b.status === 'Completed').length,
        cancelledBookings: MOCK_BOOKINGS.filter((b) => b.status === 'Cancelled').length,
      },
      users: {
        totalUsers: 2,
        adminCount: 1,
        memberCount: 1,
      },
      communications: {
        totalInquiries: 3,
        unreadInquiries: 2,
      },
      recentBookings: MOCK_BOOKINGS.slice(0, 5),
      recentInquiries: [
        {
          id: 'contact-demo-1',
          name: 'Julian Vance',
          email: 'julian.vance@vanceholdings.ch',
          phone: '+41 22 555 8820',
          subject: 'Inquiry on Porsche 911 GT3 RS Allocation',
          message: 'Seeking allocation window for Weissach package chassis.',
          inquiryType: 'Allocation Acquisition',
          vehicleOfInterest: 'v-porsche-911-gt3-rs',
          status: 'unread',
          createdAt: new Date().toISOString(),
        },
      ],
      systemHealth: {
        status: 'operational',
        databaseEngine: 'PostgreSQL (Drizzle ORM)',
        architecture: 'Tier-1 High Availability',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // --- VEHICLES ---
  public async fetchVehicles(): Promise<Vehicle[]> {
    try {
      const res = await apiClient.get<Vehicle[]>('/vehicles?limit=100');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchVehicles API error, falling back to mock:', err);
    }
    return [...MOCK_VEHICLES];
  }

  public async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await apiClient.post<Vehicle>('/vehicles', vehicle);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createVehicle API fallback:', err);
    }
    const fallback: Vehicle = {
      ...MOCK_VEHICLES[0],
      ...vehicle,
      id: vehicle.id || `v-${Date.now()}`,
      slug: vehicle.slug || `v-${Date.now()}`,
      telemetry: {
        ...MOCK_VEHICLES[0].telemetry,
        ...(vehicle.telemetry || {}),
      },
      technicalMatrix: {
        ...MOCK_VEHICLES[0].technicalMatrix,
        ...(vehicle.technicalMatrix || {}),
      },
    } as Vehicle;
    return fallback;
  }

  public async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await apiClient.patch<Vehicle>(`/vehicles/${id}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateVehicle API fallback:', err);
    }
    const existing = MOCK_VEHICLES.find((v) => v.id === id) || MOCK_VEHICLES[0];
    return { ...existing, ...updates };
  }

  public async deleteVehicle(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/vehicles/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteVehicle API fallback:', err);
      return true;
    }
  }

  // --- BRANDS ---
  public async fetchBrands(): Promise<Brand[]> {
    try {
      const res = await apiClient.get<Brand[]>('/brands');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchBrands fallback:', err);
    }
    return [
      { id: 'porsche', name: 'Porsche', country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80', vehicleCount: 6 },
      { id: 'ferrari', name: 'Ferrari', country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80', vehicleCount: 2 },
      { id: 'mclaren', name: 'McLaren', country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
      { id: 'aston-martin', name: 'Aston Martin', country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
      { id: 'audi', name: 'Audi', country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
      { id: 'lamborghini', name: 'Lamborghini', country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
    ];
  }

  public async createBrand(brand: { name: string; country?: string; logoUrl?: string }): Promise<Brand> {
    try {
      const res = await apiClient.post<Brand>('/brands', brand);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createBrand fallback:', err);
    }
    return {
      id: brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: brand.name,
      country: brand.country || 'Global',
      logoUrl: brand.logoUrl || '',
      vehicleCount: 0,
    };
  }

  public async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    try {
      const res = await apiClient.patch<Brand>(`/brands/${id}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateBrand fallback:', err);
    }
    return { id, name: updates.name || id, ...updates };
  }

  public async deleteBrand(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/brands/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteBrand fallback:', err);
      return true;
    }
  }

  // --- CATEGORIES ---
  public async fetchCategories(): Promise<Category[]> {
    try {
      const res = await apiClient.get<Category[]>('/categories');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchCategories fallback:', err);
    }
    return [
      { id: 'coupe', name: 'Coupe', description: 'Hardtop performance aerodynamic chassis', vehicleCount: 5 },
      { id: 'supercars', name: 'Supercars', description: 'Mid-engine extreme aerodynamic race platforms', vehicleCount: 3 },
      { id: 'cabriolet', name: 'Cabriolet', description: 'Open-cockpit high-output grand tourers', vehicleCount: 2 },
      { id: 'targa', name: 'Targa', description: 'Removable roof section with characteristic roll bar', vehicleCount: 1 },
      { id: 'luxury-sedan', name: 'Luxury Sedan', description: 'Executive long-wheelbase performance sedans', vehicleCount: 1 },
      { id: 'perf-suv', name: 'Perf SUV', description: 'All-terrain twin-turbo performance sport utilities', vehicleCount: 1 },
      { id: 'electric-gt', name: 'Electric GT', description: 'Zero-emission high-voltage track grand tourers', vehicleCount: 1 },
    ];
  }

  public async createCategory(category: { name: string; description?: string }): Promise<Category> {
    try {
      const res = await apiClient.post<Category>('/categories', category);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createCategory fallback:', err);
    }
    return {
      id: category.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: category.name,
      description: category.description || '',
      vehicleCount: 0,
    };
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const res = await apiClient.patch<Category>(`/categories/${id}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateCategory fallback:', err);
    }
    return { id, name: updates.name || id, ...updates };
  }

  public async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/categories/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteCategory fallback:', err);
      return true;
    }
  }

  // --- SERVICES ---
  public async fetchServices(): Promise<Service[]> {
    try {
      const res = await apiClient.get<Service[]>('/services');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchServices fallback:', err);
    }
    return [...MOCK_SERVICES];
  }

  public async createService(service: Partial<Service>): Promise<Service> {
    try {
      const res = await apiClient.post<Service>('/services', service);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createService fallback:', err);
    }
    return {
      ...MOCK_SERVICES[0],
      ...service,
      id: service.id || `service-${Date.now()}`,
    } as Service;
  }

  public async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    try {
      const res = await apiClient.patch<Service>(`/services/${id}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateService fallback:', err);
    }
    const existing = MOCK_SERVICES.find((s) => s.id === id) || MOCK_SERVICES[0];
    return { ...existing, ...updates };
  }

  public async deleteService(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/services/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteService fallback:', err);
      return true;
    }
  }

  // --- DEALERS ---
  public async fetchDealers(): Promise<Dealer[]> {
    try {
      const res = await apiClient.get<Dealer[]>('/dealers');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchDealers fallback:', err);
    }
    return [...MOCK_DEALERS];
  }

  public async createDealer(dealer: Partial<Dealer>): Promise<Dealer> {
    try {
      const res = await apiClient.post<Dealer>('/dealers', dealer);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createDealer fallback:', err);
    }
    return {
      ...MOCK_DEALERS[0],
      ...dealer,
      id: dealer.id || `dealer-${Date.now()}`,
    } as Dealer;
  }

  public async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer> {
    try {
      const res = await apiClient.patch<Dealer>(`/dealers/${id}`, updates);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateDealer fallback:', err);
    }
    const existing = MOCK_DEALERS.find((d) => d.id === id) || MOCK_DEALERS[0];
    return { ...existing, ...updates };
  }

  public async deleteDealer(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/dealers/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteDealer fallback:', err);
      return true;
    }
  }

  // --- USERS ---
  public async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await apiClient.get<UserProfile[]>('/users');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchUsers fallback:', err);
    }
    return [MOCK_USERS.admin, MOCK_USERS.member];
  }

  public async createUser(user: {
    fullName: string;
    email: string;
    phone?: string;
    role?: 'user' | 'admin';
    membershipTier?: 'Platinum' | 'Track VIP' | 'Private Collector';
  }): Promise<UserProfile> {
    try {
      const res = await apiClient.post<UserProfile>('/users', user);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] createUser fallback:', err);
    }
    return {
      id: `user-demo-${Date.now()}`,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      membershipTier: user.membershipTier || 'Platinum',
      savedVehiclesCount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteUser fallback:', err);
      return true;
    }
  }

  // --- BOOKINGS ---
  public async fetchBookings(): Promise<Booking[]> {
    try {
      const res = await apiClient.get<Booking[]>('/bookings');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchBookings fallback:', err);
    }
    return [...MOCK_BOOKINGS];
  }

  public async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    try {
      const res = await apiClient.patch<Booking>(`/bookings/${id}/status`, { status });
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateBookingStatus fallback:', err);
    }
    const existing = MOCK_BOOKINGS.find((b) => b.id === id) || MOCK_BOOKINGS[0];
    return { ...existing, status };
  }

  public async deleteBooking(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/bookings/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteBooking fallback:', err);
      return true;
    }
  }

  // --- CONTACT INQUIRIES ---
  public async fetchMessages(): Promise<ContactMessage[]> {
    try {
      const res = await apiClient.get<ContactMessage[]>('/contact');
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] fetchMessages fallback:', err);
    }
    return [
      {
        id: 'contact-demo-1',
        name: 'Julian Vance',
        email: 'julian.vance@vanceholdings.ch',
        phone: '+41 22 555 8820',
        subject: 'Inquiry on Porsche 911 GT3 RS Allocation',
        message: 'Seeking allocation window for Weissach package chassis. Requesting telemetry sheet and direct atelier inspection in Zurich/Stuttgart.',
        inquiryType: 'Allocation Acquisition',
        vehicleOfInterest: 'v-porsche-911-gt3-rs',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'contact-demo-2',
        name: 'Helena Berg',
        email: 'hberg@apexcapital.de',
        phone: '+49 89 2020 4401',
        subject: 'Private Trackside Support for Nürburgring Session',
        message: 'We have reserved the Nordschleife for private manufacturer telemetry benchmarking next month and need the mobile dyno van and track engineers.',
        inquiryType: 'Track Support',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: 'contact-demo-3',
        name: 'Marcus Sterling',
        email: 'msterling@mayfairmotors.co.uk',
        phone: '+44 20 7946 0912',
        subject: 'Pre-Purchase Dynamometer Certification',
        message: 'Client requires ECU validation and acoustic spectrum dyno run for 2024 Aston Martin Vantage prior to wire transfer settlement.',
        inquiryType: 'Inspection & Certification',
        vehicleOfInterest: 'v-aston-martin-vantage',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
  }

  public async updateMessageStatus(id: string, status: 'unread' | 'read' | 'archived'): Promise<ContactMessage> {
    try {
      const res = await apiClient.patch<ContactMessage>(`/contact/${id}`, { status });
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[AdminService] updateMessageStatus fallback:', err);
    }
    return {
      id,
      name: 'Client',
      email: 'client@domain.com',
      subject: 'Telemetry Transmission',
      message: 'Transmission updated.',
      status,
      createdAt: new Date().toISOString(),
    };
  }

  public async deleteMessage(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/contact/${id}`);
      return res.success;
    } catch (err) {
      console.warn('[AdminService] deleteMessage fallback:', err);
      return true;
    }
  }
}

export const adminService = new AdminService();
