export type {
  TelemetrySpec,
  TechnicalMatrix,
  EquipmentItem,
  EquipmentCategory,
  Vehicle,
  Service,
  Dealer,
  Booking,
  UserProfile,
  AuthRole,
} from '../../../src/types/index.ts';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType?: string;
  vehicleOfInterest?: string;
  status?: 'unread' | 'read' | 'archived';
  createdAt: string;
}

