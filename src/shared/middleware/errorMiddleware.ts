import { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';
import { AppError } from '../utils/AppError';

export interface StructuredErrorResponse {
  success: false;
  status: 'error';
  statusCode: number;
  message: string;
  details?: any;
  stack?: string;
}

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number | string;
  details?: any;
  errors?: any;
}


const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use a different value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const messages = Object.values(err.errors).map((val: any) => val.message);
  const message = `Invalid input data. ${messages.join('. ')}`;
  return new AppError(message, 400, err.errors);
};

const handleJWTError = (): AppError => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = (): AppError => new AppError('Your token has expired! Please log in again.', 401);



export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';
  let details = err.details;

  console.error('SERVER ERROR LOG:', {
    status: statusCode,
    message: err.message,
    name: err.name,
    stack: err.stack,
    code: err.code,
  });

  if (err.isOperational) {
    // Keep statusCode, message, and details as set in the AppError constructor
  }

  else {
    if (err.name === 'CastError') {
      const castError = err as unknown as Error.CastError;
      const processedError = handleCastErrorDB(castError);
      statusCode = processedError.statusCode;
      message = processedError.message;
    }

    else if (err.name === 'MongoServerError' && err.code === 11000) {
      const processedError = handleDuplicateFieldsDB(err);
      statusCode = processedError.statusCode;
      message = processedError.message;
    }

    else if (err.name === 'ValidationError') {
      const validationError = err as unknown as Error.ValidationError;
      const processedError = handleValidationErrorDB(validationError);
      statusCode = processedError.statusCode;
      message = processedError.message;
      details = processedError.details;
    }

    // JWT Errors
    else if (err.name === 'JsonWebTokenError') {
      const processedError = handleJWTError();
      statusCode = processedError.statusCode;
      message = processedError.message;
    } else if (err.name === 'TokenExpiredError') {
      const processedError = handleJWTExpiredError();
      statusCode = processedError.statusCode;
      message = processedError.message;
    }

    if (statusCode === 500) {
      message = process.env.NODE_ENV === 'production' ? 'Server Error' : message;
    }
  }

  const response: StructuredErrorResponse = {
    success: false,
    status: 'error',
    statusCode: statusCode,
    message: message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};