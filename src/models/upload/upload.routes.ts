// modules/upload/upload.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { handleMulterError } from '../../shared/middleware/multerErrorHandler';
import { uploadController } from './upload.controller';

const router = Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`));
    }
  }
});

// All upload routes require authentication
router.use(authMiddleware);

// Single image upload
router.post(
  '/image',
  upload.single('image'),
  handleMulterError,
  uploadController.uploadImage
);

// Multiple images upload
router.post(
  '/images',
  upload.array('images', 10),
  handleMulterError,
  uploadController.uploadMultipleImages
);

// Delete image
router.delete('/image', uploadController.deleteImage);

export const uploadRoutes = router;