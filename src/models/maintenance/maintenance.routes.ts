// modules/maintenance/maintenance.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// All maintenance routes require authentication
router.use(authMiddleware);

// router.post('/', maintenanceController.createMaintenance);
// router.get('/', maintenanceController.getMaintenanceRequests);
// router.get('/:id', maintenanceController.getMaintenanceById);
// router.patch('/:id/status', maintenanceController.updateMaintenanceStatus);
// router.patch('/:id/assign', maintenanceController.assignMaintenance);

export const maintenanceRoutes = router;