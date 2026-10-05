import { Request, Response, NextFunction } from 'express';
import { brandRepository } from '../repositories/brandRepository.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const brandController = {
  async getBrands(_req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await brandRepository.findAll();
      return sendSuccess({
        res,
        data: brands,
      });
    } catch (err) {
      next(err);
    }
  },

  async getBrandById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await brandRepository.findById(id);
      if (!brand) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BRAND_NOT_FOUND',
          message: `Brand with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        data: brand,
      });
    } catch (err) {
      next(err);
    }
  },

  async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, country, logoUrl } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Brand name is required.',
        });
      }

      const brand = await brandRepository.create({ name, country, logoUrl });
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Brand registered in telemetry registry.',
        data: brand,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await brandRepository.update(id, req.body);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BRAND_NOT_FOUND',
          message: `Brand with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        message: 'Brand telemetry updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await brandRepository.delete(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'BRAND_NOT_FOUND',
          message: `Brand with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        message: 'Brand eliminated from registry.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
