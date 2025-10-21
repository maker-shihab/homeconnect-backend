import { z } from 'zod';

// Common Schemas
export const PropertyTypeSchema = z.enum([
  'apartment',
  'house',
  'condo',
  'villa',
  'townhouse',
  'studio',
  'land',
  'commercial'
]);

export const AreaUnitSchema = z.enum(['sqft', 'sqm', 'acres', 'hectares']);
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BDT']).default('USD');
export const StatusSchema = z.enum(['available', 'pending', 'sold', 'rented', 'maintenance', 'unavailable']);
export const PetPolicySchema = z.enum(['allowed', 'not-allowed', 'case-by-case']);
export const SmokingPolicySchema = z.enum(['allowed', 'not-allowed']);
export const PropertyConditionSchema = z.enum(['excellent', 'good', 'needs-renovation', 'new-construction']);
export const OwnershipTypeSchema = z.enum(['freehold', 'leasehold', 'condominium']);
export const HOAFrequencySchema = z.enum(['monthly', 'quarterly', 'yearly']);

// Common Base Schema
export const PropertyBaseSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),

  description: z.string()
    .min(50, 'Description must be at least 50 characters long')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),

  propertyType: PropertyTypeSchema,

  address: z.string()
    .min(10, 'Address must be at least 10 characters long')
    .max(500, 'Address cannot exceed 500 characters')
    .trim(),

  city: z.string()
    .min(2, 'City must be at least 2 characters long')
    .max(100, 'City cannot exceed 100 characters')
    .trim(),

  neighborhood: z.string()
    .min(2, 'Neighborhood must be at least 2 characters long')
    .max(100, 'Neighborhood cannot exceed 100 characters')
    .trim(),

  state: z.string()
    .min(2, 'State must be at least 2 characters long')
    .max(100, 'State cannot exceed 100 characters')
    .trim(),

  country: z.string()
    .min(2, 'Country must be at least 2 characters long')
    .max(100, 'Country cannot exceed 100 characters')
    .trim()
    .default('US'),

  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  zipCode: z.string()
    .max(20, 'Zip code cannot exceed 20 characters')
    .optional()
    .transform(val => val || undefined),

  bedrooms: z.number()
    .int('Bedrooms must be an integer')
    .min(0, 'Bedrooms cannot be negative')
    .max(50, 'Bedrooms cannot exceed 50'),

  bathrooms: z.number()
    .min(0, 'Bathrooms cannot be negative')
    .max(50, 'Bathrooms cannot exceed 50')
    .step(0.5, 'Bathrooms must be in increments of 0.5'),

  areaSize: z.number()
    .positive('Area size must be positive')
    .max(1000000, 'Area size seems too large'),

  areaUnit: AreaUnitSchema.default('sqft'),

  yearBuilt: z.number()
    .int('Year built must be an integer')
    .min(1800, 'Year built seems too old')
    .max(new Date().getFullYear() + 1, 'Year built cannot be in the future')
    .optional()
    .transform(val => val || undefined),

  lotSize: z.number()
    .positive('Lot size must be positive')
    .max(10000000, 'Lot size seems too large')
    .optional()
    .transform(val => val || undefined),

  lotUnit: AreaUnitSchema.optional(),

  amenities: z.array(z.string().trim())
    .min(1, 'At least one amenity is required')
    .max(50, 'Cannot have more than 50 amenities'),

  videos: z.array(z.string().url('Video must be a valid URL'))
    .max(10, 'Cannot have more than 10 videos')
    .optional()
    .default([]),

  virtualTour: z.string()
    .url('Virtual tour must be a valid URL')
    .optional()
    .transform(val => val || undefined),

  floorPlans: z.array(z.string().url('Floor plan must be a valid URL'))
    .max(10, 'Cannot have more than 10 floor plans')
    .optional()
    .default([]),

  tags: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 tags')
    .optional()
    .default([]),

  agent: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID format')
    .optional()
    .transform(val => val || undefined),

  managementCompany: z.string()
    .max(200, 'Management company name cannot exceed 200 characters')
    .optional()
    .transform(val => val || undefined),
});

