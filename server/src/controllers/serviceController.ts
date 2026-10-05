import { Request, Response, NextFunction } from 'express';
import { serviceCatalogBackendService } from '../services/serviceService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const serviceController = {
  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const services = await serviceCatalogBackendService.getServices({
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined,
      });

      return sendSuccess({
        res,
        data: services,
      });
    } catch (err) {
      next(err);
    }
  },

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await serviceCatalogBackendService.getServiceById(id);

      if (!service) {
        return sendError({
          res,
          statusCode: 404,
          code: 'SERVICE_NOT_FOUND',
          message: `Performance service program '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        data: service,
      });
    } catch (err) {
      next(err);
    }
  },

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, priceEstimate } = req.body;
      if (!name || !category) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Service name and category are required parameters.',
        });
      }

      const service = await serviceCatalogBackendService.createService(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Service program catalogued successfully.',
        data: service,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await serviceCatalogBackendService.updateService(id, req.body);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'SERVICE_NOT_FOUND',
          message: `Performance service program '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Service program specifications updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await serviceCatalogBackendService.deleteService(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'SERVICE_NOT_FOUND',
          message: `Performance service program '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Service program decommissioned.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
