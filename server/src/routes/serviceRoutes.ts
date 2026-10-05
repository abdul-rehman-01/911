import { Router } from 'express';
import { serviceController } from '../controllers/serviceController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// Admin-protected mutations
router.post('/', requireAdmin, serviceController.createService);
router.put('/:id', requireAdmin, serviceController.updateService);
router.patch('/:id', requireAdmin, serviceController.updateService);
router.delete('/:id', requireAdmin, serviceController.deleteService);

export default router;