// Rental Specific Schema
export const RentalSpecificSchema = z.object({
  listingType: z.literal('rent'),

  rentPrice: z.number()
    .positive('Rent price must be positive')
    .max(1000000, 'Rent price seems too high'),

  currency: CurrencySchema,

  securityDeposit: z.number()
    .min(0, 'Security deposit cannot be negative')
    .max(1000000, 'Security deposit seems too high')
    .optional()
    .transform(val => val || undefined),

  utilityDeposit: z.number()
    .min(0, 'Utility deposit cannot be negative')
    .max(100000, 'Utility deposit seems too high')
    .optional()
    .transform(val => val || undefined),

  maintenanceFee: z.number()
    .min(0, 'Maintenance fee cannot be negative')
    .max(10000, 'Maintenance fee seems too high')
    .optional()
    .transform(val => val || undefined),

  minimumStay: z.number()
    .int('Minimum stay must be an integer')
    .min(1, 'Minimum stay must be at least 1 month')
    .max(60, 'Minimum stay cannot exceed 60 months')
    .default(12),

  maximumStay: z.number()
    .int('Maximum stay must be an integer')
    .min(1, 'Maximum stay must be at least 1 month')
    .max(120, 'Maximum stay cannot exceed 120 months')
    .optional()
    .transform(val => val || undefined),

  availableFrom: z.string()
    .datetime('Available from must be a valid date')
    .refine((val) => new Date(val) > new Date(), {
      message: 'Available from date must be in the future'
    }),

  leaseDuration: z.number()
    .int('Lease duration must be an integer')
    .min(1, 'Lease duration must be at least 1 month')
    .max(120, 'Lease duration cannot exceed 120 months')
    .optional()
    .transform(val => val || undefined),

  isFurnished: z.boolean().default(false),

  utilitiesIncluded: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 utilities')
    .default([]),

  petPolicy: PetPolicySchema.default('not-allowed'),

  smokingPolicy: SmokingPolicySchema.default('not-allowed'),
});

// Sale Specific Schema
export const SaleSpecificSchema = z.object({
  listingType: z.literal('sale'),

  salePrice: z.number()
    .positive('Sale price must be positive')
    .max(100000000, 'Sale price seems too high'),

  currency: CurrencySchema,

  originalPrice: z.number()
    .positive('Original price must be positive')
    .max(100000000, 'Original price seems too high')
    .optional()
    .transform(val => val || undefined),

  priceNegotiable: z.boolean().default(true),

  mortgageAvailable: z.boolean().default(false),

  propertyCondition: PropertyConditionSchema,

  ownershipType: OwnershipTypeSchema,

  hoaFee: z.number()
    .min(0, 'HOA fee cannot be negative')
    .max(10000, 'HOA fee seems too high')
    .optional()
    .transform(val => val || undefined),

  hoaFrequency: HOAFrequencySchema.optional(),

  taxAmount: z.number()
    .min(0, 'Tax amount cannot be negative')
    .max(100000, 'Tax amount seems too high')
    .optional()
    .transform(val => val || undefined),

  taxYear: z.number()
    .int('Tax year must be an integer')
    .min(2000, 'Tax year seems too old')
    .max(new Date().getFullYear() + 1, 'Tax year cannot be in the future')
    .optional()
    .transform(val => val || undefined),

  openHouseDates: z.array(z.string().datetime().transform((val) => new Date(val)))
    .optional()
    .default([]),

  offerDeadline: z.string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
});

// Create Property Schemas
export const CreateRentalPropertySchema = PropertyBaseSchema.merge(RentalSpecificSchema);
export const CreateSalePropertySchema = PropertyBaseSchema.merge(SaleSpecificSchema);

export const CreatePropertySchema = z.discriminatedUnion('listingType', [
  CreateRentalPropertySchema,
  CreateSalePropertySchema
]);

