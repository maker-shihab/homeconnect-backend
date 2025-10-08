import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    const message = `Validation failed: ${messages.join(', ')}`;
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    details: (error as AppError).details || undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};