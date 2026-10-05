import { userRepository } from '../repositories/userRepository.ts';
import { UserProfile } from '../models/index.ts';
import { validation } from '../schemas/validation.ts';

export class UserBackendService {
  public async getUserById(id: string): Promise<UserProfile | null> {
    return userRepository.findById(id);
  }

  public async getAllUsers(): Promise<UserProfile[]> {
    return userRepository.findAll();
  }

  public async createUser(payload: {
    fullName: string;
    email: string;
    phone?: string;
    role?: 'user' | 'admin';
    membershipTier?: 'Platinum' | 'Track VIP' | 'Private Collector';
  }): Promise<{ user?: UserProfile; errors?: string[] }> {
    if (!payload.fullName || !payload.email) {
      return { errors: ['Full name and email are required.'] };
    }

    const existing = await userRepository.findByEmail(payload.email);
    if (existing) {
      return { errors: ['User with this email already exists.'] };
    }

    const id = `user-demo-${Date.now().toString().slice(-6)}`;
    const user: UserProfile = {
      id,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || '',
      role: payload.role || 'user',
      membershipTier: payload.membershipTier || 'Platinum',
      savedVehiclesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const created = await userRepository.create(user);
    return { user: created };
  }

  public async deleteUser(id: string): Promise<boolean> {
    return userRepository.delete(id);
  }

  public async updateUserProfile(
    id: string,
    payload: any
  ): Promise<{ user?: UserProfile; errors?: string[]; notFound?: boolean; forbidden?: boolean }> {
    const { result, sanitizedData } = validation.validateUserUpdate(payload);
    if (!result.isValid) {
      const isPrivilegeEscalation = result.errors.some((e) => e.field === 'role');
      return {
        forbidden: isPrivilegeEscalation,
        errors: result.errors.map((e) => `${e.field}: ${e.message}`),
      };
    }

    const updated = await userRepository.update(id, sanitizedData);
    if (!updated) {
      return { notFound: true, errors: ['User profile not found'] };
    }

    return { user: updated };
  }
}

export const userBackendService = new UserBackendService();
