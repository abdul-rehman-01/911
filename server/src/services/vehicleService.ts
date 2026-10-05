import { vehicleRepository, VehicleQueryParams, PaginatedResult } from '../repositories/vehicleRepository.ts';
import { Vehicle } from '../models/index.ts';

export class VehicleBackendService {
  public async getVehicles(params: VehicleQueryParams): Promise<PaginatedResult<Vehicle>> {
    return vehicleRepository.findAll(params);
  }

  public async getVehicleById(id: string): Promise<Vehicle | null> {
    return vehicleRepository.findById(id);
  }

  public async getSimilarVehicles(id: string, limit: number = 3): Promise<Vehicle[]> {
    return vehicleRepository.findSimilar(id, limit);
  }

  public async createVehicle(payload: Partial<Vehicle>): Promise<Vehicle> {
    const id = payload.id || `v-${(payload.make || 'custom').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${(payload.model || 'model').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const slug = payload.slug || id;

    const fullVehicle: Vehicle = {
      id,
      slug,
      make: payload.make || 'Porsche',
      model: payload.model || '911 Carrera',
      year: payload.year || 2024,
      trim: payload.trim || 'Base',
      chassisCode: payload.chassisCode || '992.2',
      vin: payload.vin || `WP0AA2A91RS${Date.now().toString().slice(-6)}`,
      priceUsd: payload.priceUsd || 150000,
      estMonthlyUsd: payload.estMonthlyUsd || Math.round((payload.priceUsd || 150000) / 60),
      exteriorColor: payload.exteriorColor || 'Guards Red',
      interiorColor: payload.interiorColor || 'Black Leather',
      bodyClass: (payload.bodyClass as any) || 'Coupe',
      isCertified: payload.isCertified ?? true,
      tags: payload.tags || ['Performance', 'Certified'],
      primaryImage: payload.primaryImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      galleryImages: payload.galleryImages || [
        {
          url: payload.primaryImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
          caption: 'Chassis Exterior',
          alt: `${payload.make} ${payload.model}`,
        },
      ],
      telemetry: {
        outputHp: payload.telemetry?.outputHp || 450,
        peakRpm: payload.telemetry?.peakRpm || 7500,
        acceleration0to100: payload.telemetry?.acceleration0to100 || 3.4,
        topSpeedKmh: payload.telemetry?.topSpeedKmh || 308,
        topSpeedMph: payload.telemetry?.topSpeedMph || 191,
        torqueNm: payload.telemetry?.torqueNm || 530,
        torqueLbFt: payload.telemetry?.torqueLbFt || 390,
        torqueRpm: payload.telemetry?.torqueRpm || 2300,
        transmission: payload.telemetry?.transmission || '8-Speed Dual-Clutch (PDK)',
        drivetrain: (payload.telemetry?.drivetrain as any) || 'RWD',
        mileageMiles: payload.telemetry?.mileageMiles || 1200,
        fuelType: (payload.telemetry?.fuelType as any) || 'Petrol Twin-Turbo',
        engineDisplacement: payload.telemetry?.engineDisplacement || '3.0L Boxer-6 Twin-Turbo',
      },
      technicalMatrix: payload.technicalMatrix || {
        displacementCc: 2981,
        compressionRatio: '10.2:1',
        cylinderConfiguration: 'Flat-6 Twin-Turbo',
        driveArchitecture: 'Rear-Engine, Rear-Wheel Drive',
        curbWeightKg: 1510,
        curbWeightLbs: 3329,
        fuelTankCapacityLiters: 64,
        frontBrakeDisc: '6-piston monobloc aluminium',
        rearBrakeDisc: '4-piston monobloc aluminium',
        dragCoefficient: '0.29 Cd',
      },
      equipment: payload.equipment || [],
      dealerId: payload.dealerId || 'dealer-beverly-hills',
      inStock: payload.inStock ?? true,
      deliveryStatus: payload.deliveryStatus || 'Available for Immediate Atelier Delivery',
      locationOrigin: payload.locationOrigin || 'Stuttgart, Germany',
      warranty: payload.warranty || '4-Year / 50,000 Mile Comprehensive Factory Warranty',
      factoryBuildDate: payload.factoryBuildDate || '2024-03',
      ecuHealthScore: payload.ecuHealthScore || 99,
    };

    return vehicleRepository.create(fullVehicle);
  }

  public async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    return vehicleRepository.update(id, updates);
  }

  public async deleteVehicle(id: string): Promise<boolean> {
    return vehicleRepository.delete(id);
  }
}

export const vehicleBackendService = new VehicleBackendService();
