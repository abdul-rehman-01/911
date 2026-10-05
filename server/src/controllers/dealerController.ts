import { Request, Response, NextFunction } from 'express';
import { dealerBackendService } from '../services/dealerService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const dealerController = {
  async getDealers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, city, country, brand, isFlagship } = req.query;

      const dealers = await dealerBackendService.getDealers({
        search: typeof search === 'string' ? search : undefined,
        city: typeof city === 'string' ? city : undefined,
        country: typeof country === 'string' ? country : undefined,
        brand: typeof brand === 'string' ? brand : undefined,
        isFlagship: isFlagship !== undefined ? isFlagship === 'true' || isFlagship === '1' : undefined,
      });

      return sendSuccess({
        res,
        data: dealers,
      });
    } catch (err) {
      next(err);
    }
  },

  async getDealerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dealer = await dealerBackendService.getDealerById(id);

      if (!dealer) {
        return sendError({
          res,
          statusCode: 404,
          code: 'DEALER_NOT_FOUND',
          message: `Dealer or partner atelier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        data: dealer,
      });
    } catch (err) {
      next(err);
    }
  },

  async createDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, city, country, phone, email } = req.body;
      if (!name || !city || !country || !phone || !email) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Name, city, country, phone, and email are required parameters.',
        });
      }

      const dealer = await dealerBackendService.createDealer(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Dealer atelier facility registered in network.',
        data: dealer,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await dealerBackendService.updateDealer(id, req.body);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'DEALER_NOT_FOUND',
          message: `Dealer or partner atelier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Dealer atelier telemetry updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await dealerBackendService.deleteDealer(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'DEALER_NOT_FOUND',
          message: `Dealer or partner atelier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Dealer atelier decommissioned from network.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
