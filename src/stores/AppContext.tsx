import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Vehicle,
  Service,
  Dealer,
  Booking,
  VehicleFilterState,
  SessionState,
  ToastMessage,
  RoutePath,
} from '../types';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { MOCK_SERVICES } from '../data/mockServices';
import { MOCK_DEALERS } from '../data/mockDealers';
import { MOCK_USERS } from '../data/mockUsers';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { favoriteService } from '../services/favoriteService';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../utils/storage';

export const INITIAL_FILTER_STATE: VehicleFilterState = {
  searchQuery: '',
  makes: [],
  bodyClasses: [],
  priceRange: [50000, 400000],
  yearRange: [2020, 2025],
  transmissions: [],
  drivetrains: [],
  powertrains: [],
  maxMileage: null,
  onlyCertified: false,
  sortBy: 'recommended',
  viewMode: 'grid',
};

interface AppContextValue {
  // Navigation
  currentRoute: RoutePath;
  navigateTo: (route: RoutePath, params?: { vehicleId?: string; serviceId?: string }) => void;

  // Vehicles & Selection
  vehicles: Vehicle[];
  selectedVehicleId: string;
  selectedVehicle: Vehicle;
  setSelectedVehicleId: (id: string) => void;
  recentlyViewedIds: string[];
  recentlyViewedVehicles: Vehicle[];
  recordVehicleView: (id: string) => void;
  clearRecentlyViewed: () => void;

  // Filter State
  filters: VehicleFilterState;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilterState>>;
  updateFilter: <K extends keyof VehicleFilterState>(key: K, value: VehicleFilterState[K]) => void;
  resetFilters: () => void;
  filteredVehicles: Vehicle[];
  activeFilterCount: number;

  // Favorites
  favorites: string[];
  favoriteVehicles: Vehicle[];
  toggleFavorite: (vehicleId: string) => void;
  isFavorite: (vehicleId: string) => boolean;
  clearFavorites: () => void;

  // Comparison (Max 4)
  comparedIds: string[];
  comparedVehicles: Vehicle[];
  addToCompare: (vehicleId: string) => boolean;
  removeFromCompare: (vehicleId: string) => void;
  toggleCompare: (vehicleId: string) => void;
  isCompared: (vehicleId: string) => boolean;
  clearComparison: () => void;

  // Services & Bookings
  services: Service[];
  selectedServiceId: string;
  selectedService: Service;
  setSelectedServiceId: (id: string) => void;
  dealers: Dealer[];
  selectedDealerId: string;
  selectedDealer: Dealer;
  setSelectedDealerId: (id: string) => void;
  bookings: Booking[];
  createBooking: (payload: {
    serviceId: string;
    serviceName: string;
    vehicleModel?: string;
    preferredDate: string;
    preferredTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  }) => Booking | null;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;

