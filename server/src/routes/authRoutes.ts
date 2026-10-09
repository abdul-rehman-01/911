import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authLimiter } from '../middleware/rateLimiter.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.get('/me', requireAuth, authController.me);
router.post('/logout', authController.logout);

export default router;
