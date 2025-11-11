// dashborad.controller.ts

import { Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { catchAsync } from '../../shared/utils/catchAsync';
import { dashboardService, TUserRole } from './dashboard.services';
import {
  ActivityFiltersInput,
  ActivityFiltersSchema,
  CreateMaintenanceRequestSchema,
  MaintenanceFiltersInput,
  MaintenanceFiltersSchema,
  MaintenanceIdSchema,
  UpdateMaintenanceRequestSchema,
} from './dashboard.validation';

export class DashboardController {
  getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const userRole = req.user!.role as TUserRole;

    const overviewData = await dashboardService.getDashboardOverview(
      userId,
      userRole,
    );

    res.status(200).json({
      status: 'success',
      data: overviewData,
    });
  });

  // -----------------
  // MAINTENANCE
  // -----------------

  createMaintenanceRequest = [
    validateRequest(CreateMaintenanceRequestSchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      const tenantId = req.user!.userId;
      const request = await dashboardService.createMaintenanceRequest(
        tenantId,
        req.body,
      );

      res.status(201).json({
        status: 'success',
        message: 'Maintenance request submitted successfully',
        data: request,
      });
    }),
  ];

  getMaintenanceRequests = [
    validateRequest(MaintenanceFiltersSchema, 'query'),
    catchAsync(async (req: Request<any, any, any, MaintenanceFiltersInput>, res: Response) => {
      const filters = req.query as MaintenanceFiltersInput;
      const result = await dashboardService.getMaintenanceRequests(filters);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    }),
  ];

  updateMaintenanceRequest = [
    validateRequest(MaintenanceIdSchema, 'params'),
    validateRequest(UpdateMaintenanceRequestSchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      const { id } = req.params;
      const { userId, role } = req.user!;

      const updatedRequest = await dashboardService.updateMaintenanceRequest(
        id,
        req.body,
        userId,
        role as TUserRole,
      );

      res.status(200).json({
        status: 'success',
        message: 'Maintenance request updated',
        data: updatedRequest,
      });
    }),
  ];

  // -----------------
  // ACTIVITY
  // -----------------

  getActivities = [
    validateRequest(ActivityFiltersSchema, 'query'),
    catchAsync(async (req: Request<any, any, any, ActivityFiltersInput>, res: Response) => {
      const filters = req.query as ActivityFiltersInput;
      const result = await dashboardService.getActivities(filters);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    }),
  ];
}

export const dashboardController = new DashboardController();