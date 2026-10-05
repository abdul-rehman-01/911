import { Booking } from '../types';
import { MOCK_BOOKINGS } from '../data/mockBookings';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { apiClient } from './apiClient';

/**
 * Car 911 Service Booking Repository Service
 * Uses persistent client storage initialized with authentic demo records,
 * and synchronizes with the /api/v1/bookings REST endpoints.
 */
export const bookingService = {
  getAll(): Booking[] {
    return getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS);
  },

  getById(id: string): Booking | undefined {
    return this.getAll().find((b) => b.id === id);
  },

  getByUserEmail(email: string): Booking[] {
    const cleanEmail = email.toLowerCase().trim();
    return this.getAll().filter((b) => b.clientEmail.toLowerCase() === cleanEmail);
  },

  create(payload: {
    serviceId: string;
    serviceName: string;
    vehicleModel?: string;
    preferredDate: string;
    preferredTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  }): Booking {
    const current = this.getAll();
    const newBooking: Booking = {
      id: `bk-911-${Date.now().toString().slice(-6)}`,
      ...payload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [newBooking, ...current];
    setStorageItem(STORAGE_KEYS.BOOKINGS, updated);

    // Asynchronously push to backend API without blocking client UI
    apiClient.post<Booking>('/bookings', payload).catch((err) => {
      console.warn('[BookingService] Backend sync deferred:', err);
    });

    return newBooking;
  },

  updateStatus(id: string, status: Booking['status']): boolean {
    const current = this.getAll();
    const index = current.findIndex((b) => b.id === id);
    if (index === -1) return false;

    current[index] = { ...current[index], status };
    setStorageItem(STORAGE_KEYS.BOOKINGS, current);

    // Asynchronously update on backend API
    apiClient.patch<Booking>(`/bookings/${id}`, { status }).catch((err) => {
      console.warn('[BookingService] Backend status sync deferred:', err);
    });

    return true;
  },

  cancel(id: string): boolean {
    return this.updateStatus(id, 'Cancelled');
  },

  /**
   * Async backend fetch with fallback
   */
  async fetchBookings(userEmail?: string): Promise<Booking[]> {
    try {
      const res = await apiClient.get<Booking[]>('/bookings', { userEmail });
      if (res.data) {
        return res.data;
      }
    } catch {
      // Fallback cleanly to local storage
    }
    return userEmail ? this.getByUserEmail(userEmail) : this.getAll();
  },
};

