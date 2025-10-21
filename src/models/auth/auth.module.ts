// modules/auth/auth.module.ts
import { Router } from 'express';
import { authRoutes } from './auth.routes';

export class AuthModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/auth', authRoutes);
  }
}

export const authModule = new AuthModule();