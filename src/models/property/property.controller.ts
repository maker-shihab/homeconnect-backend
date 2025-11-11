import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AppError } from '../../shared/utils/AppError';
import { catchAsync } from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { ICreatePropertyRequest } from './property.interface';
import { propertyService } from './property.service';
import {
  CreatePropertySchema,
  PropertyIdSchema,
  UpdatePropertySchema,
  type UpdatePropertyInput,
} from './property.validation';

export class PropertyController {
  createProperty = [
    validateRequest(CreatePropertySchema, 'body'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as Express.Multer.File[];
      const property = await propertyService.createProperty(
        req.user!.userId,
        req.body as unknown as ICreatePropertyRequest,
        files
      );

      sendResponse(res, 201, 'Property created successfully', property, {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    }),
  ];

  getProperties = [
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await propertyService.getProperties(req.query);

      sendResponse(
        res,
        200,
        'Properties fetched successfully',
        result.properties,
        {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        }
      );
    }),
  ];

  getProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const property = await propertyService.getPropertyById(req.params.id);

      if (!property) {
        return next(new AppError('Property not found', 404));
      }

      sendResponse(res, 200, 'Property fetched successfully', property, {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    }),
  ];

  updateProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    validateRequest(UpdatePropertySchema, 'body'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const property = await propertyService.updateProperty(
        req.params.id,
        req.user!.userId,
        req.body as UpdatePropertyInput
      );

      sendResponse(res, 200, 'Property updated successfully', property, {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    }),
  ];

  deleteProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      await propertyService.deleteProperty(req.params.id, req.user!.userId);
      sendResponse(res, 200, 'Property deleted successfully', null);
    }),
  ];

  likeProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const result = await propertyService.likeProperty(
        req.params.id,
        req.user!.userId
      );
      const message = result.liked ? 'Property liked' : 'Property unliked';
      sendResponse(res, 200, message, result);
    }),
  ];

  getFeaturedProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const properties = await propertyService.getFeaturedProperties(limit);

      sendResponse(
        res,
        200,
        'Featured properties fetched successfully',
        properties,
        {
          page: 1,
          limit: properties.length,
          total: properties.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    }
  );

  getPropertiesByCity = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const properties = await propertyService.getPropertiesByCity(
        req.params.city
      );
      sendResponse(
        res,
        200,
        `Properties in ${req.params.city} fetched successfully`,
        properties,
        {
          page: 1,
          limit: properties.length,
          total: properties.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    }
  );

  getUserProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await propertyService.getUserProperties(
        req.user!.userId,
        page,
        limit
      );

      sendResponse(
        res,
        200,
        'User properties fetched successfully',
        result.properties,
        {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        }
      );
    }
  );

  getAvailableFilters = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const filters = await propertyService.getAvailableFilters();
      sendResponse(res, 200, 'Filters fetched successfully', filters, {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    }
  );
}

export const propertyController = new PropertyController();