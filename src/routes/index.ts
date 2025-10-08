import { Router } from 'express';
import { authRoutes } from '../models/auth/auth.routes';
import { userRoutes } from '../models/user/user.route';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy 🟢',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Register all module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// router.use('/properties', propertyRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found`,
  });
});

export const globalRoute = router;