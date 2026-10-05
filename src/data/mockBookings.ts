import { Booking } from '../types/index.ts';

/**
 * Car 911 - Initial Mock Bookings Dataset
 * Fictional demonstration customer reservations.
 */
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-911-001',
    serviceId: 'service-field-inspection',
    serviceName: 'Certified Field Inspection',
    vehicleModel: 'Porsche 911 GT3 RS (Weissach)',
    preferredDate: '2026-10-15',
    preferredTime: '10:00 AM PST',
    clientName: 'Julian Vance',
    clientEmail: 'driver@car911.com',
    clientPhone: '+1 (555) 911-3829',
    notes: 'Laser alignment and DME overrev check prior to wire transfer release.',
    status: 'Confirmed',
    createdAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'bk-911-002',
    serviceId: 'service-detailing-ppf',
    serviceName: 'Bespoke Detailing & Track PPF',
    vehicleModel: 'Aston Martin Vantage Coupe V8',
    preferredDate: '2026-10-20',
    preferredTime: '02:00 PM EST',
    clientName: 'Julian Vance',
    clientEmail: 'driver@car911.com',
    clientPhone: '+1 (555) 911-3829',
    notes: 'Full track armor package on front clip, rocker panels, and carbon splitter.',
    status: 'Pending',
    createdAt: '2026-09-30T09:15:00Z',
  },
  {
    id: 'bk-911-003',
    serviceId: 'service-factory-maintenance',
    serviceName: 'Factory Scheduled Maintenance',
    vehicleModel: 'Audi RS e-tron GT',
    preferredDate: '2026-09-10',
    preferredTime: '11:00 AM PST',
    clientName: 'Julian Vance',
    clientEmail: 'driver@car911.com',
    clientPhone: '+1 (555) 911-3829',
    notes: 'Completed 15,000-mile comprehensive electrical telemetry audit.',
    status: 'Completed',
    createdAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'bk-911-004',
    serviceId: 'service-performance-tuning',
    serviceName: 'Performance Tuning & Dyno Analysis',
    vehicleModel: 'Ferrari Roma GT',
    preferredDate: '2026-08-22',
    preferredTime: '03:30 PM PST',
    clientName: 'Julian Vance',
    clientEmail: 'driver@car911.com',
    clientPhone: '+1 (555) 911-3829',
    notes: 'Client rescheduled due to international travel.',
    status: 'Cancelled',
    createdAt: '2026-08-15T16:45:00Z',
  },
];
