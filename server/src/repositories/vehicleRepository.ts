import { eq, or } from 'drizzle-orm';
import { Vehicle } from '../models/index.ts';
import { MOCK_VEHICLES } from '../../../src/data/mockVehicles.ts';
import { db, schema } from '../db/index.ts';

export interface VehicleQueryParams {
  search?: string;
  brand?: string;
  make?: string;
  category?: string;
  bodyClass?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  drivetrain?: string;
  powertrain?: string;
  fuelType?: string;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  onlyCertified?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * PostgreSQL-integrated Vehicle Repository with seamless In-Memory Mock Fallback
 */
export class VehicleRepository {
  private inMemoryVehicles: Vehicle[] = [...MOCK_VEHICLES];

  public async findAll(params: VehicleQueryParams = {}): Promise<PaginatedResult<Vehicle>> {
    if (db) {
      try {
        const rows = await db.select().from(schema.vehicles);

        if (rows.length > 0) {
          let mapped: Vehicle[] = rows.map((r) => {
            const fallback = this.inMemoryVehicles.find((v) => v.id === r.id) || this.inMemoryVehicles[0];
            return {
              ...fallback,
              id: r.id,
              slug: r.slug,
              make: r.make,
              model: r.model,
              year: r.year,
              trim: r.trim || fallback.trim,
              chassisCode: r.chassisCode || fallback.chassisCode,
              vin: r.vin || fallback.vin,
              priceUsd: r.priceUsd,
              exteriorColor: r.exteriorColor || fallback.exteriorColor,
              interiorColor: r.interiorColor || fallback.interiorColor,
              isCertified: r.isCertified,
              telemetry: {
                ...fallback.telemetry,
                outputHp: r.outputHp,
                torqueLbFt: r.torqueLbFt,
                topSpeedMph: r.topSpeedMph,
                transmission: r.transmission,
                mileageMiles: r.mileageMiles,
              },
            };
          });

          return this.applyFiltersAndPagination(mapped, params);
        }
      } catch (err: any) {
        console.warn('[VehicleRepository] DB query failed, falling back to mock catalog:', err.message);
      }
    }

    return this.applyFiltersAndPagination(this.inMemoryVehicles, params);
  }

  public async findById(id: string): Promise<Vehicle | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.vehicles)
          .where(
            or(
              eq(schema.vehicles.id, cleanId),
              eq(schema.vehicles.slug, cleanId)
            )
          )
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          const fallback = this.inMemoryVehicles.find(
            (v) => v.id.toLowerCase() === cleanId || v.slug.toLowerCase() === cleanId
          ) || this.inMemoryVehicles[0];

