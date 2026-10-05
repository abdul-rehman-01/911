import { Request, Response, NextFunction } from 'express';
import { categoryRepository } from '../repositories/categoryRepository.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const categoryController = {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepository.findAll();
      return sendSuccess({
        res,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryRepository.findById(id);
      if (!category) {
        return sendError({
          res,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND',
          message: `Category with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Category name is required.',
        });
      }

      const category = await categoryRepository.create({ name, description });
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Chassis class category registered successfully.',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await categoryRepository.update(id, req.body);
      if (!updated) {
        return sendError({
          res,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND',
          message: `Category with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        message: 'Category specifications updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await categoryRepository.delete(id);
      if (!success) {
        return sendError({
          res,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND',
          message: `Category with identifier '${id}' was not found.`,
        });
      }
      return sendSuccess({
        res,
        message: 'Category eliminated from registry.',
        data: { id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  },
};
