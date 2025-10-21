import { Document, Types } from 'mongoose';

// Common Base Interface
export interface IPropertyBase extends Document {
  // Basic Information
  title: string;
  description: string;
  listingType: 'rent' | 'sale';
  propertyType: 'apartment' | 'house' | 'condo' | 'villa' | 'townhouse' | 'studio' | 'land' | 'commercial';

  // Location
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;

  // Specifications
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: 'sqft' | 'sqm' | 'acres' | 'hectares';
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: 'sqft' | 'sqm' | 'acres' | 'hectares';

  // Features & Media
  amenities: string[];
  images?: string[];
  videos?: string[];
  virtualTour?: string;
  floorPlans?: string[];

  // Property Status
  status: 'available' | 'pending' | 'sold' | 'rented' | 'maintenance' | 'unavailable';
  featured: boolean;
  isVerified: boolean;
  tags: string[];

  // Ownership & Management
  owner: Types.ObjectId;
  agent?: Types.ObjectId;
  managementCompany?: string;

  // Engagement
  views: number;
  likes: Types.ObjectId[];
  savedBy: Types.ObjectId[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastRefreshed: Date;
}

// Rental Specific Properties
export interface IRentalSpecific {
  // Rental Pricing
  rentPrice: number;
  currency: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;

  // Rental Terms
  minimumStay: number; // in months
  maximumStay?: number; // in months
  availableFrom: Date;
  leaseDuration?: number; // in months
  isFurnished: boolean;
  utilitiesIncluded: string[]; // ['water', 'electricity', 'internet', etc.]
  petPolicy: 'allowed' | 'not-allowed' | 'case-by-case';
  smokingPolicy: 'allowed' | 'not-allowed';

  // Rental Status
  isAvailable: boolean;
  lastRented?: Date;
}

// Sale Specific Properties
export interface ISaleSpecific {
  // Sale Pricing
  salePrice: number;
  currency: string;
  originalPrice?: number;
  priceNegotiable: boolean;
  mortgageAvailable: boolean;

  // Sale Terms
  propertyCondition: 'excellent' | 'good' | 'needs-renovation' | 'new-construction';
  ownershipType: 'freehold' | 'leasehold' | 'condominium';
  hoaFee?: number;
  hoaFrequency?: 'monthly' | 'quarterly' | 'yearly';
  taxAmount?: number;
  taxYear?: number;

