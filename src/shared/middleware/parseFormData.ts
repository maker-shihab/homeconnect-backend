// src/shared/middleware/parseFormData.ts
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  // Only parse if it's a FormData request (has files or body data)
  if ((req.files && (req.files as Express.Multer.File[]).length > 0) || Object.keys(req.body).length > 0) {
    try {
      const parsedBody: any = { ...req.body };

      // Define numeric fields
      const numericFields = [
        'latitude', 'longitude', 'bedrooms', 'bathrooms', 'areaSize',
        'rentPrice', 'salePrice', 'securityDeposit', 'utilityDeposit',
        'maintenanceFee', 'minimumStay', 'maximumStay', 'leaseDuration',
        'yearBuilt', 'floor', 'totalFloors', 'lotSize', 'taxAmount', 'taxYear',
        'hoaFee', 'originalPrice'
      ];

      // Define boolean fields
      const booleanFields = [
        'isFurnished', 'priceNegotiable', 'mortgageAvailable', 'isAvailable', 'featured'
      ];

      // Define array fields
      const arrayFields = ['amenities', 'tags', 'utilitiesIncluded', 'videos', 'floorPlans', 'openHouseDates'];

      // Convert numeric fields
      numericFields.forEach(field => {
        if (parsedBody[field] !== undefined && parsedBody[field] !== null && parsedBody[field] !== '') {
          const numValue = Number(parsedBody[field]);
          parsedBody[field] = isNaN(numValue) ? 0 : numValue;
        }
      });

      // Convert boolean fields
      booleanFields.forEach(field => {
        if (parsedBody[field] !== undefined && parsedBody[field] !== null) {
          if (typeof parsedBody[field] === 'string') {
            parsedBody[field] = parsedBody[field] === 'true' || parsedBody[field] === '1';
          } else {
            parsedBody[field] = Boolean(parsedBody[field]);
          }
        }
      });

      // Convert array fields
      arrayFields.forEach(field => {
        if (parsedBody[field] !== undefined && parsedBody[field] !== null) {
          if (typeof parsedBody[field] === 'string') {
            try {
              // Try to parse as JSON first
              parsedBody[field] = JSON.parse(parsedBody[field]);
            } catch {
              // If not JSON, treat as comma-separated string
              parsedBody[field] = parsedBody[field].split(',').map((item: string) => item.trim()).filter((item: string) => item !== '');
            }
          }
          // Ensure it's an array
          if (!Array.isArray(parsedBody[field])) {
            parsedBody[field] = [];
          }
        }
      });

      // CRITICAL: Remove images field from parsed body since it's handled via file uploads
      if (parsedBody.images !== undefined) {
        delete parsedBody.images;
      }

      // Handle currency field - convert BDT to USD if needed
      if (parsedBody.currency === 'BDT') {
        parsedBody.currency = 'USD';
      }

      // FIX: Handle date fields - ENSURE THEY ARE STRINGS, NOT DATE OBJECTS
      if (parsedBody.availableFrom) {
        // If it's already a Date object, convert to ISO string
        if (parsedBody.availableFrom instanceof Date) {
          parsedBody.availableFrom = parsedBody.availableFrom.toISOString();
        } else if (typeof parsedBody.availableFrom === 'string') {
          // If it's a string, validate and ensure it's a future date
          const availableFromDate = new Date(parsedBody.availableFrom);
          const now = new Date();

          // If date is in the past or today, set to tomorrow
          if (availableFromDate <= now) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            parsedBody.availableFrom = tomorrow.toISOString();
          } else {
            // Keep as string, just ensure it's valid
            parsedBody.availableFrom = availableFromDate.toISOString();
          }
        }
      } else {
        // Set default availableFrom to tomorrow if not provided
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        parsedBody.availableFrom = tomorrow.toISOString();
      }

      // Handle offerDeadline date - ensure it's a string
      if (parsedBody.offerDeadline) {
        if (parsedBody.offerDeadline instanceof Date) {
          parsedBody.offerDeadline = parsedBody.offerDeadline.toISOString();
        } else if (typeof parsedBody.offerDeadline === 'string') {
          const offerDeadlineDate = new Date(parsedBody.offerDeadline);
          parsedBody.offerDeadline = offerDeadlineDate.toISOString();
        }
      }

      // Handle openHouseDates array - ensure they are strings
      if (parsedBody.openHouseDates && Array.isArray(parsedBody.openHouseDates)) {
        parsedBody.openHouseDates = parsedBody.openHouseDates.map((date: any) => {
          if (date instanceof Date) {
            return date.toISOString();
          } else if (typeof date === 'string') {
            const dateObj = new Date(date);
            return dateObj.toISOString();
          }
          return date;
        });
      }

      // FINAL CHECK: Ensure availableFrom is a string, not a Date object
      if (parsedBody.availableFrom instanceof Date) {
        parsedBody.availableFrom = parsedBody.availableFrom.toISOString();
      }

      // Update request body with parsed data
      req.body = parsedBody;

      console.log('🔍 Parsed body after middleware:', JSON.stringify(parsedBody, null, 2));
      console.log('🔍 availableFrom type:', typeof parsedBody.availableFrom);
      console.log('🔍 availableFrom value:', parsedBody.availableFrom);

    } catch (error) {
      console.error('Error parsing form data:', error);
      return next(new AppError('Error parsing form data: ' + (error as Error).message, 400));
    }
  }

  next();
};