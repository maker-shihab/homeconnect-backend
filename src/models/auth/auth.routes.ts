import express from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authController } from './auth.controller';
import { verifyEmailSchema } from './auth.validation';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Add email verification route
router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authController.changePassword);

// Protected routes
router.use(authMiddleware);

router.post('/logout', authController.logout);

router.get('/profile', authController.getProfile);
router.patch('/profile', authController.updateProfile);

export const authRoutes = router;