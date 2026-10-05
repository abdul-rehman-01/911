import { Router } from 'express';
import { dealerController } from '../controllers/dealerController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/', dealerController.getDealers);
router.get('/:id', dealerController.getDealerById);

// Admin-protected mutations
router.post('/', requireAdmin, dealerController.createDealer);
router.put('/:id', requireAdmin, dealerController.updateDealer);
router.patch('/:id', requireAdmin, dealerController.updateDealer);
router.delete('/:id', requireAdmin, dealerController.deleteDealer);

export default router;
