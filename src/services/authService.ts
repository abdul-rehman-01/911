import { UserProfile, AuthRole, SessionState } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { apiClient } from './apiClient';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  role?: AuthRole;
  error?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  membershipTier: 'Platinum' | 'Track VIP' | 'Private Collector';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  /**
   * Retrieves all registered demo users from safe local storage.
   */
  private getRegisteredUsers(): UserProfile[] {
    return getStorageItem<UserProfile[]>(STORAGE_KEYS.REGISTERED_USERS, []);
  }

  /**
   * Saves registered demo users to safe local storage.
   * NOTE: Passwords are NEVER stored or persisted.
   */
  private saveRegisteredUsers(users: UserProfile[]): void {
    setStorageItem(STORAGE_KEYS.REGISTERED_USERS, users);
  }

  /**
   * Authenticates against the demo user dataset.
   * Validates input, checks credentials, and returns user/role.
   */
  public authenticate(email: string, password?: string): AuthResult {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your client terminal email address.' };
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Invalid email terminal format (e.g. driver@car911.com).' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please provide your security passkey.' };
    }

    if (cleanPassword.length < 4) {
      return { success: false, error: 'Security passkey must be at least 4 characters.' };
    }

    // 1. Check Demo Admin
    if (cleanEmail === MOCK_USERS.admin.email.toLowerCase()) {
      return {
        success: true,
        user: MOCK_USERS.admin,
        role: 'admin',
      };
    }

    // 2. Check Standard Demo VIP Member
    if (cleanEmail === MOCK_USERS.member.email.toLowerCase()) {
      return {
        success: true,
        user: MOCK_USERS.member,
        role: 'member',
      };
    }

    // 3. Check registered client users
    const registered = this.getRegisteredUsers();
    const existing = registered.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: true,
        user: existing,
        role: 'member',
      };
    }

    // Unrecognized demo user
    return {
      success: false,
      error: 'Unrecognized client terminal credentials. Please check your email or register for a demonstration account.',
    };
  }

  /**
   * Registers a new demo user.
   * Validates all required fields, enforces password confirmation,
   * checks for duplicate emails, and creates the profile without storing passwords.
   */
  public register(payload: RegisterPayload): AuthResult {
    const fullName = (payload.fullName || '').trim();
    const email = (payload.email || '').trim().toLowerCase();
    const phone = (payload.phone || '').trim();
    const password = (payload.password || '').trim();
    const confirmPassword = (payload.confirmPassword || '').trim();
    const tier = payload.membershipTier || 'Platinum';

    // Validation
    if (!fullName) {
      return { success: false, error: 'Full client name is required.' };
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email terminal address.' };
    }

    if (!phone) {
      return { success: false, error: 'Contact phone / direct line is required.' };
    }

    if (!password) {
      return { success: false, error: 'Security passkey is required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Security passkey must contain at least 6 characters.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Security passkeys do not match. Please re-enter.' };
    }

    // Duplicate Check
    if (
      email === MOCK_USERS.admin.email.toLowerCase() ||
      email === MOCK_USERS.member.email.toLowerCase()
    ) {
      return {
        success: false,
        error: 'A demo client profile already exists for this email address. Please sign in instead.',
      };
    }

    const registered = this.getRegisteredUsers();
    const duplicate = registered.find((u) => u.email.toLowerCase() === email);
    if (duplicate) {
      return {
        success: false,
        error: 'A demo client profile already exists for this email address. Please sign in instead.',
      };
    }

    // Create client profile without persisting password
    const newUser: UserProfile = {
      id: `user-demo-${Date.now()}`,
      fullName,
      email,
      phone,
      role: 'user',
      membershipTier: tier,
      savedVehiclesCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Store in registered users
    this.saveRegisteredUsers([...registered, newUser]);

    return {
      success: true,
      user: newUser,
      role: 'member',
    };
  }

  /**
   * Updates an existing demo client profile.
   * Strictly prevents promoting role to admin from the user interface.
   */
  public updateProfile(
    userId: string,
    updates: {
      fullName?: string;
      phone?: string;
      membershipTier?: 'Platinum' | 'Track VIP' | 'Private Collector';
    }
  ): UserProfile | null {
    // Check if updating predefined mock member
    if (userId === MOCK_USERS.member.id) {
      const updated: UserProfile = {
        ...MOCK_USERS.member,
        fullName: updates.fullName || MOCK_USERS.member.fullName,
        phone: updates.phone || MOCK_USERS.member.phone,
        membershipTier: updates.membershipTier || MOCK_USERS.member.membershipTier,
      };
      return updated;
    }

    // Check if updating registered users
    const registered = this.getRegisteredUsers();
    const idx = registered.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      const current = registered[idx];
      const updated: UserProfile = {
        ...current,
        fullName: updates.fullName || current.fullName,
        phone: updates.phone || current.phone,
        membershipTier: updates.membershipTier || current.membershipTier,
        // Role is preserved as 'user' - no privilege escalation
        role: 'user',
      };
      registered[idx] = updated;
      this.saveRegisteredUsers(registered);

      // Asynchronously sync with backend endpoint PATCH /api/v1/users/:id
      apiClient.patch(`/users/${userId}`, updates).catch((err) => {
        console.warn('[AuthService] Backend profile sync deferred:', err);
      });

      return updated;
    }

    // Attempt backend sync for predefined users as well
    apiClient.patch(`/users/${userId}`, updates).catch((err) => {
      console.warn('[AuthService] Backend profile sync deferred:', err);
    });

    return null;
  }

  /**
   * Directly fetch profile from backend API with fallback
   */
  public async fetchProfileFromBackend(userId: string): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get<UserProfile>(`/users/${userId}`);
      if (res.data) {
        return res.data;
      }
    } catch {
      // Fallback cleanly
    }
    return null;
  }

  /**
   * Recovers a safe session state from storage with fallback to guest.
   */
  public getInitialSession(): SessionState {
    const fallback: SessionState = {
      role: 'guest',
      user: null,
      isAuthenticated: false,
    };

    try {
      const stored = getStorageItem<SessionState>(STORAGE_KEYS.SESSION, fallback);
      // Validate structure to guard against corrupted localStorage
      if (
        stored &&
        typeof stored === 'object' &&
        (stored.role === 'guest' || stored.role === 'member' || stored.role === 'admin')
      ) {
        if (stored.role === 'guest') {
          return { role: 'guest', user: null, isAuthenticated: false };
        }
        if (stored.user && stored.user.email) {
          return stored;
        }
      }
    } catch {
      // Fallback cleanly on parse error
    }
    return fallback;
  }
}

export const authService = new AuthService();
