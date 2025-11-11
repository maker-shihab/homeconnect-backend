import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { AppError } from '../../shared/utils/AppError';
import sendResponse from '../../shared/utils/sendResponse';
import { userService } from './user.services';

export class UserController {
  getUserProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      sendResponse(res, 200, 'User profile retrieved successfully', user);
    }
  );

  updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.updateUser(req.params.id, req.body);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      sendResponse(res, 200, 'Profile updated successfully', user);
    }
  );

  getUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await userService.getUsers(req.query);

      sendResponse(
        res,
        200,
        'Users retrieved successfully',
        result.users,
        result.pagination
      );
    }
  );

  getCurrentUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.getUserById(req.user!.userId.toString());

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      sendResponse(res, 200, 'Current user profile retrieved successfully', user);
    }
  );

  updateCurrentUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.updateUser(
        req.user!.userId.toString(),
        req.body
      );

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      sendResponse(res, 200, 'Profile updated successfully', user);
    }
  );
}

export const userController = new UserController();