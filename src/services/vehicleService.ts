import { Vehicle, VehicleFilterState } from '../types';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { apiClient } from './apiClient';

/**
 * Car 911 Vehicle Repository & Telemetry Query Service
 * Encapsulates all query, filtering, sorting, and lookup operations.
 * Designed to seamlessly transition to REST/GraphQL/PostgreSQL endpoints in production.
 */

export const vehicleService = {
  /**
   * Retrieves all catalog vehicles
   */
  getAll(): Vehicle[] {
    return [...MOCK_VEHICLES];
  },

  /**
   * Retrieves a vehicle by unique ID with safe fallback
   */
  getById(id: string): Vehicle | undefined {
    return MOCK_VEHICLES.find((v) => v.id === id);
  },

  /**
   * Retrieves a vehicle by URL slug
   */
  getBySlug(slug: string): Vehicle | undefined {
    return MOCK_VEHICLES.find((v) => v.slug === slug);
  },

  /**
   * Retrieves vehicles by make / manufacturer
   */
  getByBrand(make: string): Vehicle[] {
    const query = make.toLowerCase();
    return MOCK_VEHICLES.filter((v) => v.make.toLowerCase().includes(query));
  },

  /**
   * Retrieves vehicles by automotive body class
   */
  getByCategory(bodyClass: string): Vehicle[] {
    return MOCK_VEHICLES.filter((v) => v.bodyClass.toLowerCase() === bodyClass.toLowerCase());
  },

  /**
   * Finds similar vehicles in class, excluding the target vehicle
   */
  getSimilar(vehicleId: string, limit: number = 3): Vehicle[] {
    const target = this.getById(vehicleId);
    if (!target) return MOCK_VEHICLES.slice(0, limit);

    return MOCK_VEHICLES.filter((v) => v.id !== vehicleId)
      .sort((a, b) => {
        // Score similarity based on bodyClass, make, and price proximity
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
  },

  /**
   * Multi-dimensional filtering logic strictly combining all active parameters
   */
  filterVehicles(vehicles: Vehicle[], filters: VehicleFilterState): Vehicle[] {
    return vehicles.filter((v) => {
      // 1. Text Search (make, model, trim, chassis code, VIN)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesQuery =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.trim.toLowerCase().includes(query) ||
          v.chassisCode.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query) ||
          v.bodyClass.toLowerCase().includes(query) ||
          v.exteriorColor.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Makes filter
      if (filters.makes.length > 0) {
        const matchesMake = filters.makes.some((make) =>
          v.make.toLowerCase().includes(make.toLowerCase())
        );
        if (!matchesMake) return false;
      }

      // 3. Body Classes filter
      if (filters.bodyClasses.length > 0) {
        if (!filters.bodyClasses.includes(v.bodyClass)) return false;
      }

      // 4. Valuation Spectrum / Price Range
      const [minPrice, maxPrice] = filters.priceRange;
      if (v.priceUsd < minPrice || v.priceUsd > maxPrice) return false;

      // 5. Year Range
      const [minYear, maxYear] = filters.yearRange;
      if (v.year < minYear || v.year > maxYear) return false;

      // 6. Transmissions
      if (filters.transmissions.length > 0) {
        const matchesTransmission = filters.transmissions.some((t) =>
          v.telemetry.transmission.toLowerCase().includes(t.toLowerCase())
        );
        if (!matchesTransmission) return false;
      }

      // 7. Drivetrain
      if (filters.drivetrains.length > 0) {
        if (!filters.drivetrains.includes(v.telemetry.drivetrain)) return false;
      }

      // 8. Powertrains
      if (filters.powertrains.length > 0) {
        if (!filters.powertrains.includes(v.telemetry.fuelType)) return false;
      }

      // 9. Mileage Ceiling
      if (filters.maxMileage !== null && v.telemetry.mileageMiles > filters.maxMileage) {
        return false;
      }

      // 10. Certified Only
      if (filters.onlyCertified && !v.isCertified) {
        return false;
      }

      return true;
    });
  },

  /**
   * Sorts vehicles according to designated telemetry or financial criteria
   */
  sortVehicles(vehicles: Vehicle[], sortBy: VehicleFilterState['sortBy']): Vehicle[] {
    const list = [...vehicles];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.priceUsd - b.priceUsd);
      case 'price-desc':
        return list.sort((a, b) => b.priceUsd - a.priceUsd);
      case 'horsepower':
        return list.sort((a, b) => b.telemetry.outputHp - a.telemetry.outputHp);
      case 'mileage':
        return list.sort((a, b) => a.telemetry.mileageMiles - b.telemetry.mileageMiles);
      case 'year':
        return list.sort((a, b) => b.year - a.year);
      case 'recommended':
      default:
        // Prioritize certified units and highest performance output
        return list.sort((a, b) => {
          if (a.isCertified && !b.isCertified) return -1;
          if (!a.isCertified && b.isCertified) return 1;
          return b.telemetry.outputHp - a.telemetry.outputHp;
        });
    }
  },

  /**
   * Async backend fetch with fallback to in-memory catalog
   */
  async fetchVehicles(params?: Record<string, any>): Promise<Vehicle[]> {
    try {
      const res = await apiClient.get<Vehicle[]>('/vehicles', params);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Fallback cleanly
    }
    return this.getAll();
  },

  /**
   * Async backend fetch single vehicle with fallback
   */
  async fetchVehicleById(id: string): Promise<Vehicle | undefined> {
    try {
      const res = await apiClient.get<Vehicle>(`/vehicles/${id}`);
      if (res.data) {
        return res.data;
      }
    } catch {
      // Fallback cleanly
    }
    return this.getById(id);
  },
};
