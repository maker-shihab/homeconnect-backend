import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { userService } from './user.services';

export class UserController {
  getUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(
      ApiResponse.success('User profile retrieved successfully', user)
    );
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json(
      ApiResponse.success('Profile updated successfully', user)
    );
  });

  getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.getUsers(page, limit);

    res.status(200).json(
      ApiResponse.success('Users retrieved successfully', result.users, result.pagination)
    );
  });

  // Get current user profile (from token)
  getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // req.user is set by authMiddleware
    const user = await userService.getUserById(req.user!._id.toString());

    res.status(200).json(
      ApiResponse.success('Current user profile retrieved successfully', user)
    );
  });

  // Update current user profile
  updateCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.updateUser(req.user!._id.toString(), req.body);

    res.status(200).json(
      ApiResponse.success('Profile updated successfully', user)
    );
  });
}

export const userController = new UserController();