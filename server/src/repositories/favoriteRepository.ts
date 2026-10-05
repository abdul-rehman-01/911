import { eq, and } from 'drizzle-orm';
import { Vehicle } from '../models/index.ts';
import { vehicleRepository } from './vehicleRepository.ts';
import { db, schema } from '../db/index.ts';

export class FavoriteRepository {
  private inMemoryFavorites: Map<string, Set<string>> = new Map();

  constructor() {
    const memberFavorites = new Set<string>(['v-porsche-911-carrera-4-gts', 'v-ferrari-296-gtb']);
    this.inMemoryFavorites.set('user-demo-member', memberFavorites);
    this.inMemoryFavorites.set('user-vip-001', new Set<string>(['v-porsche-911-carrera-4-gts']));
  }

  public async getFavoriteIds(userId: string): Promise<string[]> {
    if (db) {
      try {
        const rows = await db
          .select({ vehicleId: schema.favorites.vehicleId })
          .from(schema.favorites)
          .where(eq(schema.favorites.userId, userId));

        if (rows.length > 0) {
          const ids = rows.map((r) => r.vehicleId);
          // Keep in-memory cache synchronized
          this.inMemoryFavorites.set(userId, new Set(ids));
          return ids;
        }
      } catch (err: any) {
        console.warn('[FavoriteRepository] DB query failed, using in-memory watchlist:', err.message);
      }
    }

    const favorites = this.inMemoryFavorites.get(userId);
    return favorites ? Array.from(favorites) : [];
  }

  public async getFavoriteVehicles(userId: string): Promise<Vehicle[]> {
    const ids = await this.getFavoriteIds(userId);
    const vehicles: Vehicle[] = [];
    for (const id of ids) {
      const v = await vehicleRepository.findById(id);
      if (v) vehicles.push(v);
    }
    return vehicles;
  }

  public async addFavorite(userId: string, vehicleId: string): Promise<string[]> {
    // 1. In-memory update
    let set = this.inMemoryFavorites.get(userId);
    if (!set) {
      set = new Set<string>();
      this.inMemoryFavorites.set(userId, set);
    }
    set.add(vehicleId);

    // 2. Database persistence with conflict protection
    if (db) {
      try {
        // Ensure user exists first or create a stub to satisfy foreign key
        await db
          .insert(schema.users)
          .values({
            id: userId,
            email: `${userId}@car911.com`,
            fullName: 'Client Member',
          })
          .onConflictDoNothing();

        await db
          .insert(schema.favorites)
          .values({
            id: `fav-${userId}-${vehicleId}`,
            userId,
            vehicleId,
          })
          .onConflictDoNothing({
            target: [schema.favorites.userId, schema.favorites.vehicleId],
          });
      } catch (err: any) {
        console.warn('[FavoriteRepository] DB insert favorite failed, stored in memory:', err.message);
      }
    }

    return Array.from(set);
  }

  public async removeFavorite(userId: string, vehicleId: string): Promise<string[]> {
    // 1. In-memory update
    const set = this.inMemoryFavorites.get(userId);
    if (set) {
      set.delete(vehicleId);
    }

    // 2. Database deletion
    if (db) {
      try {
        await db
          .delete(schema.favorites)
          .where(
            and(
              eq(schema.favorites.userId, userId),
              eq(schema.favorites.vehicleId, vehicleId)
            )
          );
      } catch (err: any) {
        console.warn('[FavoriteRepository] DB remove favorite failed, removed from memory:', err.message);
      }
    }

    return set ? Array.from(set) : [];
  }

  public async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const ids = await this.getFavoriteIds(userId);
    return ids.includes(vehicleId);
  }
}

export const favoriteRepository = new FavoriteRepository();
