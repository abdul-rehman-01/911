import { apiClient } from './apiClient';
import { Vehicle } from '../types';

export const favoriteService = {
  /**
   * Fetches user favorites from the backend API with fallback
   */
  async fetchFavorites(userId: string): Promise<{ ids: string[]; vehicles: Vehicle[] }> {
    try {
      const res = await apiClient.get<{ favoriteIds: string[]; vehicles: Vehicle[]; count: number }>(
        `/users/${userId}/favorites`
      );
      if (res.data) {
        return {
          ids: res.data.favoriteIds || [],
          vehicles: res.data.vehicles || [],
        };
      }
    } catch (err) {
      console.warn('[FavoriteService] Backend favorites unreachable, using client state:', err);
    }
    return { ids: [], vehicles: [] };
  },

  /**
   * Adds a vehicle to user's favorites via the backend API
   */
  async addFavorite(userId: string, vehicleId: string): Promise<string[] | null> {
    try {
      const res = await apiClient.post<{ favoriteIds: string[]; count: number }>(
        `/users/${userId}/favorites`,
        { vehicleId }
      );
      return res.data?.favoriteIds || null;
    } catch (err) {
      console.warn('[FavoriteService] Backend add favorite failed:', err);
      return null;
    }
  },

  /**
   * Removes a vehicle from user's favorites via the backend API
   */
  async removeFavorite(userId: string, vehicleId: string): Promise<string[] | null> {
    try {
      const res = await apiClient.delete<{ favoriteIds: string[]; count: number }>(
        `/users/${userId}/favorites/${vehicleId}`
      );
      return res.data?.favoriteIds || null;
    } catch (err) {
      console.warn('[FavoriteService] Backend remove favorite failed:', err);
      return null;
    }
  },
};
