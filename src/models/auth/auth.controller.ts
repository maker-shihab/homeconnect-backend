import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { authService } from './auth.services';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = await authService.register(req.body);

    res.status(201).json(
      ApiResponse.success('User registered successfully', authResponse)
    );
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authResponse = await authService.login(req.body);

    res.status(200).json(
      ApiResponse.success('Login successful', authResponse)
    );
  });

  getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // req.user will be set by auth middleware
    res.status(200).json(
      ApiResponse.success('User profile retrieved successfully', req.user)
    );
  });
}

export const authController = new AuthController();