import { eq, and, desc } from 'drizzle-orm';
import { Booking, BookingStatus } from '../models/index.ts';
import { MOCK_BOOKINGS } from '../../../src/data/mockBookings.ts';
import { db, schema } from '../db/index.ts';

export interface BookingQueryParams {
  userEmail?: string;
  serviceId?: string;
  status?: string;
}

export class BookingRepository {
  private inMemoryBookings: Booking[] = [...MOCK_BOOKINGS];

  public async findAll(params: BookingQueryParams = {}): Promise<Booking[]> {
    if (db) {
      try {
        let query = db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt));
        const conditions = [];

        if (params.userEmail) {
          conditions.push(eq(schema.bookings.clientEmail, params.userEmail.trim().toLowerCase()));
        }
        if (params.serviceId) {
          conditions.push(eq(schema.bookings.serviceId, params.serviceId.trim()));
        }
        if (params.status) {
          conditions.push(eq(schema.bookings.status, params.status.trim()));
        }

        const rows = conditions.length > 0
          ? await db.select().from(schema.bookings).where(and(...conditions)).orderBy(desc(schema.bookings.createdAt))
          : await query;

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            serviceId: r.serviceId,
            serviceName: r.serviceName,
            vehicleModel: r.vehicleModel || undefined,
            preferredDate: r.preferredDate,
            preferredTime: r.preferredTime,
            clientName: r.clientName,
            clientEmail: r.clientEmail,
            clientPhone: r.clientPhone,
            notes: r.notes || undefined,
            status: r.status as BookingStatus,
            createdAt: r.createdAt.toISOString(),
          }));
        }
      } catch (err: any) {
        console.warn('[BookingRepository] DB query failed, using in-memory bookings:', err.message);
      }
    }

    let result = [...this.inMemoryBookings];

    if (params.userEmail) {
      const email = params.userEmail.trim().toLowerCase();
      result = result.filter((b) => b.clientEmail.toLowerCase() === email);
    }

    if (params.serviceId) {
      const sId = params.serviceId.trim();
      result = result.filter((b) => b.serviceId === sId);
    }

    if (params.status) {
      const statusLower = params.status.trim().toLowerCase();
      result = result.filter((b) => b.status.toLowerCase() === statusLower);
    }

    return result;
  }

  public async findById(id: string): Promise<Booking | null> {
    const cleanId = id.trim().toLowerCase();

    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.bookings)
          .where(eq(schema.bookings.id, cleanId))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            serviceId: r.serviceId,
            serviceName: r.serviceName,
            vehicleModel: r.vehicleModel || undefined,
            preferredDate: r.preferredDate,
            preferredTime: r.preferredTime,
            clientName: r.clientName,
            clientEmail: r.clientEmail,
            clientPhone: r.clientPhone,
            notes: r.notes || undefined,
            status: r.status as BookingStatus,
            createdAt: r.createdAt.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[BookingRepository] DB findById failed, checking in-memory bookings:', err.message);
      }
    }

    const found = this.inMemoryBookings.find((b) => b.id.toLowerCase() === cleanId);
    return found ? { ...found } : null;
  }

  public async create(data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    const newBooking: Booking = {
      id: `bk-911-${Date.now().toString().slice(-6)}`,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      vehicleModel: data.vehicleModel,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      clientName: data.clientName,
      clientEmail: data.clientEmail.toLowerCase(),
      clientPhone: data.clientPhone,
      notes: data.notes,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
    };

    // 1. In-memory storage
    this.inMemoryBookings.unshift(newBooking);

    // 2. PostgreSQL persistence with transactions
    if (db) {
      try {
        // Ensure service exists in DB to prevent foreign key violation
        await db
          .insert(schema.services)
          .values({
            id: newBooking.serviceId,
            slug: newBooking.serviceId,
            title: newBooking.serviceName,
            category: 'Engineering',
            shortDescription: newBooking.serviceName,
            startingPriceUsd: 500,
          })
          .onConflictDoNothing();

        await db.insert(schema.bookings).values({
          id: newBooking.id,
          serviceId: newBooking.serviceId,
          serviceName: newBooking.serviceName,
          vehicleModel: newBooking.vehicleModel,
          preferredDate: newBooking.preferredDate,
          preferredTime: newBooking.preferredTime,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          notes: newBooking.notes,
          status: newBooking.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err: any) {
        console.warn('[BookingRepository] DB insert failed, preserved in memory:', err.message);
      }
    }

    return { ...newBooking };
  }

  public async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const cleanId = id.trim().toLowerCase();

    // 1. In-memory update
    const index = this.inMemoryBookings.findIndex((b) => b.id.toLowerCase() === cleanId);
    let updatedMem: Booking | null = null;
    if (index !== -1) {
      this.inMemoryBookings[index] = {
        ...this.inMemoryBookings[index],
        status,
      };
      updatedMem = { ...this.inMemoryBookings[index] };
    }

    // 2. Database update
    if (db) {
      try {
        const rows = await db
          .update(schema.bookings)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(schema.bookings.id, cleanId))
          .returning();

        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            serviceId: r.serviceId,
            serviceName: r.serviceName,
            vehicleModel: r.vehicleModel || undefined,
            preferredDate: r.preferredDate,
            preferredTime: r.preferredTime,
            clientName: r.clientName,
            clientEmail: r.clientEmail,
            clientPhone: r.clientPhone,
            notes: r.notes || undefined,
            status: r.status as BookingStatus,
            createdAt: r.createdAt.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('[BookingRepository] DB updateStatus failed, returned in-memory status:', err.message);
      }
    }

    return updatedMem;
  }

  public async delete(id: string): Promise<boolean> {
    const cleanId = id.trim().toLowerCase();

    // 1. In-memory delete
    const index = this.inMemoryBookings.findIndex((b) => b.id.toLowerCase() === cleanId);
    const existedInMem = index !== -1;
    if (existedInMem) {
      this.inMemoryBookings.splice(index, 1);
    }

    // 2. Database delete
    if (db) {
      try {
        const deletedRows = await db
          .delete(schema.bookings)
          .where(eq(schema.bookings.id, cleanId))
          .returning();

        if (deletedRows.length > 0) {
          return true;
        }
      } catch (err: any) {
        console.warn('[BookingRepository] DB delete failed, removed from memory:', err.message);
      }
    }

    return existedInMem;
  }
}

export const bookingRepository = new BookingRepository();
