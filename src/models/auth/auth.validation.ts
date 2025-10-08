import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    role: z.enum(['student', 'landlord'])
      .default('student'),
    phone: z.string()
      .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
      .optional(),
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    password: z.string()
      .min(1, 'Password is required'),
  }).strict(),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];