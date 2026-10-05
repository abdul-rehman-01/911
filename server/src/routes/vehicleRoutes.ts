import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/similar', vehicleController.getSimilarVehicles);

// Admin routes
router.post('/', requireAdmin, vehicleController.createVehicle);
router.put('/:id', requireAdmin, vehicleController.updateVehicle);
router.patch('/:id', requireAdmin, vehicleController.updateVehicle);
router.delete('/:id', requireAdmin, vehicleController.deleteVehicle);

export default router;
