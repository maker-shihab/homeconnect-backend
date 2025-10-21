import express from 'express';
import { upload } from '../../shared/config/multer.config';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { handleMulterError } from '../../shared/middleware/multerErrorHandler';
import { parseFormData } from '../../shared/middleware/parseFormData';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { propertyController } from './property.controller';
import { CreatePropertySchema } from './property.validation';

const router = express.Router();

// Public routes
router.get('/', propertyController.getProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/filters', propertyController.getAvailableFilters);
router.get('/city/:city', propertyController.getPropertiesByCity);
router.get('/:id', propertyController.getProperty);

// Protected routes
router.use(authMiddleware);

router.post(
  '/',
  upload.array('images', 10),
  handleMulterError,
  parseFormData,
  validateRequest(CreatePropertySchema, 'body'),
  propertyController.createProperty
);

router.patch('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);
router.post('/:id/like', propertyController.likeProperty);
router.get('/user/my-properties', propertyController.getUserProperties);

export const propertyRoutes = router;