          return {
            ...fallback,
            id: r.id,
            slug: r.slug,
            make: r.make,
            model: r.model,
            year: r.year,
            trim: r.trim || fallback.trim,
            chassisCode: r.chassisCode || fallback.chassisCode,
            vin: r.vin || fallback.vin,
            priceUsd: r.priceUsd,
            exteriorColor: r.exteriorColor || fallback.exteriorColor,
            interiorColor: r.interiorColor || fallback.interiorColor,
            isCertified: r.isCertified,
            telemetry: {
              ...fallback.telemetry,
              outputHp: r.outputHp,
              torqueLbFt: r.torqueLbFt,
              topSpeedMph: r.topSpeedMph,
              transmission: r.transmission,
              mileageMiles: r.mileageMiles,
            },
          };
        }
      } catch (err: any) {
        console.warn('[VehicleRepository] DB findById failed, checking mock catalog:', err.message);
      }
    }

    const vehicle = this.inMemoryVehicles.find(
      (v) => v.id.toLowerCase() === cleanId || v.slug.toLowerCase() === cleanId
    );
    return vehicle || null;
  }

  public async findSimilar(id: string, limit: number = 3): Promise<Vehicle[]> {
    const target = await this.findById(id);
    const source = this.inMemoryVehicles;

    if (!target) {
      return source.slice(0, limit);
    }

    return source
      .filter((v) => v.id !== target.id)
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.bodyClass === target.bodyClass) scoreA += 3;
        if (b.bodyClass === target.bodyClass) scoreB += 3;
        if (a.make === target.make) scoreA += 2;
        if (b.make === target.make) scoreB += 2;
        const priceDiffA = Math.abs(a.priceUsd - target.priceUsd);
        const priceDiffB = Math.abs(b.priceUsd - target.priceUsd);
        return scoreB - scoreA || priceDiffA - priceDiffB;
      })
      .slice(0, limit);
  }

  private applyFiltersAndPagination(vehicles: Vehicle[], params: VehicleQueryParams): PaginatedResult<Vehicle> {
    let filtered = [...vehicles];

    // 1. Text Search
    const search = (params.search || '').trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.make.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search) ||
          v.trim.toLowerCase().includes(search) ||
          v.chassisCode.toLowerCase().includes(search) ||
          v.vin.toLowerCase().includes(search) ||
          v.bodyClass.toLowerCase().includes(search) ||
          v.exteriorColor.toLowerCase().includes(search)
      );
    }

    // 2. Brand / Make
    const brand = (params.brand || params.make || '').trim().toLowerCase();
    if (brand) {
      filtered = filtered.filter((v) => v.make.toLowerCase().includes(brand));
    }

    // 3. Category / Body Class
    const bodyClass = (params.category || params.bodyClass || '').trim().toLowerCase();
    if (bodyClass) {
      filtered = filtered.filter((v) => v.bodyClass.toLowerCase() === bodyClass);
    }

    // 4. Valuation / Price
    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      filtered = filtered.filter((v) => v.priceUsd >= (params.minPrice as number));
    }
    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      filtered = filtered.filter((v) => v.priceUsd <= (params.maxPrice as number));
    }

    // 5. Year
    if (params.minYear !== undefined && !isNaN(params.minYear)) {
      filtered = filtered.filter((v) => v.year >= (params.minYear as number));
    }
    if (params.maxYear !== undefined && !isNaN(params.maxYear)) {
      filtered = filtered.filter((v) => v.year <= (params.maxYear as number));
    }

    // 6. Transmission
    const transmission = (params.transmission || '').trim().toLowerCase();
    if (transmission) {
      filtered = filtered.filter((v) =>
        v.telemetry.transmission.toLowerCase().includes(transmission)
      );
    }

    // 7. Drivetrain
    const drivetrain = (params.drivetrain || '').trim().toUpperCase();
    if (drivetrain) {
      filtered = filtered.filter((v) => v.telemetry.drivetrain.toUpperCase() === drivetrain);
    }

    // 8. Powertrain / Fuel Type
    const fuelType = (params.powertrain || params.fuelType || '').trim().toLowerCase();
    if (fuelType) {
      filtered = filtered.filter((v) => v.telemetry.fuelType.toLowerCase() === fuelType);
    }

    // 9. Mileage
    if (params.maxMileage !== undefined && !isNaN(params.maxMileage)) {
      filtered = filtered.filter((v) => v.telemetry.mileageMiles <= (params.maxMileage as number));
    }

    // 10. Certified
    if (params.onlyCertified === true) {
      filtered = filtered.filter((v) => v.isCertified);
    }

    // Sorting
    const sort = params.sort || 'recommended';
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case 'horsepower':
        filtered.sort((a, b) => b.telemetry.outputHp - a.telemetry.outputHp);
        break;
      case 'mileage':
        filtered.sort((a, b) => a.telemetry.mileageMiles - b.telemetry.mileageMiles);
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => {
          if (a.isCertified && !b.isCertified) return -1;
          if (!a.isCertified && b.isCertified) return 1;
          return b.telemetry.outputHp - a.telemetry.outputHp;
        });
        break;
    }

    const total = filtered.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  public async create(vehicle: Vehicle): Promise<Vehicle> {
    if (db) {
      try {
        const brandId = vehicle.make.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const categoryId = vehicle.bodyClass.toLowerCase().replace(/[^a-z0-9]/g, '-');

        await db.insert(schema.vehicles).values({
          id: vehicle.id,
          slug: vehicle.slug,
          brandId,
          categoryId,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          trim: vehicle.trim,
          chassisCode: vehicle.chassisCode,
          vin: vehicle.vin,
          priceUsd: vehicle.priceUsd,
          exteriorColor: vehicle.exteriorColor,
          interiorColor: vehicle.interiorColor,
          isCertified: vehicle.isCertified,
          status: vehicle.inStock ? 'available' : 'reserved',
          outputHp: vehicle.telemetry.outputHp,
          torqueLbFt: vehicle.telemetry.torqueLbFt,
          zeroToSixtySec: vehicle.telemetry.acceleration0to100,
          topSpeedMph: vehicle.telemetry.topSpeedMph,
          transmission: vehicle.telemetry.transmission,
          drivetrain: vehicle.telemetry.drivetrain,
          fuelType: vehicle.telemetry.fuelType,
          mileageMiles: vehicle.telemetry.mileageMiles,
          engineSpec: vehicle.telemetry.engineDisplacement,
        }).onConflictDoUpdate({
          target: schema.vehicles.id,
          set: {
            priceUsd: vehicle.priceUsd,
            mileageMiles: vehicle.telemetry.mileageMiles,
            isCertified: vehicle.isCertified,
            updatedAt: new Date(),
          },
        });
      } catch (err: any) {
        console.warn('[VehicleRepository] DB insert failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryVehicles.findIndex((v) => v.id === vehicle.id);
    if (idx !== -1) {
      this.inMemoryVehicles[idx] = vehicle;
    } else {
      this.inMemoryVehicles.unshift(vehicle);
    }

    return vehicle;
  }

  public async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const merged: Vehicle = {
      ...existing,
      ...updates,
      telemetry: {
        ...existing.telemetry,
        ...(updates.telemetry || {}),
      },
    };

    if (db) {
      try {
        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (updates.make !== undefined) updateData.make = updates.make;
        if (updates.model !== undefined) updateData.model = updates.model;
        if (updates.year !== undefined) updateData.year = updates.year;
        if (updates.trim !== undefined) updateData.trim = updates.trim;
        if (updates.priceUsd !== undefined) updateData.priceUsd = updates.priceUsd;
        if (updates.exteriorColor !== undefined) updateData.exteriorColor = updates.exteriorColor;
        if (updates.interiorColor !== undefined) updateData.interiorColor = updates.interiorColor;
        if (updates.isCertified !== undefined) updateData.isCertified = updates.isCertified;
        if (updates.telemetry?.outputHp !== undefined) updateData.outputHp = updates.telemetry.outputHp;
        if (updates.telemetry?.topSpeedMph !== undefined) updateData.topSpeedMph = updates.telemetry.topSpeedMph;
        if (updates.telemetry?.mileageMiles !== undefined) updateData.mileageMiles = updates.telemetry.mileageMiles;

        await db.update(schema.vehicles).set(updateData).where(eq(schema.vehicles.id, id));
      } catch (err: any) {
        console.warn('[VehicleRepository] DB update failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryVehicles.findIndex((v) => v.id === id);
    if (idx !== -1) {
      this.inMemoryVehicles[idx] = merged;
    }

    return merged;
  }

  public async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.vehicles).where(eq(schema.vehicles.id, id));
      } catch (err: any) {
        console.warn('[VehicleRepository] DB delete failed, using mock store:', err.message);
      }
    }

    const idx = this.inMemoryVehicles.findIndex((v) => v.id === id);
    if (idx !== -1) {
      this.inMemoryVehicles.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const vehicleRepository = new VehicleRepository();
