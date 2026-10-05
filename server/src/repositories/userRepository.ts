import { eq } from 'drizzle-orm';
import { UserProfile } from '../models/index.ts';
import { MOCK_USERS } from '../../../src/data/mockUsers.ts';
import { db, schema } from '../db/index.ts';

export class UserRepository {
  private inMemoryUsers: Map<string, UserProfile> = new Map();

  constructor() {
    // Seed in-memory fallback users
    this.inMemoryUsers.set(MOCK_USERS.member.id, { ...MOCK_USERS.member });
    this.inMemoryUsers.set(MOCK_USERS.admin.id, { ...MOCK_USERS.admin });
  }

  public async findById(id: string): Promise<UserProfile | null> {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            fullName: schema.users.fullName,
            role: schema.users.role,
            membershipTier: schema.users.membershipTier,
            phone: schema.users.phone,
            createdAt: schema.users.createdAt,
          })
          .from(schema.users)
          .where(eq(schema.users.id, id))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            email: r.email,
            fullName: r.fullName,
            role: (r.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            membershipTier: (r.membershipTier || 'Platinum') as any,
            phone: r.phone || '',
            savedVehiclesCount: 0,
            createdAt: r.createdAt.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[UserRepository] DB lookup failed, falling back to mock memory:', err.message);
      }
    }

    const fallback = this.inMemoryUsers.get(id);
    return fallback ? { ...fallback } : null;
  }

  public async findByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            fullName: schema.users.fullName,
            role: schema.users.role,
            membershipTier: schema.users.membershipTier,
            phone: schema.users.phone,
            createdAt: schema.users.createdAt,
          })
          .from(schema.users)
          .where(eq(schema.users.email, cleanEmail))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            email: r.email,
            fullName: r.fullName,
            role: (r.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            membershipTier: (r.membershipTier || 'Platinum') as any,
            phone: r.phone || '',
            savedVehiclesCount: 0,
            createdAt: r.createdAt.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[UserRepository] DB findByEmail failed, using mock fallback:', err.message);
      }
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  }

  public async update(
    id: string,
    updates: Partial<Omit<UserProfile, 'id' | 'role' | 'email' | 'createdAt'>>
  ): Promise<UserProfile | null> {
    if (db) {
      try {
        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.membershipTier !== undefined) updateData.membershipTier = updates.membershipTier;

        const updatedRows = await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, id))
          .returning({
            id: schema.users.id,
            email: schema.users.email,
            fullName: schema.users.fullName,
            role: schema.users.role,
            membershipTier: schema.users.membershipTier,
            phone: schema.users.phone,
            createdAt: schema.users.createdAt,
          });

        if (updatedRows.length > 0) {
          const r = updatedRows[0];
          const profile: UserProfile = {
            id: r.id,
            email: r.email,
            fullName: r.fullName,
            role: (r.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            membershipTier: (r.membershipTier || 'Platinum') as any,
            phone: r.phone || '',
            savedVehiclesCount: updates.savedVehiclesCount || 0,
            createdAt: r.createdAt.toISOString(),
          };
          this.inMemoryUsers.set(id, profile);
          return profile;
        }
      } catch (err: any) {
        console.warn('[UserRepository] DB update failed, using mock fallback:', err.message);
      }
    }

    // In-memory fallback
    const existing = this.inMemoryUsers.get(id);
    if (!existing) {
      return null;
    }

    const updated: UserProfile = {
      ...existing,
      fullName: updates.fullName !== undefined ? updates.fullName : existing.fullName,
      phone: updates.phone !== undefined ? updates.phone : existing.phone,
      membershipTier:
        updates.membershipTier !== undefined
          ? updates.membershipTier
          : existing.membershipTier,
      savedVehiclesCount:
        updates.savedVehiclesCount !== undefined
          ? updates.savedVehiclesCount
          : existing.savedVehiclesCount,
      role: existing.role, // role is strictly preserved
    };

    this.inMemoryUsers.set(id, updated);
    return { ...updated };
  }

  public async create(user: UserProfile): Promise<UserProfile> {
    if (db) {
      try {
        await db
          .insert(schema.users)
          .values({
            id: user.id,
            email: user.email.toLowerCase(),
            fullName: user.fullName,
            role: user.role,
            membershipTier: user.membershipTier,
            phone: user.phone,
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              fullName: user.fullName,
              phone: user.phone,
              membershipTier: user.membershipTier,
              updatedAt: new Date(),
            },
          });
      } catch (err: any) {
        console.warn('[UserRepository] DB insert failed, using mock fallback:', err.message);
      }
    }

    this.inMemoryUsers.set(user.id, { ...user });
    return { ...user };
  }

  public async findAll(): Promise<UserProfile[]> {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            fullName: schema.users.fullName,
            role: schema.users.role,
            membershipTier: schema.users.membershipTier,
            phone: schema.users.phone,
            createdAt: schema.users.createdAt,
          })
          .from(schema.users);

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            email: r.email,
            fullName: r.fullName,
            role: (r.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            membershipTier: (r.membershipTier || 'Platinum') as any,
            phone: r.phone || '',
            savedVehiclesCount: 0,
            createdAt: r.createdAt.toISOString(),
          }));
        }
      } catch (err: any) {
        console.warn('[UserRepository] DB findAll failed, using mock store:', err.message);
      }
    }

    return Array.from(this.inMemoryUsers.values()).map((u) => ({ ...u }));
  }

  public async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.users).where(eq(schema.users.id, id));
      } catch (err: any) {
        console.warn('[UserRepository] DB delete failed, using mock store:', err.message);
      }
    }

    return this.inMemoryUsers.delete(id);
  }
}

export const userRepository = new UserRepository();
