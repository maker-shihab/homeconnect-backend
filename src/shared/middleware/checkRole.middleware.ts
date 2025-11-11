import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

type TUserRole = 'tenant' | 'landlord' | 'admin' | 'support';

export const checkRole = (allowedRoles: TUserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError('Authentication required. Please log in.', 401),
      );
    }

    const userRole = req.user.role as TUserRole;

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return next(
      new AppError('You do not have permission to perform this action', 403),
    );
  };
};