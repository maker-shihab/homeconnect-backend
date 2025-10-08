import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: z.ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        return next(new AppError('Validation failed', 400, errorMessages));
      }
      next(error);
    }
  };