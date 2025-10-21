import { z } from 'zod';

export const dashboardFiltersSchema = z.object({
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  propertyType: z.enum(['apartment', 'house', 'studio', 'condo']).optional(),
});

export const earningsReportSchema = z.object({
  year: z.string().optional().transform(val => val ? parseInt(val) : new Date().getFullYear())
    .refine(val => val >= 2020 && val <= 2030, {
      message: 'Year must be between 2020 and 2030'
    })
});

export const getDashboardStatsSchema = z.object({
  query: dashboardFiltersSchema
});

export const getEarningsReportSchema = z.object({
  params: earningsReportSchema
});

// Response validation schemas
export const propertyStatsSchema = z.object({
  total: z.number().min(0),
  available: z.number().min(0),
  rented: z.number().min(0),
  maintenance: z.number().min(0),
});

export const quickStatsSchema = z.object({
  monthlyRevenue: z.number().min(0),
  occupancyRate: z.number().min(0).max(100),
  pendingApplications: z.number().min(0),
  maintenanceRequests: z.number().min(0),
  totalTenants: z.number().min(0),
});

export const recentActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['booking', 'payment', 'maintenance', 'inquiry', 'application']),
  title: z.string(),
  description: z.string(),
  timestamp: z.date(),
  propertyId: z.string().optional(),
  userId: z.string().optional(),
  read: z.boolean(),
});

export const recentPropertySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(1, 'Address is required'),
  price: z.number().min(0, 'Price must be positive'),
  type: z.enum(['apartment', 'house', 'studio', 'condo']),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  status: z.enum(['available', 'rented', 'maintenance']),
  image: z.string().url('Invalid image URL'),
  lastUpdated: z.date(),
});

export const dashboardDataSchema = z.object({
  stats: propertyStatsSchema,
  quickStats: quickStatsSchema,
  recentActivities: z.array(recentActivitySchema),
  recentProperties: z.array(recentPropertySchema),
});

export const earningsDataSchema = z.object({
  monthlyEarnings: z.array(z.number()),
  totalYearlyEarnings: z.number(),
  totalBookings: z.number(),
});

// Validation types
export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;
export type EarningsReportInput = z.infer<typeof earningsReportSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type EarningsData = z.infer<typeof earningsDataSchema>;