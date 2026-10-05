import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';

export interface Brand {
  id: string;
  name: string;
  country?: string;
  logoUrl?: string;
  vehicleCount?: number;
  createdAt?: string;
}

const INITIAL_BRANDS: Brand[] = [
  { id: 'porsche', name: 'Porsche', country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80', vehicleCount: 6 },
  { id: 'ferrari', name: 'Ferrari', country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80', vehicleCount: 2 },
  { id: 'mclaren', name: 'McLaren', country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
  { id: 'aston-martin', name: 'Aston Martin', country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
  { id: 'audi', name: 'Audi', country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
  { id: 'lamborghini', name: 'Lamborghini', country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=80', vehicleCount: 1 },
];

export class BrandRepository {
  private inMemoryBrands: Brand[] = [...INITIAL_BRANDS];

  public async findAll(): Promise<Brand[]> {
    if (db) {
      try {
        const rows = await db.select().from(schema.brands);
        if (rows.length > 0) {
          return rows.map((r) => {
            const fallback = this.inMemoryBrands.find((b) => b.id === r.id);
            return {
              id: r.id,
              name: r.name,
              country: r.country || fallback?.country || 'Global',
              logoUrl: r.logoUrl || fallback?.logoUrl || '',
              vehicleCount: fallback?.vehicleCount || 1,
              createdAt: r.createdAt?.toISOString(),
            };
          });
        }
      } catch (err: any) {
        console.warn('[BrandRepository] DB query failed, using in-memory fallback:', err.message);
      }
    }
    return [...this.inMemoryBrands];
  }

  public async findById(id: string): Promise<Brand | null> {
    const cleanId = id.trim().toLowerCase();
    if (db) {
      try {
        const rows = await db.select().from(schema.brands).where(eq(schema.brands.id, cleanId)).limit(1);
        if (rows.length > 0) {
          const r = rows[0];
          const fallback = this.inMemoryBrands.find((b) => b.id === r.id);
          return {
            id: r.id,
            name: r.name,
            country: r.country || fallback?.country || 'Global',
            logoUrl: r.logoUrl || fallback?.logoUrl || '',
            vehicleCount: fallback?.vehicleCount || 1,
            createdAt: r.createdAt?.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[BrandRepository] DB findById failed, using mock fallback:', err.message);
      }
    }
    const found = this.inMemoryBrands.find((b) => b.id.toLowerCase() === cleanId);
    return found ? { ...found } : null;
  }

  public async create(data: { name: string; country?: string; logoUrl?: string }): Promise<Brand> {
    const id = data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newBrand: Brand = {
      id,
      name: data.name.trim(),
      country: data.country?.trim() || 'Global',
      logoUrl: data.logoUrl?.trim() || '',
      vehicleCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.insert(schema.brands).values({
          id: newBrand.id,
          name: newBrand.name,
          country: newBrand.country,
          logoUrl: newBrand.logoUrl,
        }).onConflictDoUpdate({
          target: schema.brands.id,
          set: {
            name: newBrand.name,
            country: newBrand.country,
            logoUrl: newBrand.logoUrl,
          },
        });
      } catch (err: any) {
        console.warn('[BrandRepository] DB insert failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryBrands.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.inMemoryBrands[idx] = newBrand;
    } else {
      this.inMemoryBrands.push(newBrand);
    }

    return newBrand;
  }

  public async update(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const updateData: Record<string, any> = {};
        if (updates.name !== undefined) updateData.name = updates.name.trim();
        if (updates.country !== undefined) updateData.country = updates.country.trim();
        if (updates.logoUrl !== undefined) updateData.logoUrl = updates.logoUrl.trim();

        await db.update(schema.brands).set(updateData).where(eq(schema.brands.id, cleanId));
      } catch (err: any) {
        console.warn('[BrandRepository] DB update failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryBrands.findIndex((b) => b.id.toLowerCase() === cleanId);
    if (idx === -1) return null;

    this.inMemoryBrands[idx] = {
      ...this.inMemoryBrands[idx],
      ...updates,
      name: updates.name ? updates.name.trim() : this.inMemoryBrands[idx].name,
    };

    return { ...this.inMemoryBrands[idx] };
  }

  public async delete(id: string): Promise<boolean> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        await db.delete(schema.brands).where(eq(schema.brands.id, cleanId));
      } catch (err: any) {
        console.warn('[BrandRepository] DB delete failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryBrands.findIndex((b) => b.id.toLowerCase() === cleanId);
    if (idx !== -1) {
      this.inMemoryBrands.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const brandRepository = new BrandRepository();
