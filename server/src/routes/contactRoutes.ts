import { Router } from 'express';
import { contactController } from '../controllers/contactController.ts';
import { requireAdmin } from '../middleware/auth.ts';
import { sensitiveActionLimiter, adminLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

// Public submission with rate limiting
router.post('/', sensitiveActionLimiter, contactController.submitContact);

// Admin-protected message operations
router.get('/', requireAdmin, contactController.getAllSubmissions);
router.patch('/:id', requireAdmin, adminLimiter, contactController.updateContactStatus);
router.delete('/:id', requireAdmin, adminLimiter, contactController.deleteContact);

export default router;
