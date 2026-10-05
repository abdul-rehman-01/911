import { Request, Response, NextFunction } from 'express';
import { contactBackendService } from '../services/contactService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const contactController = {
  async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { submission, errors } = await contactBackendService.submitContactMessage(req.body);

      if (errors && errors.length > 0) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Contact transmission parameters are invalid.',
          details: errors,
        });
      }

      return sendSuccess({
        res,
        statusCode: 201,
        data: submission,
        message: 'Your concierge inquiry has been securely registered in the Car 911 telemetry system.',
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllSubmissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const submissions = await contactBackendService.getAllSubmissions();
      return sendSuccess({
        res,
        data: submissions,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateContactStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !['unread', 'read', 'archived'].includes(status)) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Status must be one of: unread, read, archived.',
        });
      }

      const updated = await contactBackendService.updateContactStatus(id, status);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'MESSAGE_NOT_FOUND',
          message: `Inquiry message with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Inquiry status updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await contactBackendService.deleteContact(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'MESSAGE_NOT_FOUND',
          message: `Inquiry message with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Inquiry eliminated from transmissions log.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
