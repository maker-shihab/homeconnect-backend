// modules/dashboard/dashboard.module.ts
import { Router } from 'express';
import { dashboardRoutes } from './dashboard.routes';

export class DashboardModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/dashboard', dashboardRoutes);
  }
}

export const dashboardModule = new DashboardModule();