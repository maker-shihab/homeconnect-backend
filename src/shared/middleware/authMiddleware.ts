import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../../models/auth/auth.interface';
import { User } from '../../models/user/user.models';
import { AppError } from '../utils/AppError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('JWT secret not configured', 500));
    }

    const decoded = jwt.verify(token, secret) as ITokenPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
};