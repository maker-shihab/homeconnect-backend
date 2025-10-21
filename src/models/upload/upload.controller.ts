// modules/upload/upload.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/utils/catchAsync';
import { uploadService } from './upload.service';

export class UploadController {
  uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const result = await uploadService.uploadImage(req.file, req.body.folder);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  uploadMultipleImages = catchAsync(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    const results = await uploadService.uploadMultipleImages(req.files as Express.Multer.File[], req.body.folder);

    res.status(200).json({
      status: 'success',
      data: results
    });
  });

  deleteImage = catchAsync(async (req: Request, res: Response) => {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'Public ID is required'
      });
    }

    await uploadService.deleteImage(publicId);

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  });
}

export const uploadController = new UploadController();