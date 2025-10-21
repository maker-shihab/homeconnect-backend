// modules/booking/booking.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { bookingController } from './booking.controller';

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

router.post('/', bookingController.createBooking);
router.post('/payment', bookingController.createPaymentSession);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/:id', bookingController.getBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

export const bookingRoutes = router;