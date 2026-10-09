import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.ts';
import { sensitiveActionLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', sensitiveActionLimiter, bookingController.createBooking);
router.patch('/:id', bookingController.updateBookingStatus);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBooking);

export default router;
