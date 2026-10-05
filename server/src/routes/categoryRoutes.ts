import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public read endpoints
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-protected mutations
router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);
router.patch('/:id', requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;
