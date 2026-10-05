import { Router } from 'express';
import { healthController } from '../controllers/healthController.ts';

const router = Router();

router.get('/', healthController.getHealth);

export default router;
