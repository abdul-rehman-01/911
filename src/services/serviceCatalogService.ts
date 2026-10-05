import { Service } from '../types';
import { MOCK_SERVICES } from '../data/mockServices';
import { apiClient } from './apiClient';

/**
 * Car 911 Performance Services Repository Service
 */
export const serviceCatalogService = {
  getAll(): Service[] {
    return [...MOCK_SERVICES];
  },

  getById(id: string): Service | undefined {
    return MOCK_SERVICES.find((s) => s.id === id);
  },

  getBySlug(slug: string): Service | undefined {
    return MOCK_SERVICES.find((s) => s.slug === slug);
  },

  getByCategory(category: string): Service[] {
    return MOCK_SERVICES.filter(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
  },

  async fetchServices(params?: { category?: string; search?: string }): Promise<Service[]> {
    try {
      const res = await apiClient.get<Service[]>('/services', params);
      if (res.data) return res.data;
    } catch {
      // Fallback cleanly
    }
    return this.getAll();
  },

  async fetchServiceById(id: string): Promise<Service | undefined> {
    try {
      const res = await apiClient.get<Service>(`/services/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback cleanly
    }
    return this.getById(id);
  },
};

