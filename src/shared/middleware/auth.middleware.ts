import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../../models/auth/auth.interface';
import { User } from '../../models/user/user.models';
import JWT_CONFIG from '../config/jwt.config';
import { AppError } from '../utils/AppError';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload & {
        userId: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7);

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.access.secret) as any;

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // 4. Check if user is active
    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    // 5. Add user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

// Optional: Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireOwnership = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceId = req.params[paramName];
    if (req.user.userId !== resourceId && req.user.role !== 'admin') {
      return next(new AppError('You can only access your own data', 403));
    }

    next();
  };
};