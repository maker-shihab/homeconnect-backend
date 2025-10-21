// modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AppError } from '../../shared/utils/AppError';
import { catchAsync } from '../../shared/utils/catchAsync';
import { registerUserSchema } from '../user/user.validation';
import { authService } from './auth.services';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema
} from './auth.validation';

export class AuthController {
  register = [
    validateRequest(registerUserSchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      try {
        const result = await authService.register(req.body);

        res.status(201).json({
          status: 'success',
          message: 'User registered successfully. Please check your email for verification.',
          data: result
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError('Failed to register user', 500);
      }
    })
  ];

  login = [
    validateRequest(loginSchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      const result = await authService.login(req.body);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    })
  ];

  refreshToken = [
    validateRequest(refreshTokenSchema),
    catchAsync(async (req: Request, res: Response) => {
      const authResponse = await authService.refreshToken(req.body.refreshToken);

      res.status(200).json({
        status: 'success',
        data: authResponse
      });
    })
  ];

  forgotPassword = [
    validateRequest(forgotPasswordSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await authService.forgotPassword(req.body);

      res.status(200).json({
        status: 'success',
        data: result
      });
    })
  ];

  resetPassword = [
    validateRequest(resetPasswordSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await authService.resetPassword(req.body);

      res.status(200).json({
        status: 'success',
        data: result
      });
    })
  ];

  changePassword = [
    validateRequest(changePasswordSchema),
    catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await authService.changePassword(userId, req.body);

      res.status(200).json({
        status: 'success',
        data: result
      });
    })
  ];

  verifyEmail = [
    validateRequest(verifyEmailSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await authService.verifyEmail(req.body);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    })
  ];

  getProfile = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: { user: (req as any).user }
    });
  });

  updateProfile = [
    validateRequest(updateProfileSchema),
    catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await authService.updateProfile(userId, req.body);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    })
  ];

  protect = catchAsync(async (req: Request, res: Response, next: Function) => {
    // This will be your authentication middleware
    // You'll need to implement JWT verification here
    next();
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const result = await authService.logout(userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  });
}

export const authController = new AuthController();