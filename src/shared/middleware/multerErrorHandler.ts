// shared/middlewares/multerErrorHandler.ts
import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';

export const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum 10 files allowed'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected file field'
      });
    }
  } else if (error) {
    // Other errors (file filter errors, etc.)
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

  next();
};