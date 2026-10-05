import { Router } from 'express';
import { userController } from '../controllers/userController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Admin routes for listing & managing all users
router.get('/', requireAdmin, userController.getAllUsers);
router.post('/', requireAdmin, userController.createUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

// User profile endpoints
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);

export default router;
