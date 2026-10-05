import { eq } from 'drizzle-orm';
import { Dealer } from '../models/index.ts';
import { MOCK_DEALERS } from '../../../src/data/mockDealers.ts';
import { db, schema } from '../db/index.ts';

export interface DealerQueryParams {
  search?: string;
  city?: string;
  country?: string;
  brand?: string;
  isFlagship?: boolean;
}

export class DealerRepository {
  private inMemoryDealers: Dealer[] = [...MOCK_DEALERS];

  public async findAll(params: DealerQueryParams = {}): Promise<Dealer[]> {
    if (db) {
      try {
        const rows = await db.select().from(schema.dealers);

        if (rows.length > 0) {
          let mapped: Dealer[] = rows.map((r) => {
            const fallback = this.inMemoryDealers.find((d) => d.id === r.id);
            return {
              id: r.id,
              name: r.name,
              slug: fallback?.slug || r.id,
              address: r.address,
              city: r.city,
              state: r.state || '',
              country: r.country,
              postalCode: fallback?.postalCode || '90210',
              phone: r.phone,
              email: r.email,
              hours: fallback?.hours || 'Mon-Sat: 9:00 AM - 7:00 PM',
              coordinates: {
                lat: r.latitude || fallback?.coordinates.lat || 34.0736,
                lng: r.longitude || fallback?.coordinates.lng || -118.4004,
              },
              mapStaticImage: fallback?.mapStaticImage || '',
              allocatedInventoryCount: fallback?.allocatedInventoryCount || 8,
              isFlagship: r.isFlagship,
            };
          });

          if (params.search) {
            const q = params.search.toLowerCase().trim();
            mapped = mapped.filter(
              (d) =>
                d.name.toLowerCase().includes(q) ||
                d.city.toLowerCase().includes(q) ||
                d.state.toLowerCase().includes(q) ||
                d.country.toLowerCase().includes(q) ||
                d.address.toLowerCase().includes(q)
            );
          }

          if (params.city) {
            const city = params.city.toLowerCase().trim();
            mapped = mapped.filter((d) => d.city.toLowerCase().includes(city));
          }

          if (params.country) {
            const country = params.country.toLowerCase().trim();
            mapped = mapped.filter((d) => d.country.toLowerCase().includes(country));
          }

          if (params.brand) {
            const brand = params.brand.toLowerCase().trim();
            mapped = mapped.filter((d) =>
              d.name.toLowerCase().includes(brand)
            );
          }

          if (params.isFlagship !== undefined) {
            mapped = mapped.filter((d) => d.isFlagship === params.isFlagship);
          }

          return mapped;
        }
      } catch (err: any) {
        console.warn('[DealerRepository] DB query failed, falling back to mock dealers:', err.message);
      }
    }

    let result = [...this.inMemoryDealers];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }

    if (params.city) {
      const city = params.city.toLowerCase().trim();
      result = result.filter((d) => d.city.toLowerCase().includes(city));
    }

    if (params.country) {
      const country = params.country.toLowerCase().trim();
      result = result.filter((d) => d.country.toLowerCase().includes(country));
    }

    if (params.brand) {
      const brand = params.brand.toLowerCase().trim();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(brand)
      );
    }

    if (params.isFlagship !== undefined) {
      result = result.filter((d) => d.isFlagship === params.isFlagship);
    }

    return result;
  }

  public async findById(id: string): Promise<Dealer | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.dealers)
          .where(eq(schema.dealers.id, cleanId))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          const fallback = this.inMemoryDealers.find((d) => d.id === r.id);
          return {
            id: r.id,
            name: r.name,
            slug: fallback?.slug || r.id,
            address: r.address,
            city: r.city,
            state: r.state || '',
            country: r.country,
            postalCode: fallback?.postalCode || '90210',
            phone: r.phone,
            email: r.email,
            hours: fallback?.hours || 'Mon-Sat: 9:00 AM - 7:00 PM',
            coordinates: {
              lat: r.latitude || fallback?.coordinates.lat || 34.0736,
              lng: r.longitude || fallback?.coordinates.lng || -118.4004,
            },
            mapStaticImage: fallback?.mapStaticImage || '',
            allocatedInventoryCount: fallback?.allocatedInventoryCount || 8,
            isFlagship: r.isFlagship,
          };
        }
      } catch (err: any) {
        console.warn('[DealerRepository] DB findById failed, using mock fallback:', err.message);
      }
    }

    const dealer = this.inMemoryDealers.find((d) => d.id.toLowerCase() === cleanId);
    return dealer || null;
  }

  public async create(dealer: Dealer): Promise<Dealer> {
    if (db) {
      try {
        await db.insert(schema.dealers).values({
          id: dealer.id,
          name: dealer.name,
          address: dealer.address,
          city: dealer.city,
          state: dealer.state,
          country: dealer.country,
          phone: dealer.phone,
          email: dealer.email,
          isFlagship: dealer.isFlagship,
          latitude: dealer.coordinates.lat,
          longitude: dealer.coordinates.lng,
        }).onConflictDoUpdate({
          target: schema.dealers.id,
          set: {
            name: dealer.name,
            phone: dealer.phone,
            email: dealer.email,
            isFlagship: dealer.isFlagship,
          },
        });
      } catch (err: any) {
        console.warn('[DealerRepository] DB insert failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryDealers.findIndex((d) => d.id === dealer.id);
    if (idx !== -1) {
      this.inMemoryDealers[idx] = dealer;
    } else {
      this.inMemoryDealers.push(dealer);
    }
    return dealer;
  }

  public async update(id: string, updates: Partial<Dealer>): Promise<Dealer | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const merged: Dealer = {
      ...existing,
      ...updates,
      coordinates: {
        ...existing.coordinates,
        ...(updates.coordinates || {}),
      },
    };

    if (db) {
      try {
        const updateData: Record<string, any> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.address !== undefined) updateData.address = updates.address;
        if (updates.city !== undefined) updateData.city = updates.city;
        if (updates.state !== undefined) updateData.state = updates.state;
        if (updates.country !== undefined) updateData.country = updates.country;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.isFlagship !== undefined) updateData.isFlagship = updates.isFlagship;

        await db.update(schema.dealers).set(updateData).where(eq(schema.dealers.id, id));
      } catch (err: any) {
        console.warn('[DealerRepository] DB update failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryDealers.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.inMemoryDealers[idx] = merged;
    }
    return merged;
  }

  public async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.dealers).where(eq(schema.dealers.id, id));
      } catch (err: any) {
        console.warn('[DealerRepository] DB delete failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryDealers.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.inMemoryDealers.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const dealerRepository = new DealerRepository();
