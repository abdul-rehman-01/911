import { eq, or } from 'drizzle-orm';
import { Service } from '../models/index.ts';
import { MOCK_SERVICES } from '../../../src/data/mockServices.ts';
import { db, schema } from '../db/index.ts';

export interface ServiceQueryParams {
  category?: string;
  search?: string;
}

export class ServiceRepository {
  private inMemoryServices: Service[] = [...MOCK_SERVICES];

  public async findAll(params: ServiceQueryParams = {}): Promise<Service[]> {
    if (db) {
      try {
        const rows = await db.select().from(schema.services);

        if (rows.length > 0) {
          let mapped: Service[] = rows.map((r) => {
            const fallback = this.inMemoryServices.find((s) => s.id === r.id);
            return {
              id: r.id,
              slug: r.slug,
              name: r.title,
              category: r.category,
              shortDescription: r.shortDescription,
              fullDescription: r.fullDescription || fallback?.fullDescription || '',
              icon: fallback?.icon || 'Wrench',
              priceEstimate: fallback?.priceEstimate || `$${r.startingPriceUsd.toLocaleString()}`,
              turnaroundTime: r.estimatedDuration || fallback?.turnaroundTime || '2-4 hours',
              features: (r.features as string[]) || fallback?.features || [],
            };
          });

          if (params.category) {
            const cat = params.category.toLowerCase().trim();
            mapped = mapped.filter((s) => s.category.toLowerCase().includes(cat));
          }

          if (params.search) {
            const q = params.search.toLowerCase().trim();
            mapped = mapped.filter(
              (s) =>
                s.name.toLowerCase().includes(q) ||
                s.shortDescription.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
          }

          return mapped;
        }
      } catch (err: any) {
        console.warn('[ServiceRepository] DB query failed, falling back to mock services:', err.message);
      }
    }

    let result = [...this.inMemoryServices];

    if (params.category) {
      const cat = params.category.toLowerCase().trim();
      result = result.filter((s) => s.category.toLowerCase().includes(cat));
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public async findById(id: string): Promise<Service | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.services)
          .where(
            or(
              eq(schema.services.id, cleanId),
              eq(schema.services.slug, cleanId)
            )
          )
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          const fallback = this.inMemoryServices.find((s) => s.id === r.id);
          return {
            id: r.id,
            slug: r.slug,
            name: r.title,
            category: r.category,
            shortDescription: r.shortDescription,
            fullDescription: r.fullDescription || fallback?.fullDescription || '',
            icon: fallback?.icon || 'Wrench',
            priceEstimate: fallback?.priceEstimate || `$${r.startingPriceUsd.toLocaleString()}`,
            turnaroundTime: r.estimatedDuration || fallback?.turnaroundTime || '2-4 hours',
            features: (r.features as string[]) || fallback?.features || [],
          };
        }
      } catch (err: any) {
        console.warn('[ServiceRepository] DB findById failed, using mock fallback:', err.message);
      }
    }

    const service = this.inMemoryServices.find(
      (s) => s.id.toLowerCase() === cleanId || s.slug.toLowerCase() === cleanId
    );
    return service || null;
  }

  public async create(service: Service): Promise<Service> {
    if (db) {
      try {
        const parsedPrice = parseInt(service.priceEstimate.replace(/[^0-9]/g, ''), 10) || 500;
        await db.insert(schema.services).values({
          id: service.id,
          slug: service.slug,
          title: service.name,
          category: service.category,
          shortDescription: service.shortDescription,
          fullDescription: service.fullDescription,
          estimatedDuration: service.turnaroundTime,
          startingPriceUsd: parsedPrice,
          features: service.features,
        }).onConflictDoUpdate({
          target: schema.services.id,
          set: {
            title: service.name,
            category: service.category,
            shortDescription: service.shortDescription,
            fullDescription: service.fullDescription,
            estimatedDuration: service.turnaroundTime,
            startingPriceUsd: parsedPrice,
            features: service.features,
          },
        });
      } catch (err: any) {
        console.warn('[ServiceRepository] DB insert failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryServices.findIndex((s) => s.id === service.id);
    if (idx !== -1) {
      this.inMemoryServices[idx] = service;
    } else {
      this.inMemoryServices.push(service);
    }
    return service;
  }

  public async update(id: string, updates: Partial<Service>): Promise<Service | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const merged: Service = {
      ...existing,
      ...updates,
      features: updates.features || existing.features,
    };

    if (db) {
      try {
        const updateData: Record<string, any> = {};
        if (updates.name !== undefined) updateData.title = updates.name;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.shortDescription !== undefined) updateData.shortDescription = updates.shortDescription;
        if (updates.fullDescription !== undefined) updateData.fullDescription = updates.fullDescription;
        if (updates.turnaroundTime !== undefined) updateData.estimatedDuration = updates.turnaroundTime;
        if (updates.priceEstimate !== undefined) {
          updateData.startingPriceUsd = parseInt(updates.priceEstimate.replace(/[^0-9]/g, ''), 10) || 500;
        }
        if (updates.features !== undefined) updateData.features = updates.features;

        await db.update(schema.services).set(updateData).where(eq(schema.services.id, id));
      } catch (err: any) {
        console.warn('[ServiceRepository] DB update failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryServices.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.inMemoryServices[idx] = merged;
    }
    return merged;
  }

  public async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.services).where(eq(schema.services.id, id));
      } catch (err: any) {
        console.warn('[ServiceRepository] DB delete failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryServices.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.inMemoryServices.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const serviceRepository = new ServiceRepository();
