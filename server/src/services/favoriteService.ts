import { favoriteRepository } from '../repositories/favoriteRepository.ts';
import { vehicleRepository } from '../repositories/vehicleRepository.ts';
import { Vehicle } from '../models/index.ts';

export class FavoriteBackendService {
  public async getUserFavorites(userId: string): Promise<{ ids: string[]; vehicles: Vehicle[] }> {
    const ids = await favoriteRepository.getFavoriteIds(userId);
    const vehicles = await favoriteRepository.getFavoriteVehicles(userId);
    return { ids, vehicles };
  }

  public async addFavorite(
    userId: string,
    vehicleId: string
  ): Promise<{ success: boolean; favoriteIds: string[]; error?: string }> {
    if (!vehicleId || typeof vehicleId !== 'string') {
      return { success: false, favoriteIds: [], error: 'vehicleId is required' };
    }

    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      return { success: false, favoriteIds: [], error: 'Vehicle does not exist in registry' };
    }

    const favoriteIds = await favoriteRepository.addFavorite(userId, vehicle.id);
    return { success: true, favoriteIds };
  }

  public async removeFavorite(
    userId: string,
    vehicleId: string
  ): Promise<{ success: boolean; favoriteIds: string[] }> {
    const favoriteIds = await favoriteRepository.removeFavorite(userId, vehicleId);
    return { success: true, favoriteIds };
  }
}

export const favoriteBackendService = new FavoriteBackendService();
