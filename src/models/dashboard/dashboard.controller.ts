import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { catchAsync } from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
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
  getDashboardOverview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const userRole = req.user!.role as TUserRole;

      const overviewData = await dashboardService.getDashboardOverview(
        userId,
        userRole
      );

      sendResponse(
        res,
        200,
        'Dashboard overview retrieved successfully',
        overviewData
      );
    }
  );

  createMaintenanceRequest = [
    validateRequest(CreateMaintenanceRequestSchema, 'body'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const tenantId = req.user!.userId;
      const request = await dashboardService.createMaintenanceRequest(
        tenantId,
        req.body
      );

      sendResponse(
        res,
        201,
        'Maintenance request submitted successfully',
        request
      );
    }),
  ];

  getMaintenanceRequests = [
    validateRequest(MaintenanceFiltersSchema, 'query'),
    catchAsync(
      async (
        req: Request<any, any, any, MaintenanceFiltersInput>,
        res: Response,
        next: NextFunction
      ) => {
        const filters = req.query as MaintenanceFiltersInput;
        const result = await dashboardService.getMaintenanceRequests(filters);

        sendResponse(
          res,
          200,
          'Maintenance requests retrieved successfully',
          result.requests,
          {
            page: filters.page,
            limit: filters.limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: (filters.page || 1) < result.totalPages,
            hasPrev: (filters.page || 1) > 1,
          }
        );
      }
    ),
  ];

  updateMaintenanceRequest = [
    validateRequest(MaintenanceIdSchema, 'params'),
    validateRequest(UpdateMaintenanceRequestSchema, 'body'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { userId, role } = req.user!;

      const updatedRequest = await dashboardService.updateMaintenanceRequest(
        id,
        req.body,
        userId,
        role as TUserRole
      );

      sendResponse(res, 200, 'Maintenance request updated', updatedRequest);
    }),
  ];

  getActivities = [
    validateRequest(ActivityFiltersSchema, 'query'),
    catchAsync(
      async (
        req: Request<any, any, any, ActivityFiltersInput>,
        res: Response,
        next: NextFunction
      ) => {
        const filters = req.query as ActivityFiltersInput;
        const result = await dashboardService.getActivities(filters);

        sendResponse(
          res,
          200,
          'Activities retrieved successfully',
          result.activities,
          {
            page: filters.page,
            limit: filters.limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: (filters.page || 1) < result.totalPages,
            hasPrev: (filters.page || 1) > 1,
          }
        );
      }
    ),
  ];
}

export const dashboardController = new DashboardController();