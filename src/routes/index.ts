import { Router } from 'express';
import { authRoutes } from '../models/auth/auth.routes';
import { dashboardRoutes } from '../models/dashboard/dashboard.routes';
import { propertyRoutes } from '../models/property/property.routes';
import { userRoutes } from '../models/user/user.route';

const router = Router();
// Add this to your routes for testing

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
router.use('/properties', propertyRoutes);
router.use('/dashboard', dashboardRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found 🚫`,
  });
});

export const globalRoute = router;