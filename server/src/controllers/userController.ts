import { Request, Response, NextFunction } from 'express';
import { userBackendService } from '../services/userService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const userController = {
  async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userBackendService.getAllUsers();
      return sendSuccess({
        res,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, errors } = await userBackendService.createUser(req.body);
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
        statusCode: 201,
        message: 'User account created in registry.',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await userBackendService.deleteUser(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'USER_NOT_FOUND',
          message: `User with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        message: 'User account deleted successfully.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userBackendService.getUserById(id);

      if (!user) {
        return sendError({
          res,
          statusCode: 404,
          code: 'USER_NOT_FOUND',
          message: `User with identifier '${id}' was not found.`,
        });
      }

      return sendSuccess({
        res,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user, errors, notFound, forbidden } = await userBackendService.updateUserProfile(id, req.body);

      if (notFound) {
        return sendError({
          res,
          statusCode: 404,
          code: 'USER_NOT_FOUND',
          message: `User with identifier '${id}' was not found.`,
        });
      }

      if (forbidden) {
        return sendError({
          res,
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Client privilege escalation is forbidden. Role modification is not permitted via this endpoint.',
          details: errors,
        });
      }

      if (errors && errors.length > 0) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Invalid user profile modification parameters.',
          details: errors,
        });
      }

      return sendSuccess({
        res,
        data: user,
        message: 'Client profile telemetry updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
