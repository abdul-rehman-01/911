import { Dealer } from '../types';
import { MOCK_DEALERS } from '../data/mockDealers';
import { apiClient } from './apiClient';

/**
 * Car 911 Dealer & Atelier Repository Service
 */
export const dealerService = {
  getAll(): Dealer[] {
    return [...MOCK_DEALERS];
  },

  getById(id: string): Dealer | undefined {
    return MOCK_DEALERS.find((d) => d.id === id);
  },

  getByCity(city: string): Dealer[] {
    const q = city.toLowerCase();
    return MOCK_DEALERS.filter((d) => d.city.toLowerCase().includes(q));
  },

  getFlagships(): Dealer[] {
    return MOCK_DEALERS.filter((d) => d.isFlagship);
  },

  async fetchDealers(params?: { search?: string; city?: string; country?: string; isFlagship?: boolean }): Promise<Dealer[]> {
    try {
      const res = await apiClient.get<Dealer[]>('/dealers', params);
      if (res.data) return res.data;
    } catch {
      // Fallback cleanly
    }
    return this.getAll();
  },

  async fetchDealerById(id: string): Promise<Dealer | undefined> {
    try {
      const res = await apiClient.get<Dealer>(`/dealers/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback cleanly
    }
    return this.getById(id);
  },
};