// Update Property Schemas
export const UpdatePropertyBaseSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),

  description: z.string()
    .min(50, 'Description must be at least 50 characters long')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional(),

  status: StatusSchema.optional(),

  images: z.array(z.string().url('Image must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(30, 'Cannot have more than 30 images')
    .optional(),

  amenities: z.array(z.string().trim())
    .min(1, 'At least one amenity is required')
    .max(50, 'Cannot have more than 50 amenities')
    .optional(),

  tags: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 tags')
    .optional(),

  featured: z.boolean().optional(),
}).partial().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const UpdateRentalPropertySchema = z.object({
  title: z.string().min(10).max(200).trim().optional(),
  description: z.string().min(50).max(5000).trim().optional(),
  status: StatusSchema.optional(),
  images: z.array(z.string().url('Image must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(30, 'Cannot have more than 30 images')
    .optional(),
  amenities: z.array(z.string().trim())
    .min(1, 'At least one amenity is required')
    .max(50, 'Cannot have more than 50 amenities')
    .optional(),
  featured: z.boolean().optional(),
  rentPrice: z.number()
    .positive('Rent price must be positive')
    .max(1000000, 'Rent price seems too high')
    .optional(),
  securityDeposit: z.number()
    .min(0, 'Security deposit cannot be negative')
    .max(1000000, 'Security deposit seems too high')
    .optional()
    .transform(val => val || undefined),
  isAvailable: z.boolean().optional(),
  availableFrom: z.string()
    .datetime('Available from must be a valid date')
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Available from date must be in the future'
    })
    .optional(),
  minimumStay: z.number()
    .int('Minimum stay must be an integer')
    .min(1, 'Minimum stay must be at least 1 month')
    .max(60, 'Minimum stay cannot exceed 60 months')
    .optional(),
  isFurnished: z.boolean().optional(),
  utilitiesIncluded: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 utilities')
    .optional(),
}).partial().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const UpdateSalePropertySchema = z.object({
  title: z.string().min(10).max(200).trim().optional(),
  description: z.string().min(50).max(5000).trim().optional(),
  status: StatusSchema.optional(),
  images: z.array(z.string().url('Image must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(30, 'Cannot have more than 30 images')
    .optional(),
  amenities: z.array(z.string().trim())
    .min(1, 'At least one amenity is required')
    .max(50, 'Cannot have more than 50 amenities')
    .optional(),
  featured: z.boolean().optional(),
  salePrice: z.number()
    .positive('Sale price must be positive')
    .max(100000000, 'Sale price seems too high')
    .optional(),
  originalPrice: z.number()
    .positive('Original price must be positive')
    .max(100000000, 'Original price seems too high')
    .optional()
    .transform(val => val || undefined),
  priceNegotiable: z.boolean().optional(),
  propertyCondition: PropertyConditionSchema.optional(),
  hoaFee: z.number()
    .min(0, 'HOA fee cannot be negative')
    .max(10000, 'HOA fee seems too high')
    .optional()
    .transform(val => val || undefined),
}).partial().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const UpdatePropertySchema = z.union([
  UpdateRentalPropertySchema,
  UpdateSalePropertySchema
]);

const stringToNumber = z.string().transform(val => parseFloat(val)).optional();
const stringToInt = z.string().transform(val => parseInt(val, 10)).optional();
const stringToBoolean = z.enum(['true', 'false']).transform(val => val === 'true').optional();
const stringToArray = z.string().transform(val => val.split(',')).optional();

const BaseFiltersSchema = z.object({
  // Basic filters
  propertyType: z.string().optional(),

  // Numeric filters with string transformation
  bedrooms: z.union([
    stringToInt,
    z.object({
      min: z.number().int().min(0).max(50).optional(),
      max: z.number().int().min(0).max(50).optional(),
    })
  ]).optional(),

  bathrooms: z.union([
    stringToNumber,
    z.object({
      min: z.number().min(0).max(50).optional(),
      max: z.number().min(0).max(50).optional(),
    })
  ]).optional(),

  // Location filters
  city: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  state: z.string().trim().optional(),

  // Array filters
  amenities: stringToArray,
  tags: stringToArray,
  utilitiesIncluded: stringToArray,
  propertyCondition: stringToArray,

  // Boolean filters with transformation
  featured: stringToBoolean,
  isVerified: stringToBoolean,
  priceNegotiable: stringToBoolean,
  mortgageAvailable: stringToBoolean,
  isFurnished: stringToBoolean,

  // Search and sort
  search: z.string().trim().optional(),
  sortBy: z.enum(['price', 'createdAt', 'updatedAt', 'areaSize', 'bedrooms', 'views']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Pagination with defaults
  page: z.string().transform(val => parseInt(val, 10)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).default(10),

  // Location-based filters
  lat: stringToNumber,
  lng: stringToNumber,
  radius: stringToNumber,

  // Other filters
  availableFrom: z.string().datetime().optional(),
  ownershipType: z.string().optional(),
  petPolicy: PetPolicySchema.optional(),
  minStay: stringToInt,
}).partial();

export const RentalFiltersSchema = BaseFiltersSchema.extend({
  listingType: z.literal('rent').optional().default('rent'),
  minRent: stringToNumber,
  maxRent: stringToNumber,
});

export const SaleFiltersSchema = BaseFiltersSchema.extend({
  listingType: z.literal('sale').optional().default('sale'),
  minPrice: stringToNumber,
  maxPrice: stringToNumber,
});

export const PropertyFiltersSchema = z.union([
  RentalFiltersSchema,
  SaleFiltersSchema
]);

// ID Validation Schema
export const PropertyIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID format')
});

// Like/Unlike Schema
export const PropertyLikeSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID format'),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
});

