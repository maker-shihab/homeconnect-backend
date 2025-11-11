import express from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { checkRole } from '../../shared/middleware/checkRole.middleware';
import { dashboardController } from './dashboard.controller';

const router = express.Router();

// All dashboard routes are protected
router.use(authMiddleware);

router.get('/overview', dashboardController.getDashboardOverview);

router.post(
  '/maintenance',
  checkRole(['tenant']),
  dashboardController.createMaintenanceRequest,
);

router.get(
  '/maintenance',
  checkRole(['admin', 'landlord', 'tenant', 'support']),
  dashboardController.getMaintenanceRequests,
);

router.patch(
  '/maintenance/:id',
  checkRole(['admin', 'landlord']),
  dashboardController.updateMaintenanceRequest,
);

// Activity Log Route
router.get(
  '/activity',
  checkRole(['admin', 'landlord']),
  dashboardController.getActivities,
);

export const dashboardRoutes = router;