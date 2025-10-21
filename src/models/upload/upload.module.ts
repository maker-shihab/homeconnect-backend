// modules/upload/upload.module.ts
import { Router } from 'express';
import { uploadRoutes } from './upload.routes';

export class UploadModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/upload', uploadRoutes);
  }
}

export const uploadModule = new UploadModule();