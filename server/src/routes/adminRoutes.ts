import { Router } from 'express';
import { adminController } from '../controllers/adminController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Protect all admin statistics and operations
router.get('/stats', requireAdmin, adminController.getDashboardStats);

export default router;
