import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/authMiddleware';
import { validate } from '../../shared/middleware/validationMiddleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

export const authRoutes = router;