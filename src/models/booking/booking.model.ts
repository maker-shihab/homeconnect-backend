// modules/booking/booking.model.ts
import { Document, Schema, model } from 'mongoose';
import { IBooking } from './booking.interface';

export interface IBookingDocument extends IBooking, Document { }

const bookingSchema = new Schema<IBookingDocument>({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },
  tenant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant reference is required'],
  },
  landlord: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord reference is required'],
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
  },
  totalDays: {
    type: Number,
    required: [true, 'Total days is required'],
    min: [1, 'Total days must be at least 1'],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: [0, 'Security deposit cannot be negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentIntentId: String,
  stripeSessionId: String,
  cancellationReason: String,
  specialRequests: String,
}, {
  timestamps: true,
});

// Indexes
bookingSchema.index({ tenant: 1 });
bookingSchema.index({ landlord: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = model<IBookingDocument>('Booking', bookingSchema);