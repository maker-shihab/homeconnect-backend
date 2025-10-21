// modules/payment/payment.controller.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { bookingService } from '../booking/booking.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class PaymentController {

  handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await bookingService.handlePaymentSuccess(session.id);
          break;

        case 'payment_intent.succeeded':
          console.log('Payment succeeded');
          break;

        case 'payment_intent.payment_failed':
          console.log('Payment failed');
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  };

  getConfig = (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      }
    });
  };
}

export const paymentController = new PaymentController();