import { bookingRepository, BookingQueryParams } from '../repositories/bookingRepository.ts';
import { Booking, BookingStatus } from '../models/index.ts';
import { validation } from '../schemas/validation.ts';

export class BookingBackendService {
  public async getBookings(params: BookingQueryParams): Promise<Booking[]> {
    return bookingRepository.findAll(params);
  }

  public async getBookingById(id: string): Promise<Booking | null> {
    return bookingRepository.findById(id);
  }

  public async createBooking(
    payload: any
  ): Promise<{ booking?: Booking; errors?: string[] }> {
    const valResult = validation.validateBookingCreation(payload);
    if (!valResult.isValid) {
      return {
        errors: valResult.errors.map((e) => `${e.field}: ${e.message}`),
      };
    }

    const booking = await bookingRepository.create({
      serviceId: payload.serviceId.trim(),
      serviceName: payload.serviceName.trim(),
      vehicleModel: payload.vehicleModel ? payload.vehicleModel.trim() : undefined,
      preferredDate: payload.preferredDate.trim(),
      preferredTime: payload.preferredTime.trim(),
      clientName: payload.clientName.trim(),
      clientEmail: payload.clientEmail.trim().toLowerCase(),
      clientPhone: payload.clientPhone.trim(),
      notes: payload.notes ? payload.notes.trim() : undefined,
      status: 'Pending',
    });

    return { booking };
  }

  public async updateBookingStatus(
    id: string,
    status: unknown
  ): Promise<{ booking?: Booking; errors?: string[]; notFound?: boolean; conflict?: boolean }> {
    const existing = await bookingRepository.findById(id);
    if (!existing) {
      return { notFound: true, errors: [`Booking reservation '${id}' was not found.`] };
    }

    const valResult = validation.validateBookingStatusUpdate(status);
    if (!valResult.isValid) {
      return {
        errors: valResult.errors.map((e) => `${e.field}: ${e.message}`),
      };
    }

    const normalizedStatus = (
      (status as string).charAt(0).toUpperCase() + (status as string).slice(1).toLowerCase()
    ) as BookingStatus;

    // Conflict detection: Cannot modify an already Cancelled or Completed booking
    if ((existing.status === 'Cancelled' || existing.status === 'Completed') && normalizedStatus !== existing.status) {
      return {
        conflict: true,
        errors: [`Cannot transition booking from '${existing.status}' to '${normalizedStatus}'. Completed or cancelled reservations are immutable.`],
      };
    }

    const updated = await bookingRepository.updateStatus(id, normalizedStatus);
    if (!updated) {
      return { notFound: true, errors: ['Booking not found'] };
    }

    return { booking: updated };
  }

  public async deleteBooking(id: string): Promise<boolean> {
    return bookingRepository.delete(id);
  }
}

export const bookingBackendService = new BookingBackendService();
