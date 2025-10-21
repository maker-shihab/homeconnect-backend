// modules/booking/booking.validation.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    checkIn: z.string().transform(val => new Date(val)),
    checkOut: z.string().transform(val => new Date(val)),
    specialRequests: z.string().optional(),
  }).refine(data => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
  }, {
    message: 'Check-out date must be after check-in date',
  }),
});

export const bookingPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    returnUrl: z.string().url('Valid return URL is required'),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
  }),
});

export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
});