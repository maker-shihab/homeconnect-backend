import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AppError } from '../../shared/utils/AppError';
import { catchAsync } from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
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
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.register(req.body);
      sendResponse(
        res,
        201,
        'User registered successfully. Please check your email for verification.',
        result
      );
    }),
  ];

  login = [
    validateRequest(loginSchema, 'body'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.login(req.body);
      sendResponse(res, 200, 'Login successful', result);
    }),
  ];

  refreshToken = [
    validateRequest(refreshTokenSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const authResponse = await authService.refreshToken(req.body.refreshToken);
      sendResponse(res, 200, 'Token refreshed successfully', authResponse);
    }),
  ];

  forgotPassword = [
    validateRequest(forgotPasswordSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.forgotPassword(req.body);
      sendResponse(res, 200, 'Password reset email sent successfully', result);
    }),
  ];

  resetPassword = [
    validateRequest(resetPasswordSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.resetPassword(req.body);
      sendResponse(res, 200, 'Password reset successfully', result);
    }),
  ];

  changePassword = [
    validateRequest(changePasswordSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', 401));
      }
      const result = await authService.changePassword(userId, req.body);
      sendResponse(res, 200, 'Password changed successfully', result);
    }),
  ];

  verifyEmail = [
    validateRequest(verifyEmailSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.verifyEmail(req.body);
      sendResponse(res, 200, result.message, null);
    }),
  ];

  getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 'protect' middleware already set req.user
    sendResponse(res, 200, 'Profile retrieved successfully', req.user);
  });

  updateProfile = [
    validateRequest(updateProfileSchema),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', 401));
      }
      const user = await authService.updateProfile(userId, req.body);
      sendResponse(res, 200, 'Profile updated successfully', user);
    }),
  ];

  logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    const result = await authService.logout(userId);
    sendResponse(res, 200, 'Logout successful', result);
  });

  getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    sendResponse(res, 200, 'Profile retrieved successfully', req.user);
  });
}

export const authController = new AuthController();