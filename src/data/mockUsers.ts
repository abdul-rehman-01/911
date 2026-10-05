import { UserProfile } from '../types/index.ts';

/**
 * Car 911 - Mock User Profiles (Demonstration Identities)
 * Fictional personas for testing authenticated user and administrative flows.
 */
export const MOCK_USERS = {
  guest: null,
  member: {
    id: 'user-demo-member',
    fullName: 'Julian Vance',
    email: 'driver@car911.com',
    phone: '+1 (555) 911-3829',
    role: 'user',
    membershipTier: 'Platinum',
    savedVehiclesCount: 3,
    createdAt: '2025-01-15T10:00:00Z',
  } as UserProfile,
  admin: {
    id: 'user-demo-admin',
    fullName: 'Marcus Sterling (Platform Director)',
    email: 'admin@car911.com',
    phone: '+1 (555) 911-0001',
    role: 'admin',
    membershipTier: 'Private Collector',
    savedVehiclesCount: 12,
    createdAt: '2024-06-01T08:00:00Z',
  } as UserProfile,
};
