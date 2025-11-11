import { z } from 'zod';

// ---------------
// Maintenance
// ---------------

export const MaintenanceStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);
export const MaintenancePrioritySchema = z.enum(['low', 'medium', 'high']);
export const MongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const CreateMaintenanceRequestSchema = z.object({
  property: MongoIdSchema,
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  priority: MaintenancePrioritySchema.default('medium'),
  // images validation would be handled by multer/file upload logic
});

export const UpdateMaintenanceRequestSchema = z
  .object({
    status: MaintenanceStatusSchema.optional(),
    priority: MaintenancePrioritySchema.optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (status or priority) must be provided',
  });

export const MaintenanceIdSchema = z.object({
  id: MongoIdSchema,
});

const stringToInt = z
  .string()
  .transform((val) => parseInt(val, 10))
  .optional();

export const MaintenanceFiltersSchema = z.object({
  status: MaintenanceStatusSchema.optional(),
  priority: MaintenancePrioritySchema.optional(),
  propertyId: MongoIdSchema.optional(),
  tenantId: MongoIdSchema.optional(),
  sortBy: z.enum(['createdAt', 'reportedAt', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: stringToInt.default(1),
  limit: stringToInt.default(10),
});

// ---------------
// Activity
// ---------------

export const ActivityFiltersSchema = z.object({
  action: z.string().optional(),
  userId: MongoIdSchema.optional(),
  entityId: MongoIdSchema.optional(),
  entityModel: z
    .enum(['Property', 'User', 'MaintenanceRequest', 'Payment'])
    .optional(),
  page: stringToInt.default(1),
  limit: stringToInt.default(20),
});

// Export Types
export type CreateMaintenanceRequestInput = z.infer<
  typeof CreateMaintenanceRequestSchema
>;
export type UpdateMaintenanceRequestInput = z.infer<
  typeof UpdateMaintenanceRequestSchema
>;
export type MaintenanceIdParams = z.infer<typeof MaintenanceIdSchema>;
export type MaintenanceFiltersInput = z.infer<typeof MaintenanceFiltersSchema>;
export type ActivityFiltersInput = z.infer<typeof ActivityFiltersSchema>;