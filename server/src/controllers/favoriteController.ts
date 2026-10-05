import { Request, Response, NextFunction } from 'express';
import { favoriteBackendService } from '../services/favoriteService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const favoriteController = {
  async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { ids, vehicles } = await favoriteBackendService.getUserFavorites(userId);

      return sendSuccess({
        res,
        data: {
          favoriteIds: ids,
          vehicles,
          count: ids.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { vehicleId } = req.body;

      if (!vehicleId) {
        return sendError({
          res,
          statusCode: 400,
          code: 'MISSING_VEHICLE_ID',
          message: 'Parameter vehicleId is required in the request body.',
        });
      }

      const result = await favoriteBackendService.addFavorite(userId, vehicleId);

      if (!result.success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'VEHICLE_NOT_FOUND',
          message: result.error || 'Failed to add vehicle to user favorites.',
        });
      }

      return sendSuccess({
        res,
        data: {
          favoriteIds: result.favoriteIds,
          count: result.favoriteIds.length,
        },
        message: 'Vehicle added to client favorites.',
      });
    } catch (err) {
      next(err);
    }
  },

  async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, vehicleId } = req.params;

      const result = await favoriteBackendService.removeFavorite(userId, vehicleId);

      return sendSuccess({
        res,
        data: {
          favoriteIds: result.favoriteIds,
          count: result.favoriteIds.length,
        },
        message: 'Vehicle removed from client favorites.',
      });
    } catch (err) {
      next(err);
    }
  },
};
