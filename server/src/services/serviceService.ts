import { serviceRepository, ServiceQueryParams } from '../repositories/serviceRepository.ts';
import { Service } from '../models/index.ts';

export class ServiceCatalogBackendService {
  public async getServices(params: ServiceQueryParams): Promise<Service[]> {
    return serviceRepository.findAll(params);
  }

  public async getServiceById(id: string): Promise<Service | null> {
    return serviceRepository.findById(id);
  }

  public async createService(payload: Partial<Service>): Promise<Service> {
    const id = payload.id || `service-${(payload.name || 'custom').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const fullService: Service = {
      id,
      slug: payload.slug || id,
      name: payload.name || 'Concierge Performance Service',
      category: payload.category || 'Engineering',
      shortDescription: payload.shortDescription || 'Precision technical inspection and track calibration.',
      fullDescription: payload.fullDescription || 'Complete diagnostic interrogation, fluid analysis, dyno benchmarking, and precision suspension alignment.',
      icon: payload.icon || 'engineering',
      priceEstimate: payload.priceEstimate || '$1,200',
      turnaroundTime: payload.turnaroundTime || '24-48 Hours',
      features: payload.features || ['Telemetry diagnostics', 'ECU audit', 'Certified dyno printout'],
    };
    return serviceRepository.create(fullService);
  }

  public async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    return serviceRepository.update(id, updates);
  }

  public async deleteService(id: string): Promise<boolean> {
    return serviceRepository.delete(id);
  }
}

export const serviceCatalogBackendService = new ServiceCatalogBackendService();
