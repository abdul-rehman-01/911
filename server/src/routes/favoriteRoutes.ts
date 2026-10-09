import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController.ts';
import { requireOwnerOrAdmin } from '../middleware/auth.ts';

const router = Router({ mergeParams: true });

// Anti-IDOR protection: Only the account owner or an admin can access/modify favorites
router.get('/', requireOwnerOrAdmin('userId'), favoriteController.getFavorites);
router.post('/', requireOwnerOrAdmin('userId'), favoriteController.addFavorite);
router.delete('/:vehicleId', requireOwnerOrAdmin('userId'), favoriteController.removeFavorite);

export default router;
