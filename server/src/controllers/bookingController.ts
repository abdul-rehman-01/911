import { Request, Response, NextFunction } from 'express';
import { bookingBackendService } from '../services/bookingService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const bookingController = {
  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userEmail, serviceId, status } = req.query;

      const bookings = await bookingBackendService.getBookings({
        userEmail: typeof userEmail === 'string' ? userEmail : undefined,
        serviceId: typeof serviceId === 'string' ? serviceId : undefined,
        status: typeof status === 'string' ? status : undefined,
      });

      return sendSuccess({
        res,
        data: bookings,
      });
    } catch (err) {
      next(err);
    }
  },

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await bookingBackendService.getBookingById(id);

      if (!booking) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BOOKING_NOT_FOUND',
          message: `Booking reservation '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  },

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { booking, errors } = await bookingBackendService.createBooking(req.body);

      if (errors && errors.length > 0) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Invalid booking parameters.',
          details: errors,
        });
      }

      return sendSuccess({
        res,
        statusCode: 201,
        data: booking,
        message: 'Concierge performance service booking logged successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return sendError({
          res,
          statusCode: 400,
          code: 'MISSING_STATUS',
          message: 'Status parameter is required in request body.',
        });
      }

      const { booking, errors, notFound, conflict } = await bookingBackendService.updateBookingStatus(id, status);

      if (notFound) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BOOKING_NOT_FOUND',
          message: `Booking reservation '${id}' was not found.`,
        });
      }

      if (conflict) {
        return sendError({
          res,
          statusCode: 409,
          code: 'BOOKING_STATUS_CONFLICT',
          message: errors?.[0] || 'Booking state conflict.',
          details: errors,
        });
      }

      if (errors && errors.length > 0) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: errors[0],
          details: errors,
        });
      }

      return sendSuccess({
        res,
        data: booking,
        message: `Booking status updated to ${booking?.status}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await bookingBackendService.deleteBooking(id);

      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BOOKING_NOT_FOUND',
          message: `Booking reservation '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: `Booking reservation '${id}' has been removed.`,
      });
    } catch (err) {
      next(err);
    }
  },
};
