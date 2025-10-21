import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validationMiddleware';
import { userController } from './user.controller';
import { userUpdateSchema } from './user.validation';

const router = Router();

router.use(authMiddleware); // All routes protected

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserProfile);
router.put('/:id', validate(userUpdateSchema), userController.updateProfile);

export const userRoutes = router;