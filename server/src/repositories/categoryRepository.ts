import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';

export interface Category {
  id: string;
  name: string;
  description?: string;
  vehicleCount?: number;
  createdAt?: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'coupe', name: 'Coupe', description: 'Hardtop performance aerodynamic chassis', vehicleCount: 5 },
  { id: 'supercars', name: 'Supercars', description: 'Mid-engine extreme aerodynamic race platforms', vehicleCount: 3 },
  { id: 'cabriolet', name: 'Cabriolet', description: 'Open-cockpit high-output grand tourers', vehicleCount: 2 },
  { id: 'targa', name: 'Targa', description: 'Removable roof section with characteristic roll bar', vehicleCount: 1 },
  { id: 'luxury-sedan', name: 'Luxury Sedan', description: 'Executive long-wheelbase performance sedans', vehicleCount: 1 },
  { id: 'perf-suv', name: 'Perf SUV', description: 'All-terrain twin-turbo performance sport utilities', vehicleCount: 1 },
  { id: 'electric-gt', name: 'Electric GT', description: 'Zero-emission high-voltage track grand tourers', vehicleCount: 1 },
];

export class CategoryRepository {
  private inMemoryCategories: Category[] = [...INITIAL_CATEGORIES];

  public async findAll(): Promise<Category[]> {
    if (db) {
      try {
        const rows = await db.select().from(schema.categories);
        if (rows.length > 0) {
          return rows.map((r) => {
            const fallback = this.inMemoryCategories.find((c) => c.id === r.id);
            return {
              id: r.id,
              name: r.name,
              description: r.description || fallback?.description || '',
              vehicleCount: fallback?.vehicleCount || 1,
              createdAt: r.createdAt?.toISOString(),
            };
          });
        }
      } catch (err: any) {
        console.warn('[CategoryRepository] DB query failed, using in-memory fallback:', err.message);
      }
    }
    return [...this.inMemoryCategories];
  }

  public async findById(id: string): Promise<Category | null> {
    const cleanId = id.trim().toLowerCase();
    if (db) {
      try {
        const rows = await db.select().from(schema.categories).where(eq(schema.categories.id, cleanId)).limit(1);
        if (rows.length > 0) {
          const r = rows[0];
          const fallback = this.inMemoryCategories.find((c) => c.id === r.id);
          return {
            id: r.id,
            name: r.name,
            description: r.description || fallback?.description || '',
            vehicleCount: fallback?.vehicleCount || 1,
            createdAt: r.createdAt?.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[CategoryRepository] DB findById failed, using mock fallback:', err.message);
      }
    }
    const found = this.inMemoryCategories.find((c) => c.id.toLowerCase() === cleanId);
    return found ? { ...found } : null;
  }

  public async create(data: { name: string; description?: string }): Promise<Category> {
    const id = data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: Category = {
      id,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      vehicleCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.insert(schema.categories).values({
          id: newCat.id,
          name: newCat.name,
          description: newCat.description,
        }).onConflictDoUpdate({
          target: schema.categories.id,
          set: {
            name: newCat.name,
            description: newCat.description,
          },
        });
      } catch (err: any) {
        console.warn('[CategoryRepository] DB insert failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.inMemoryCategories[idx] = newCat;
    } else {
      this.inMemoryCategories.push(newCat);
    }

    return newCat;
  }

  public async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const updateData: Record<string, any> = {};
        if (updates.name !== undefined) updateData.name = updates.name.trim();
        if (updates.description !== undefined) updateData.description = updates.description.trim();

        await db.update(schema.categories).set(updateData).where(eq(schema.categories.id, cleanId));
      } catch (err: any) {
        console.warn('[CategoryRepository] DB update failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryCategories.findIndex((c) => c.id.toLowerCase() === cleanId);
    if (idx === -1) return null;

    this.inMemoryCategories[idx] = {
      ...this.inMemoryCategories[idx],
      ...updates,
      name: updates.name ? updates.name.trim() : this.inMemoryCategories[idx].name,
    };

    return { ...this.inMemoryCategories[idx] };
  }

  public async delete(id: string): Promise<boolean> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        await db.delete(schema.categories).where(eq(schema.categories.id, cleanId));
      } catch (err: any) {
        console.warn('[CategoryRepository] DB delete failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryCategories.findIndex((c) => c.id === cleanId);
    if (idx !== -1) {
      this.inMemoryCategories.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const categoryRepository = new CategoryRepository();
