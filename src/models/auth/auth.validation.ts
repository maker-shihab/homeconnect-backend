// modules/auth/auth.validation.ts
import { z } from 'zod';

// Common validation patterns
const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter and one number'
  );

const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name too long')
  .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');

const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['tenant', 'landlord', 'admin', 'support']),
  phone: phoneSchema,
  avatar: z.string().nullable(), // Allow null value
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});


export const messageResponseSchema = z.object({
  message: z.string(),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    avatar: z.string().nullable(),  // Allow null value
    phone: z.string().optional(),
  }),
  token: z.string(),
  expiresIn: z.string(),
  refreshToken: z.string().optional(),
});



export const registerUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['tenant', 'landlord', 'admin', 'support']),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Validation types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;