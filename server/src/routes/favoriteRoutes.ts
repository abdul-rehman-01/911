import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController.ts';

const router = Router({ mergeParams: true });

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:vehicleId', favoriteController.removeFavorite);

export default router;
