// modules/booking/booking.interface.ts
export interface IBooking {
  _id?: string;
  property: string;
  tenant: string;
  landlord: string;
  checkIn: Date;
  checkOut: Date;
  totalDays: number;
  totalAmount: number;
  securityDeposit: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  cancellationReason?: string;
  specialRequests?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateBookingRequest {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  specialRequests?: string;
}

export interface IBookingPayment {
  bookingId: string;
  paymentMethod: 'card';
  returnUrl: string;
}