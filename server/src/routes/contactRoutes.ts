import { Router } from 'express';
import { contactController } from '../controllers/contactController.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public submission
router.post('/', contactController.submitContact);

// Admin-protected message operations
router.get('/', requireAdmin, contactController.getAllSubmissions);
router.patch('/:id', requireAdmin, contactController.updateContactStatus);
router.delete('/:id', requireAdmin, contactController.deleteContact);

export default router;
