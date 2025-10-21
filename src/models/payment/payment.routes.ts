import { Router } from 'express';
import { paymentController } from './payment.controller';

const router = Router();

// Webhook needs raw body
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Public route for frontend to get Stripe config
router.get('/config', paymentController.getConfig);

export const paymentRoutes = router;