// Status Update Schema
export const PropertyStatusSchema = z.object({
  status: StatusSchema
});



export const SimplePropertyFiltersSchema = BaseFiltersSchema.extend({
  listingType: z.enum(['rent', 'sale']).optional(),
  minRent: stringToNumber,
  maxRent: stringToNumber,
  minPrice: stringToNumber,
  maxPrice: stringToNumber,
}).partial();


// Export Types
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type CreateRentalPropertyInput = z.infer<typeof CreateRentalPropertySchema>;
export type CreateSalePropertyInput = z.infer<typeof CreateSalePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type UpdateRentalPropertyInput = z.infer<typeof UpdateRentalPropertySchema>;
export type UpdateSalePropertyInput = z.infer<typeof UpdateSalePropertySchema>;
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
export type RentalFiltersInput = z.infer<typeof RentalFiltersSchema>;
export type SaleFiltersInput = z.infer<typeof SaleFiltersSchema>;
export type PropertyIdParams = z.infer<typeof PropertyIdSchema>;
export type PropertyLikeInput = z.infer<typeof PropertyLikeSchema>;
export type PropertyStatusInput = z.infer<typeof PropertyStatusSchema>;

// Validation Functions
export const validateCreateProperty = (data: unknown) => CreatePropertySchema.parse(data);
export const validateUpdateProperty = (data: unknown) => UpdatePropertySchema.parse(data);
export const validatePropertyFilters = (data: unknown) => PropertyFiltersSchema.parse(data);
export const validatePropertyId = (data: unknown) => PropertyIdSchema.parse(data);
export const validatePropertyLike = (data: unknown) => PropertyLikeSchema.parse(data);
export const validatePropertyStatus = (data: unknown) => PropertyStatusSchema.parse(data);

// Safe Parse Functions (for use in controllers)
export const safeParseCreateProperty = (data: unknown) => CreatePropertySchema.safeParse(data);
export const safeParseUpdateProperty = (data: unknown) => UpdatePropertySchema.safeParse(data);
export const safeParsePropertyFilters = (data: unknown) => PropertyFiltersSchema.safeParse(data);