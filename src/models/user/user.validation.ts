import { z } from 'zod';

export const userCreateSchema = z.object({
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
    role: z.enum(['student', 'landlord', 'admin'])
      .default('student'),
    phone: z.string()
      .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
      .optional(),
    avatar: z.string()
      .url('Invalid avatar URL')
      .optional(),
  }).strict(),
});

export const userUpdateSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .optional(),
    phone: z.string()
      .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
      .optional(),
    avatar: z.string()
      .url('Invalid avatar URL')
      .optional(),
  }).strict(),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'User ID is required')
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  }),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>['body'];
export type UserUpdateInput = z.infer<typeof userUpdateSchema>['body'];
export type UserIdParam = z.infer<typeof userIdParamSchema>['params'];