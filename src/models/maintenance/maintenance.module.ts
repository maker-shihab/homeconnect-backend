// modules/maintenance/maintenance.module.ts
import { Router } from 'express';

export class MaintenanceModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/maintenance', maintenanceRoutes);
  }
}

export const maintenanceModule = new MaintenanceModule();