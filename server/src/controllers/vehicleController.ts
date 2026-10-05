import { Request, Response, NextFunction } from 'express';
import { vehicleBackendService } from '../services/vehicleService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';
import { VehicleQueryParams } from '../repositories/vehicleRepository.ts';

export const vehicleController = {
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        brand,
        make,
        category,
        bodyClass,
        minPrice,
        maxPrice,
        transmission,
        drivetrain,
        powertrain,
        fuelType,
        minYear,
        maxYear,
        maxMileage,
        onlyCertified,
        sort,
        page,
        limit,
      } = req.query;

      const params: VehicleQueryParams = {
        search: typeof search === 'string' ? search : undefined,
        brand: typeof brand === 'string' ? brand : typeof make === 'string' ? make : undefined,
        category: typeof category === 'string' ? category : typeof bodyClass === 'string' ? bodyClass : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        transmission: typeof transmission === 'string' ? transmission : undefined,
        drivetrain: typeof drivetrain === 'string' ? drivetrain : undefined,
        powertrain: typeof powertrain === 'string' ? powertrain : typeof fuelType === 'string' ? fuelType : undefined,
        minYear: minYear !== undefined ? Number(minYear) : undefined,
        maxYear: maxYear !== undefined ? Number(maxYear) : undefined,
        maxMileage: maxMileage !== undefined ? Number(maxMileage) : undefined,
        onlyCertified: onlyCertified === 'true' || onlyCertified === '1',
        sort: typeof sort === 'string' ? sort : undefined,
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
      };

      const result = await vehicleBackendService.getVehicles(params);

      return sendSuccess({
        res,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleBackendService.getVehicleById(id);

      if (!vehicle) {
        return sendError({
          res,
          statusCode: 404,
          code: 'VEHICLE_NOT_FOUND',
          message: `Vehicle with identifier '${id}' was not found in the telemetry catalog.`,
        });
      }

      return sendSuccess({
        res,
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSimilarVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 3;
      const vehicles = await vehicleBackendService.getSimilarVehicles(id, limit);

      return sendSuccess({
        res,
        data: vehicles,
      });
    } catch (err) {
      next(err);
    }
  },

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { make, model, year, priceUsd } = req.body;
      if (!make || !model || !year || !priceUsd) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Make, model, year, and priceUsd are required parameters.',
        });
      }

      const vehicle = await vehicleBackendService.createVehicle(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Vehicle added to telemetry inventory catalog.',
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await vehicleBackendService.updateVehicle(id, req.body);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'VEHICLE_NOT_FOUND',
          message: `Vehicle with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Vehicle telemetry updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await vehicleBackendService.deleteVehicle(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'VEHICLE_NOT_FOUND',
          message: `Vehicle with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'Vehicle decommissioned and removed from catalog.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
