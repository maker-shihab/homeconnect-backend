// modules/dashboard/dashboard.controller.ts
import { Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AppError } from '../../shared/utils/AppError';
import { catchAsync } from '../../shared/utils/catchAsync';
import { dashboardService } from './dashboard.services';
import {
  dashboardDataSchema,
  earningsDataSchema,
  getDashboardStatsSchema,
  getEarningsReportSchema
} from './dashboard.validation';

export class DashboardController {
  getDashboardData = [
    validateRequest(getDashboardStatsSchema),
    catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboardData = await dashboardService.getDashboardData(userId, req.query);

      // Validate response data
      const validatedData = dashboardDataSchema.parse(dashboardData);

      res.status(200).json({
        status: 'success',
        data: validatedData
      });
    })
  ];

  getEarningsReport = [
    validateRequest(getEarningsReportSchema),
    catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.id;
      const year = parseInt(req.params.year) || new Date().getFullYear();

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const earningsData = await dashboardService.getLandlordEarnings(userId, year);

      // Validate response data
      const validatedData = earningsDataSchema.parse(earningsData);

      res.status(200).json({
        status: 'success',
        data: validatedData
      });
    })
  ];

  getStats = [
    validateRequest(getDashboardStatsSchema),
    catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboardData = await dashboardService.getDashboardData(userId, req.query);

      res.status(200).json({
        status: 'success',
        data: {
          stats: dashboardData.stats,
          quickStats: dashboardData.quickStats
        }
      });
    })
  ];
}

export const dashboardController = new DashboardController();