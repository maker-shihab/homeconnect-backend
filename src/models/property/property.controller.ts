import { Request, Response } from 'express';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { catchAsync } from '../../shared/utils/catchAsync';
import { ICreatePropertyRequest } from './property.interface';
import { propertyService } from './property.service';
import {
  CreatePropertySchema,
  PropertyIdSchema,
  SimplePropertyFiltersSchema,
  UpdatePropertySchema,
  type PropertyFiltersInput,
  type UpdatePropertyInput
} from './property.validation';

export class PropertyController {
  createProperty = [
    validateRequest(CreatePropertySchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      const property = await propertyService.createProperty(
        req.user!.userId,
        req.body as unknown as ICreatePropertyRequest,
        files
      );

      res.status(201).json({
        status: 'success',
        message: 'Property created successfully',
        data: { property }
      });
    })
  ];

  getProperties = [
    validateRequest(SimplePropertyFiltersSchema, 'query'),
    catchAsync(async (req: Request, res: Response) => {
      const result = await propertyService.getProperties(req.query as unknown as PropertyFiltersInput);

      res.status(200).json({
        status: 'success',
        data: result
      });
    })
  ];

  getProperty = [
    // validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response) => {
      const property = await propertyService.getPropertyById(req.params.id);

      if (!property) {
        return res.status(404).json({
          status: 'error',
          message: 'Property not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { property }
      });
    })
  ];

  updateProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    validateRequest(UpdatePropertySchema, 'body'),
    catchAsync(async (req: Request, res: Response) => {
      const property = await propertyService.updateProperty(
        req.params.id,
        req.user!.userId,
        req.body as UpdatePropertyInput
      );

      res.status(200).json({
        status: 'success',
        message: 'Property updated successfully',
        data: { property }
      });
    })
  ];

  deleteProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response) => {
      await propertyService.deleteProperty(req.params.id, req.user!.userId);

      res.status(200).json({
        status: 'success',
        message: 'Property deleted successfully'
      });
    })
  ];

  likeProperty = [
    validateRequest(PropertyIdSchema, 'params'),
    catchAsync(async (req: Request, res: Response) => {
      const result = await propertyService.likeProperty(req.params.id, req.user!.userId);

      res.status(200).json({
        status: 'success',
        message: result.liked ? 'Property liked' : 'Property unliked',
        data: result
      });
    })
  ];

  getFeaturedProperties = catchAsync(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const properties = await propertyService.getFeaturedProperties(limit);

    res.status(200).json({
      status: 'success',
      data: { properties }
    });
  });

  getPropertiesByCity = catchAsync(async (req: Request, res: Response) => {
    const properties = await propertyService.getPropertiesByCity(req.params.city);

    res.status(200).json({
      status: 'success',
      data: { properties }
    });
  });

  getUserProperties = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await propertyService.getUserProperties(req.user!.userId, page, limit);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  getAvailableFilters = catchAsync(async (req: Request, res: Response) => {
    const filters = await propertyService.getAvailableFilters();

    res.status(200).json({
      status: 'success',
      data: filters
    });
  });
}

export const propertyController = new PropertyController();