  // Sale Timeline
  timeOnMarket: number; // in days
  openHouseDates?: Date[];
  offerDeadline?: Date;
}

// Main Property Interface
export type IProperty = (IPropertyBase & {
  listingType: 'rent';
}) & IRentalSpecific | (IPropertyBase & {
  listingType: 'sale';
}) & ISaleSpecific;

// Request DTOs
export interface ICreatePropertyBaseRequest {
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'villa' | 'townhouse' | 'studio' | 'land' | 'commercial';
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: 'sqft' | 'sqm' | 'acres' | 'hectares';
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: 'sqft' | 'sqm' | 'acres' | 'hectares';
  amenities: string[];
  images: string[];
  videos?: string[];
  virtualTour?: string;
  floorPlans?: string[];
  tags?: string[];
  agent?: string;
  managementCompany?: string;
}

export interface ICreateRentalPropertyRequest extends ICreatePropertyBaseRequest {
  listingType: 'rent';
  rentPrice: number;
  currency?: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;
  minimumStay?: number;
  maximumStay?: number;
  availableFrom: Date;
  leaseDuration?: number;
  isFurnished: boolean;
  utilitiesIncluded: string[];
  petPolicy: 'allowed' | 'not-allowed' | 'case-by-case';
  smokingPolicy: 'allowed' | 'not-allowed';
}

export interface ICreateSalePropertyRequest extends ICreatePropertyBaseRequest {
  listingType: 'sale';
  salePrice: number;
  currency?: string;
  originalPrice?: number;
  priceNegotiable?: boolean;
  mortgageAvailable?: boolean;
  propertyCondition: 'excellent' | 'good' | 'needs-renovation' | 'new-construction';
  ownershipType: 'freehold' | 'leasehold' | 'condominium';
  hoaFee?: number;
  hoaFrequency?: 'monthly' | 'quarterly' | 'yearly';
  taxAmount?: number;
  taxYear?: number;
  openHouseDates?: Date[];
  offerDeadline?: Date;
}

export type ICreatePropertyRequest = ICreateRentalPropertyRequest | ICreateSalePropertyRequest;

// Update DTOs
export interface IUpdatePropertyBaseRequest {
  title?: string;
  description?: string;
  status?: 'available' | 'pending' | 'sold' | 'rented' | 'maintenance' | 'unavailable';
  images?: string[];
  amenities?: string[];
  tags?: string[];
  featured?: boolean;
}

export interface IUpdateRentalPropertyRequest extends IUpdatePropertyBaseRequest {
  rentPrice?: number;
  securityDeposit?: number;
  isAvailable?: boolean;
  availableFrom?: Date;
  minimumStay?: number;
  isFurnished?: boolean;
  utilitiesIncluded?: string[];
}

export interface IUpdateSalePropertyRequest extends IUpdatePropertyBaseRequest {
  salePrice?: number;
  originalPrice?: number;
  priceNegotiable?: boolean;
  propertyCondition?: 'excellent' | 'good' | 'needs-renovation' | 'new-construction';
  hoaFee?: number;
}

export type IUpdatePropertyRequest = IUpdateRentalPropertyRequest | IUpdateSalePropertyRequest;

// Filter Interfaces
export interface IPropertyFiltersBase {
  propertyType?: string;
  bedrooms?: number | { min?: number; max?: number };
  bathrooms?: number | { min?: number; max?: number };
  city?: string;
  neighborhood?: string;
  state?: string;
  amenities?: string[];
  featured?: boolean;
  isVerified?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface IRentalFilters extends IPropertyFiltersBase {
  listingType: 'rent';
  minRent?: number;
  maxRent?: number;
  minStay?: number;
  isFurnished?: boolean;
  petPolicy?: 'allowed' | 'not-allowed' | 'case-by-case';
  utilitiesIncluded?: string[];
  availableFrom?: Date;
}

export interface ISaleFilters extends IPropertyFiltersBase {
  listingType: 'sale';
  minPrice?: number;
  maxPrice?: number;
  propertyCondition?: string[];
  ownershipType?: string;
  priceNegotiable?: boolean;
  mortgageAvailable?: boolean;
}

export type IPropertyFilters = IRentalFilters | ISaleFilters;

// Response Interfaces
interface IPropertyResponseBase {
  id: string;
  title: string;
  description: string;
  listingType: 'rent' | 'sale';
  propertyType: string;
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: string;
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: string;
  amenities: string[];
  images: string[];
  videos?: string[];
  virtualTour?: string;
  floorPlans?: string[];
  status: string;
  featured: boolean;
  isVerified: boolean;
  tags: string[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    company?: string;
  };
  views: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
}

export interface IRentalPropertyResponse extends IPropertyResponseBase {
  listingType: 'rent';
  rentPrice: number;
  currency: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;
  minimumStay: number;
  maximumStay?: number;
  availableFrom: string;
  leaseDuration?: number;
  isFurnished: boolean;
  utilitiesIncluded: string[];
  petPolicy: string;
  smokingPolicy: string;
  isAvailable: boolean;
  lastRented?: string;
}

export interface ISalePropertyResponse extends IPropertyResponseBase {
  listingType: 'sale';
  salePrice: number;
  currency: string;
  originalPrice?: number;
  priceNegotiable: boolean;
  mortgageAvailable: boolean;
  propertyCondition: string;
  ownershipType: string;
  hoaFee?: number;
  hoaFrequency?: string;
  taxAmount?: number;
  taxYear?: number;
  timeOnMarket: number;
  openHouseDates?: string[];
  offerDeadline?: string;
}

export type IPropertyResponse = IRentalPropertyResponse | ISalePropertyResponse;

// Search Result Interface
export interface IPropertySearchResult {
  properties: IPropertyResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters?: {
    priceRange?: { min: number; max: number };
    bedroomRange?: { min: number; max: number };
    bathroomRange?: { min: number; max: number };
  };
}

// Type Guards
export function isRentalProperty(property: IProperty): property is IProperty & IRentalSpecific {
  return property.listingType === 'rent';
}

export function isSaleProperty(property: IProperty): property is IProperty & ISaleSpecific {
  return property.listingType === 'sale';
}

export function isRentalRequest(request: ICreatePropertyRequest): request is ICreateRentalPropertyRequest {
  return request.listingType === 'rent';
}

export function isSaleRequest(request: ICreatePropertyRequest): request is ICreateSalePropertyRequest {
  return request.listingType === 'sale';
}