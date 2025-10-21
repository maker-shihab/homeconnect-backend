// modules/dashboard/dashboard.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { dashboardController } from './dashboard.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', dashboardController.getDashboardData);
router.get('/stats', dashboardController.getStats);
router.get('/earnings/:year?', dashboardController.getEarningsReport);

export const dashboardRoutes = router;