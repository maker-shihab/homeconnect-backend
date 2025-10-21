// modules/booking/booking.service.ts
import Stripe from 'stripe';
import { AppError } from '../../shared/utils/AppError';
import { Property } from '../property/property.model';
import {
  IBooking,
  ICreateBookingRequest
} from './booking.interface';
import { Booking } from './booking.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class BookingService {

  async createBooking(userId: string, bookingData: ICreateBookingRequest): Promise<IBooking> {
    const property = await Property.findById(bookingData.propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.status !== 'available') {
      throw new AppError('Property is not available for booking', 400);
    }

    // Calculate total days and amount
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays < property.availability.minimumStay) {
      throw new AppError(`Minimum stay is ${property.availability.minimumStay} days`, 400);
    }

    const totalAmount = property.price * totalDays;
    const securityDeposit = property.securityDeposit || property.price;

    const booking = await Booking.create({
      property: bookingData.propertyId,
      tenant: userId,
      landlord: property.landlord,
      checkIn,
      checkOut,
      totalDays,
      totalAmount,
      securityDeposit,
      specialRequests: bookingData.specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    return booking;
  }

  async createPaymentSession(bookingId: string, returnUrl: string): Promise<{ sessionId: string; url: string }> {
    const booking = await Booking.findById(bookingId)
      .populate('property');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${(booking.property as any).title}`,
              description: `Stay from ${booking.checkIn.toDateString()} to ${booking.checkOut.toDateString()}`
            },
            unit_amount: Math.round(booking.totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Security Deposit',
              description: 'Refundable security deposit'
            },
            unit_amount: Math.round(booking.securityDeposit * 100),
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        bookingId: bookingId.toString()
      }
    });

    // Update booking with session ID
    booking.stripeSessionId = session.id;
    await booking.save();

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  async handlePaymentSuccess(sessionId: string): Promise<IBooking> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const booking = await Booking.findById(session.metadata?.bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentIntentId = session.payment_intent as string;
    await booking.save();

    // Update property status
    await Property.findByIdAndUpdate(booking.property, {
      status: 'rented'
    });

    return booking;
  }

  async getUserBookings(userId: string, userType: 'tenant' | 'landlord'): Promise<IBooking[]> {
    const query = userType === 'tenant'
      ? { tenant: userId }
      : { landlord: userId };

    return Booking.find(query)
      .populate('property')
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });
  }

  async cancelBooking(bookingId: string, userId: string, reason: string): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ tenant: userId }, { landlord: userId }]
    });

    if (!booking) {
      throw new AppError('Booking not found or access denied', 404);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    // Make property available again
    await Property.findByIdAndUpdate(booking.property, {
      status: 'available'
    });

    return booking;
  }
}

export const bookingService = new BookingService();