  // Authentication
  session: SessionState;
  loginAs: (role: 'guest' | 'member' | 'admin') => void;
  loginWithCredentials: (email: string, password?: string) => boolean;
  registerUser: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    membershipTier: 'Platinum' | 'Track VIP' | 'Private Collector';
  }) => boolean;
  updateProfile: (updates: {
    fullName?: string;
    phone?: string;
    membershipTier?: 'Platinum' | 'Track VIP' | 'Private Collector';
  }) => boolean;
  logout: () => void;

  // Toast System
  toast: ToastMessage | null;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: () => void;

  // Selectors / Helpers
  getVehicleById: (id: string) => Vehicle | undefined;
  getDealerById: (id: string) => Dealer | undefined;
  getServiceById: (id: string) => Service | undefined;
  getSimilarVehicles: (vehicleId: string, limit?: number) => Vehicle[];
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation State
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('home');

  // 2. Vehicles Catalog
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleIdState] = useState<string>('v-porsche-911-carrera-4-gts');

  // 3. Recently Viewed Vehicles
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    getStorageItem<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, ['v-porsche-911-carrera-4-gts'])
  );

  // 4. Favorites State (with local storage persistence)
  const [favorites, setFavorites] = useState<string[]>(() =>
    getStorageItem<string[]>(STORAGE_KEYS.FAVORITES, [
      'v-porsche-911-carrera-4-gts',
      'v-aston-martin-vantage',
      'v-audi-rs-etron-gt',
    ])
  );

  // 5. Comparison State (max 4, persistent)
  const [comparedIds, setComparedIds] = useState<string[]>(() =>
    getStorageItem<string[]>(STORAGE_KEYS.COMPARISON, [
      'v-porsche-911-carrera-4-gts',
      'v-aston-martin-vantage',
    ])
  );

  // 6. Filter State
  const [filters, setFilters] = useState<VehicleFilterState>(INITIAL_FILTER_STATE);

  // 7. Services & Dealers
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('service-field-inspection');
  const [dealers] = useState<Dealer[]>(MOCK_DEALERS);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('dealer-beverly-hills');

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const selectedDealer = useMemo(() => {
    return dealers.find((d) => d.id === selectedDealerId) || dealers[0];
  }, [dealers, selectedDealerId]);

  // 8. Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => bookingService.getAll());

  // 9. Session / Auth State
  const [session, setSession] = useState<SessionState>(() => authService.getInitialSession());

  // 10. Global Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((t: Omit<ToastMessage, 'id'>) => {
    setToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...t,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.COMPARISON, comparedIds);
  }, [comparedIds]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RECENTLY_VIEWED, recentlyViewedIds);
  }, [recentlyViewedIds]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SESSION, session);
  }, [session]);

  // Record Vehicle View
  const recordVehicleView = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 10);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    showToast({
      type: 'info',
      title: 'Viewing History Cleared',
      message: 'Your recent chassis analysis records have been reset.',
    });
  }, [showToast]);

  const setSelectedVehicleId = useCallback((id: string) => {
    setSelectedVehicleIdState(id);
    recordVehicleView(id);
  }, [recordVehicleView]);

  const selectedVehicle = useMemo(() => {
    return (
      vehicles.find((v) => v.id === selectedVehicleId) ||
      vehicles[0]
    );
  }, [vehicles, selectedVehicleId]);

  const recentlyViewedVehicles = useMemo(() => {
    return recentlyViewedIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }, [recentlyViewedIds, vehicles]);

  // Favorites Actions
  const toggleFavorite = useCallback((vehicleId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(vehicleId);
      const targetVehicle = vehicles.find((v) => v.id === vehicleId);
      const vehicleName = targetVehicle ? `${targetVehicle.make} ${targetVehicle.model}` : 'Vehicle';

      if (exists) {
        showToast({
          type: 'info',
          title: 'Removed from Watchlist',
          message: `${vehicleName} removed from your private telemetry registry.`,
        });
        if (session.user?.id) {
          favoriteService.removeFavorite(session.user.id, vehicleId).catch((err) => {
            console.warn('[AppContext] Favorite sync deferred:', err);
          });
        }
        return prev.filter((id) => id !== vehicleId);
      } else {
        showToast({
          type: 'success',
          title: 'Saved to Watchlist',
          message: `${vehicleName} staged in your garage.`,
        });
        if (session.user?.id) {
          favoriteService.addFavorite(session.user.id, vehicleId).catch((err) => {
            console.warn('[AppContext] Favorite sync deferred:', err);
          });
        }
        return [...prev, vehicleId];
      }
    });
  }, [vehicles, session.user?.id, showToast]);

  const isFavorite = useCallback((vehicleId: string) => {
    return favorites.includes(vehicleId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    showToast({
      type: 'info',
      title: 'Watchlist Cleared',
      message: 'All saved vehicles have been cleared from your session.',
    });
  }, [showToast]);

  const favoriteVehicles = useMemo(() => {
    return favorites
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }, [favorites, vehicles]);

  // Comparison Actions (Strict Maximum 4)
  const addToCompare = useCallback((vehicleId: string): boolean => {
    if (comparedIds.includes(vehicleId)) return true;
    if (comparedIds.length >= 4) {
      showToast({
        type: 'warning',
        title: 'Comparison Boundary Reached',
        message: 'The telemetry dyno matrix supports a maximum of 4 vehicles simultaneously.',
      });
      return false;
    }
    setComparedIds((prev) => [...prev, vehicleId]);
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    showToast({
      type: 'success',
      title: 'Staged for Dyno Comparison',
      message: `${vehicle?.make || 'Vehicle'} added to telemetry comparison matrix.`,
    });
    return true;
  }, [comparedIds, vehicles, showToast]);

  const removeFromCompare = useCallback((vehicleId: string) => {
    setComparedIds((prev) => prev.filter((id) => id !== vehicleId));
    showToast({
      type: 'info',
      title: 'Removed from Comparison',
      message: 'Vehicle removed from telemetry matrix.',
    });
  }, [showToast]);

  const toggleCompare = useCallback((vehicleId: string) => {
    if (comparedIds.includes(vehicleId)) {
      removeFromCompare(vehicleId);
    } else {
      addToCompare(vehicleId);
    }
  }, [comparedIds, removeFromCompare, addToCompare]);

  const isCompared = useCallback((vehicleId: string) => {
    return comparedIds.includes(vehicleId);
  }, [comparedIds]);

  const clearComparison = useCallback(() => {
    setComparedIds([]);
    showToast({
      type: 'info',
      title: 'Comparison Reset',
      message: 'All staves cleared from the dyno comparison matrix.',
    });
  }, [showToast]);

  const comparedVehicles = useMemo(() => {
    return comparedIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }, [comparedIds, vehicles]);

  // Filter Updates
  const updateFilter = useCallback(
    <K extends keyof VehicleFilterState>(key: K, value: VehicleFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
    showToast({
      type: 'info',
      title: 'Filters Reset',
      message: 'Telemetry filters restored to default parameters.',
    });
  }, [showToast]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.makes.length > 0) count += filters.makes.length;
    if (filters.bodyClasses.length > 0) count += filters.bodyClasses.length;
    if (filters.priceRange[0] > 50000 || filters.priceRange[1] < 400000) count++;
    if (filters.transmissions.length > 0) count += filters.transmissions.length;
    if (filters.drivetrains.length > 0) count += filters.drivetrains.length;
    if (filters.powertrains.length > 0) count += filters.powertrains.length;
    if (filters.maxMileage !== null) count++;
    if (filters.onlyCertified) count++;
    return count;
  }, [filters]);

  const filteredVehicles = useMemo(() => {
    const list = vehicleService.filterVehicles(vehicles, filters);
    return vehicleService.sortVehicles(list, filters.sortBy);
  }, [vehicles, filters]);

  // Booking Actions
  const createBooking = useCallback(
    (payload: {
      serviceId: string;
      serviceName: string;
      vehicleModel?: string;
      preferredDate: string;
      preferredTime: string;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      notes?: string;
    }): Booking | null => {
      // Input Validation
      if (!payload.serviceId || !payload.serviceName) {
        showToast({
          type: 'error',
          title: 'Booking Validation Failed',
          message: 'Please select a valid certified service specification.',
        });
        return null;
      }

      if (!payload.clientName?.trim() || !payload.clientEmail?.trim()) {
        showToast({
          type: 'error',
          title: 'Booking Validation Failed',
          message: 'Client name and email address are required to schedule demo service.',
        });
        return null;
      }

      if (!payload.preferredDate?.trim() || !payload.preferredTime?.trim()) {
        showToast({
          type: 'error',
          title: 'Booking Validation Failed',
          message: 'Please select a preferred service appointment date and time slot.',
        });
        return null;
      }

      const created = bookingService.create(payload);
      setBookings(bookingService.getAll());
      showToast({
        type: 'success',
        title: 'Demo Reservation Staged',
        message: `Reservation ${created.id} confirmed for ${created.serviceName}. Viewable in your dashboard.`,
      });
      return created;
    },
    [showToast]
  );

  const updateBookingStatus = useCallback((id: string, status: Booking['status']) => {
    bookingService.updateStatus(id, status);
    setBookings(bookingService.getAll());
    showToast({
      type: 'info',
      title: 'Booking Status Updated',
      message: `Reservation ${id} updated to status "${status}".`,
    });
  }, [showToast]);

  const cancelBooking = useCallback((id: string) => {
    bookingService.cancel(id);
    setBookings(bookingService.getAll());
    showToast({
      type: 'info',
      title: 'Booking Cancelled',
      message: `Reservation ${id} marked cancelled.`,
    });
  }, [showToast]);

  // Auth / Session Actions
  const loginAs = useCallback((role: 'guest' | 'member' | 'admin') => {
    if (role === 'guest') {
      const guestState: SessionState = {
        role: 'guest',
        user: null,
        isAuthenticated: false,
      };
      setSession(guestState);
      setStorageItem(STORAGE_KEYS.SESSION, guestState);
      showToast({
        type: 'info',
        title: 'Browsing as Guest',
        message: 'You are now viewing Car 911 in unauthenticated guest mode.',
      });
    } else if (role === 'member') {
      const memberState: SessionState = {
        role: 'member',
        user: MOCK_USERS.member,
        isAuthenticated: true,
      };
      setSession(memberState);
      setStorageItem(STORAGE_KEYS.SESSION, memberState);
      showToast({
        type: 'success',
        title: 'Authenticated: VIP Member',
        message: `Logged in as ${MOCK_USERS.member.fullName} (${MOCK_USERS.member.membershipTier}).`,
      });
    } else if (role === 'admin') {
      const adminState: SessionState = {
        role: 'admin',
        user: MOCK_USERS.admin,
        isAuthenticated: true,
      };
      setSession(adminState);
      setStorageItem(STORAGE_KEYS.SESSION, adminState);
      showToast({
        type: 'warning',
        title: 'Authenticated: Platform Director (Admin)',
        message: 'Administrative privileges active for inventory and bookings.',
      });
    }
  }, [showToast]);

  const loginWithCredentials = useCallback((email: string, password?: string): boolean => {
    const result = authService.authenticate(email, password);
    if (!result.success || !result.user || !result.role) {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: result.error || 'Invalid client credentials.',
      });
      return false;
    }

    const newSession: SessionState = {
      role: result.role,
      user: result.user,
      isAuthenticated: true,
    };
    setSession(newSession);
    setStorageItem(STORAGE_KEYS.SESSION, newSession);

    showToast({
      type: result.role === 'admin' ? 'warning' : 'success',
      title: result.role === 'admin' ? 'Platform Director Authenticated' : 'Client Terminal Authenticated',
      message: `Welcome back, ${result.user.fullName}. Private garage session active.`,
    });
    return true;
  }, [showToast]);

  const registerUser = useCallback((userData: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    membershipTier: 'Platinum' | 'Track VIP' | 'Private Collector';
  }): boolean => {
    const result = authService.register(userData);
    if (!result.success || !result.user) {
      showToast({
        type: 'error',
        title: 'Accreditation Failed',
        message: result.error || 'Registration failed. Please check your data.',
      });
      return false;
    }

    const newSession: SessionState = {
      role: 'member',
      user: result.user,
      isAuthenticated: true,
    };
    setSession(newSession);
    setStorageItem(STORAGE_KEYS.SESSION, newSession);

    showToast({
      type: 'success',
      title: 'Accreditation Granted (Demo)',
      message: `Welcome to Car 911, ${result.user.fullName}. Tier: ${result.user.membershipTier}.`,
    });
    return true;
  }, [showToast]);

  const updateProfile = useCallback((updates: {
    fullName?: string;
    phone?: string;
    membershipTier?: 'Platinum' | 'Track VIP' | 'Private Collector';
  }): boolean => {
    if (!session.user) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'No active authenticated session found.',
      });
      return false;
    }

    const updated = authService.updateProfile(session.user.id, updates);
    if (!updated) {
      showToast({
        type: 'error',
        title: 'Profile Update Error',
        message: 'Unable to update demo profile.',
      });
      return false;
    }

    const updatedSession: SessionState = {
      ...session,
      user: updated,
    };
    setSession(updatedSession);
    setStorageItem(STORAGE_KEYS.SESSION, updatedSession);

    showToast({
      type: 'success',
      title: 'Profile Updated (Demo)',
      message: 'Your demonstration client account details were updated.',
    });
    return true;
  }, [session, showToast]);

  const logout = useCallback(() => {
    const guestState: SessionState = {
      role: 'guest',
      user: null,
      isAuthenticated: false,
    };
    setSession(guestState);
    setStorageItem(STORAGE_KEYS.SESSION, guestState);
    showToast({
      type: 'info',
      title: 'Session Disconnected',
      message: 'You have logged out. Non-sensitive preferences (favorites, comparisons) remain preserved.',
    });
    setCurrentRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showToast]);

  // Navigation Helper
  const navigateTo = useCallback(
    (route: RoutePath, params?: { vehicleId?: string; serviceId?: string; dealerId?: string }) => {
      if (params?.vehicleId) {
        setSelectedVehicleId(params.vehicleId);
      }
      if (params?.serviceId) {
        setSelectedServiceId(params.serviceId);
      }
      if (params?.dealerId) {
        setSelectedDealerId(params.dealerId);
      }
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSelectedVehicleId, setSelectedServiceId, setSelectedDealerId]
  );

  // Helper Selectors
  const getVehicleById = useCallback((id: string) => vehicleService.getById(id), []);
  const getDealerById = useCallback((id: string) => dealers.find((d) => d.id === id), [dealers]);
  const getServiceById = useCallback((id: string) => services.find((s) => s.id === id), [services]);
  const getSimilarVehicles = useCallback(
    (vehicleId: string, limit: number = 3) => vehicleService.getSimilar(vehicleId, limit),
    []
  );

  const contextValue: AppContextValue = {
    currentRoute,
    navigateTo,
    vehicles,
    selectedVehicleId,
    selectedVehicle,
    setSelectedVehicleId,
    recentlyViewedIds,
    recentlyViewedVehicles,
    recordVehicleView,
    clearRecentlyViewed,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredVehicles,
    activeFilterCount,
    favorites,
    favoriteVehicles,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    comparedIds,
    comparedVehicles,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isCompared,
    clearComparison,
    services,
    selectedServiceId,
    selectedService,
    setSelectedServiceId,
    dealers,
    selectedDealerId,
    selectedDealer,
    setSelectedDealerId,
    bookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    session,
    loginAs,
    loginWithCredentials,
    registerUser,
    updateProfile,
    logout,
    toast,
    showToast,
    dismissToast,
    getVehicleById,
    getDealerById,
    getServiceById,
    getSimilarVehicles,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
