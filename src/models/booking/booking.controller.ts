// modules/booking/booking.controller.ts
import { Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AppError } from '../../shared/utils/AppError';
import { catchAsync } from '../../shared/utils/catchAsync';
import { bookingService } from './booking.service';
import {
  bookingIdSchema,
  bookingPaymentSchema,
  cancelBookingSchema,
  createBookingSchema
} from './booking.validation';

export class BookingController {

  createBooking = [
    validateRequest(createBookingSchema),
    catchAsync(async (req: Request, res: Response) => {
      const booking = await bookingService.createBooking(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: { booking } });
    })
  ];

  createPaymentSession = [
    validateRequest(bookingPaymentSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await bookingService.createPaymentSession(
        req.body.bookingId,
        req.body.returnUrl
      );
      res.status(200).json({ status: 'success', data: result });
    })
  ];

  getUserBookings = catchAsync(async (req: Request, res: Response) => {
    const userType = req.query.type as 'tenant' | 'landlord' || 'tenant';
    const bookings = await bookingService.getUserBookings(req.user!.id, userType);
    res.status(200).json({ status: 'success', data: { bookings } });
  });

  cancelBooking = [
    validateRequest(bookingIdSchema),
    validateRequest(cancelBookingSchema),
    catchAsync(async (req: Request, res: Response) => {
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user!.id,
        req.body.reason
      );
      res.status(200).json({ status: 'success', data: { booking } });
    })
  ];

  getBooking = [
    validateRequest(bookingIdSchema),
    catchAsync(async (req: Request, res: Response) => {
      const bookings = await bookingService.getUserBookings(req.user!.id, 'tenant');
      const booking = bookings.find(b => b._id.toString() === req.params.id);

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      res.status(200).json({ status: 'success', data: { booking } });
    })
  ];
}

export const bookingController = new BookingController();