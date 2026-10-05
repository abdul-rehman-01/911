import { dealerRepository, DealerQueryParams } from '../repositories/dealerRepository.ts';
import { Dealer } from '../models/index.ts';

export class DealerBackendService {
  public async getDealers(params: DealerQueryParams): Promise<Dealer[]> {
    return dealerRepository.findAll(params);
  }

  public async getDealerById(id: string): Promise<Dealer | null> {
    return dealerRepository.findById(id);
  }

  public async createDealer(payload: Partial<Dealer>): Promise<Dealer> {
    const id = payload.id || `dealer-${(payload.name || 'atelier').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const fullDealer: Dealer = {
      id,
      name: payload.name || 'Car 911 Performance Atelier',
      slug: payload.slug || id,
      city: payload.city || 'Los Angeles',
      state: payload.state || 'CA',
      country: payload.country || 'United States',
      address: payload.address || '9021 Wilshire Blvd',
      postalCode: payload.postalCode || '90210',
      phone: payload.phone || '+1 (310) 555-0199',
      email: payload.email || 'concierge@car911.com',
      hours: payload.hours || 'Mon-Sat: 9:00 AM - 7:00 PM PST',
      coordinates: payload.coordinates || { lat: 34.0668, lng: -118.3986 },
      mapStaticImage: payload.mapStaticImage || '',
      allocatedInventoryCount: payload.allocatedInventoryCount || 5,
      isFlagship: payload.isFlagship ?? false,
    };
    return dealerRepository.create(fullDealer);
  }

  public async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer | null> {
    return dealerRepository.update(id, updates);
  }

  public async deleteDealer(id: string): Promise<boolean> {
    return dealerRepository.delete(id);
  }
}

export const dealerBackendService = new DealerBackendService();
