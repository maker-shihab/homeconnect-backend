import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { AppError } from '../utils/AppError';

export const validateRequest = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 Validation Debug Info:', {
        source,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers['content-type'],
        method: req.method,
        url: req.url
      });
      let dataToValidate;

      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      if (source === 'body' && (!dataToValidate || Object.keys(dataToValidate).length === 0)) {
        return next(new AppError('Request body is required', 400));
      }

      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData as any;
      } else {
        req.params = validatedData as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(issue => {
          const path = issue.path.join('.');
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        const message = `Validation failed: ${errorMessages.join(', ')}`;
        return next(new AppError(message, 400));
      }
      next(new AppError('Invalid request data', 400));
    }
  };
};