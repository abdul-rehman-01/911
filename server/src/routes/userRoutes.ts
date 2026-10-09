import { Router } from 'express';
import { userController } from '../controllers/userController.ts';
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/auth.ts';

const router = Router();

// Admin routes for listing & managing all users
router.get('/', requireAdmin, userController.getAllUsers);
router.post('/', requireAdmin, userController.createUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

// Protected user profile endpoints with anti-IDOR enforcement
router.get('/:id', requireOwnerOrAdmin('id'), userController.getUserById);
router.patch('/:id', requireOwnerOrAdmin('id'), userController.updateUser);

export default router;
