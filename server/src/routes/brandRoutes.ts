import { Router } from 'express';
import { brandController } from '../controllers/brandController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public read endpoints
router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrandById);

// Admin-protected mutations
router.post('/', requireAdmin, brandController.createBrand);
router.put('/:id', requireAdmin, brandController.updateBrand);
router.patch('/:id', requireAdmin, brandController.updateBrand);
router.delete('/:id', requireAdmin, brandController.deleteBrand);

export default router;
