/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { ParsedQs } from 'qs';
import { AppError } from '../../shared/utils/AppError';
import { QueryFeatures } from '../../shared/utils/queryFeatures';
import { uploadService } from '../upload/upload.service';
import {
  ICreatePropertyRequest,
  IProperty,
  IPropertyFilters,
  IPropertyResponse,
  IPropertyResponseBase,
  IPropertySearchResult,
  IRentalPropertyResponse,
  ISalePropertyResponse,
  isRentalRequest,
  isSaleRequest,
} from './property.interface';
import { Property } from './property.model';
import { UpdatePropertyInput } from './property.validation';

export class PropertyService {
  public async createProperty(
    userId: string,
    propertyData: ICreatePropertyRequest,
    files?: Express.Multer.File[]
  ): Promise<IProperty> {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        const uploadResults = await uploadService.uploadMultipleImages(
          files,
          'properties'
        );
        imageUrls = uploadResults.map((result) => result.url);
      } catch (uploadError) {
        // Business logic: continue even if upload fails
      }
    }

    const basePropertyData = {
      ...propertyData,
      owner: new Types.ObjectId(userId),
      agent: propertyData.agent
        ? new Types.ObjectId(propertyData.agent)
        : undefined,
      images: imageUrls,
      videos: propertyData.videos || [],
      floorPlans: propertyData.floorPlans || [],
      tags: propertyData.tags || [],
      status: 'available' as const,
      featured: false,
      isVerified: false,
      views: 0,
      likes: [],
      savedBy: [],
    };

    let specificData: any;

    if (isRentalRequest(propertyData)) {
      specificData = {
        rentPrice: propertyData.rentPrice,
        currency: propertyData.currency,
        securityDeposit: propertyData.securityDeposit,
        utilityDeposit: propertyData.utilityDeposit,
        maintenanceFee: propertyData.maintenanceFee,
        minimumStay: propertyData.minimumStay,
        maximumStay: propertyData.maximumStay,
        availableFrom: new Date(propertyData.availableFrom),
        leaseDuration: propertyData.leaseDuration,
        isFurnished: propertyData.isFurnished,
        utilitiesIncluded: propertyData.utilitiesIncluded || [],
        petPolicy: propertyData.petPolicy,
        smokingPolicy: propertyData.smokingPolicy,
        isAvailable: true,
      };
    } else if (isSaleRequest(propertyData)) {
      specificData = {
        salePrice: propertyData.salePrice,
        currency: propertyData.currency,
        originalPrice: propertyData.originalPrice,
        priceNegotiable: propertyData.priceNegotiable,
        mortgageAvailable: propertyData.mortgageAvailable,
        propertyCondition: propertyData.propertyCondition,
        ownershipType: propertyData.ownershipType,
        hoaFee: propertyData.hoaFee,
        hoaFrequency: propertyData.hoaFrequency,
        taxAmount: propertyData.taxAmount,
        taxYear: propertyData.taxYear,
        openHouseDates:
          propertyData.openHouseDates?.map((date) => new Date(date)) || [],
        offerDeadline: propertyData.offerDeadline
          ? new Date(propertyData.offerDeadline)
          : undefined,
        timeOnMarket: 0,
      };
    } else {
      throw new AppError('Invalid listing type', 400);
    }

    const finalPropertyData = { ...basePropertyData, ...specificData };

    try {
      const newProperty = await Property.create(finalPropertyData);
      return newProperty;
    } catch (error) {
      console.error('Mongoose Create Error:', error);
      throw new AppError('Failed to create property in database', 500);
    }
  }

  private _buildFilterQuery(
    filters: ParsedQs | IPropertyFilters
  ): Record<string, any> {
    const {
      listingType,
      propertyType,
      bedrooms,
      bathrooms,
      city,
      neighborhood,
      amenities,
      featured,
      isVerified,
      search,
      lat,
      lng,
      radius,
    } = filters as any;

    const query: Record<string, any> = { status: 'available' };

    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;

    if (filters.listingType === 'rent') {
      const rentalFilters = filters as any;
      if (rentalFilters.minRent !== undefined)
        query.rentPrice = { ...query.rentPrice, $gte: rentalFilters.minRent };
      if (rentalFilters.maxRent !== undefined)
        query.rentPrice = { ...query.rentPrice, $lte: rentalFilters.maxRent };
    } else if (filters.listingType === 'sale') {
      const saleFilters = filters as any;
      if (saleFilters.minPrice !== undefined)
        query.salePrice = { ...query.salePrice, $gte: saleFilters.minPrice };
      if (saleFilters.maxPrice !== undefined)
        query.salePrice = { ...query.salePrice, $lte: saleFilters.maxPrice };
    }

    if (bedrooms !== undefined) {
      if (typeof bedrooms === 'object') {
        if (bedrooms.min !== undefined)
          query.bedrooms = { ...query.bedrooms, $gte: bedrooms.min };
        if (bedrooms.max !== undefined)
          query.bedrooms = { ...query.bedrooms, $lte: bedrooms.max };
      } else {
        query.bedrooms = { $gte: bedrooms };
      }
    }

    if (bathrooms !== undefined) {
      if (typeof bathrooms === 'object') {
        if (bathrooms.min !== undefined)
          query.bathrooms = { ...query.bathrooms, $gte: bathrooms.min };
        if (bathrooms.max !== undefined)
          query.bathrooms = { ...query.bathrooms, $lte: bathrooms.max };
      } else {
        query.bathrooms = { $gte: bathrooms };
      }
    }

    if (city) query.city = new RegExp(city, 'i');
    if (neighborhood) query.neighborhood = new RegExp(neighborhood, 'i');
    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }
    if (featured !== undefined) query.featured = featured;
    if (isVerified !== undefined) query.isVerified = isVerified;

    if (listingType === 'rent') {
      if ((filters as any).minStay)
        query.minimumStay = { $gte: (filters as any).minStay };
      if ((filters as any).isFurnished !== undefined)
        query.isFurnished = (filters as any).isFurnished;
      if ((filters as any).petPolicy)
        query.petPolicy = (filters as any).petPolicy;
      if ((filters as any).availableFrom) {
        query.availableFrom = { $lte: new Date((filters as any).availableFrom) };
      }
    }

    if (listingType === 'sale') {
      if ((filters as any).propertyCondition) {
        query.propertyCondition = { $in: (filters as any).propertyCondition };
      }
      if ((filters as any).priceNegotiable !== undefined) {
        query.priceNegotiable = (filters as any).priceNegotiable;
      }
    }

    if (lat && lng && radius) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1],
        },
      };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { neighborhood: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    return query;
  }

  public async getProperties(
    queryString: ParsedQs
  ): Promise<IPropertySearchResult> {
    const page = parseInt(queryString.page as string, 10) || 1;
    const limit = parseInt(queryString.limit as string, 10) || 12;

    const filterQuery = this._buildFilterQuery(queryString);

    const findQuery = Property.find(filterQuery)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company');

    const countQuery = Property.countDocuments(filterQuery);

    const features = new QueryFeatures(findQuery, queryString)
      .sort()
      .limitFields()
      .paginate();

    const [properties, total] = await Promise.all([
      features.query.lean(),
      countQuery,
    ]);

    const transformedProperties = properties.map((property) =>
      this.transformProperty(property)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      properties: transformedProperties,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  public async getAllPropertiesForClient(): Promise<IPropertyResponseBase[]> {
    try {
      const properties = await Property.find({})
        .populate('owner', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .lean();

      return properties.map((property) => this.transformProperty(property));
    } catch (error) {
      throw new AppError('Failed to fetch properties', 500);
    }
  }

  public async getPropertyById(
    id: string
  ): Promise<IPropertyResponse | null> {
    const property = await Property.findById(id)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .populate('likes', 'name')
      .lean();

    if (!property) return null;

    return this.transformProperty(property);
  }

  public async getFeaturedProperties(
    limit: number = 6
  ): Promise<IPropertyResponse[]> {
    const properties = await Property.find({
      featured: true,
      status: 'available',
      isVerified: false,
    })
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return properties.map((property) => this.transformProperty(property));
  }

  public async getPropertiesByCity(
    city: string
  ): Promise<IPropertyResponse[]> {
    const properties = await Property.find({
      city: new RegExp(city, 'i'),
      status: 'available',
    })
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return properties.map((property) => this.transformProperty(property));
  }

  public async updateProperty(
    propertyId: string,
    userId: string,
    updateData: UpdatePropertyInput
  ): Promise<IProperty | null> {
    const property = await Property.findOne({
      _id: propertyId,
      owner: new Types.ObjectId(userId),
    });

    if (!property) {
      throw new AppError('Property not found or you are not the owner', 404);
    }

    const updatePayload: any = { ...updateData };

    if (
      'availableFrom' in updateData &&
      updateData.availableFrom &&
      typeof updateData.availableFrom === 'string'
    ) {
      updatePayload.availableFrom = new Date(updateData.availableFrom);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    return updatedProperty;
  }

  public async deleteProperty(
    propertyId: string,
    userId: string
  ): Promise<void> {
    const property = await Property.findOne({
      _id: propertyId,
      owner: new Types.ObjectId(userId),
    });

    if (!property) {
      throw new AppError('Property not found or you are not the owner', 404);
    }

    await Property.findByIdAndDelete(propertyId);
  }

  public async likeProperty(
    propertyId: string,
    userId: string
  ): Promise<{ liked: boolean }> {
    const property = await Property.findById(propertyId);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = property.likes.some(
      (likeId) => likeId.toString() === userObjectId.toString()
    );

    if (hasLiked) {
      await Property.findByIdAndUpdate(propertyId, {
        $pull: { likes: userObjectId },
      });
      return { liked: false };
    } else {
      await Property.findByIdAndUpdate(propertyId, {
        $addToSet: { likes: userObjectId },
      });
      return { liked: true };
    }
  }

  public async getUserProperties(
    userId: string,
    pageIn: number = 1,
    limitIn: number = 10
  ): Promise<IPropertySearchResult> {
    const queryString = {
      page: pageIn.toString(),
      limit: limitIn.toString(),
      sort: '-createdAt',
    } as ParsedQs;

    const filterQuery = { owner: new Types.ObjectId(userId) };

    const findQuery = Property.find(filterQuery)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company');

    const countQuery = Property.countDocuments(filterQuery);

    const features = new QueryFeatures(findQuery, queryString)
      .sort()
      .paginate();

    const [properties, total] = await Promise.all([
      features.query.lean(),
      countQuery,
    ]);

    const transformedProperties = properties.map((property) =>
      this.transformProperty(property)
    );

    const totalPages = Math.ceil(total / limitIn);

    return {
      properties: transformedProperties,
      total,
      page: pageIn,
      totalPages,
      hasNext: pageIn < totalPages,
      hasPrev: pageIn > 1,
    };
  }

  public async getAvailableFilters() {
    const [
      cities,
      neighborhoods,
      propertyTypes,
      listingTypes,
      bedOptions,
      amenities,
    ] = await Promise.all([
      Property.distinct('city'),
      Property.distinct('neighborhood'),
      Property.distinct('propertyType'),
      Property.distinct('listingType'),
      Property.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$bedrooms' } },
        { $sort: { _id: 1 } },
      ]),
      Property.aggregate([
        { $match: { status: 'available' } },
        { $unwind: '$amenities' },
        { $group: { _id: '$amenities' } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      cities: cities.filter(Boolean).sort(),
      neighborhoods: neighborhoods.filter(Boolean).sort(),
      propertyTypes: propertyTypes.filter(Boolean).sort(),
      listingTypes: listingTypes.filter(Boolean),
      bedOptions: bedOptions
        .map((b) => b._id)
        .filter((b) => b !== undefined && b !== null)
        .sort((a, b) => a - b),
      amenities: amenities.map((a) => a._id).filter(Boolean).sort(),
    };
  }

  private transformProperty(property: any): IPropertyResponse {
    const baseResponse = {
      id: property._id.toString(),
      title: property.title,
      description: property.description,
      listingType: property.listingType,
      propertyType: property.propertyType,
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood,
      state: property.state,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
      zipCode: property.zipCode,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSize: property.areaSize,
      areaUnit: property.areaUnit,
      yearBuilt: property.yearBuilt,
      lotSize: property.lotSize,
      lotUnit: property.lotUnit,
      amenities: property.amenities || [],
      images: property.images || [],
      videos: property.videos || [],
      virtualTour: property.virtualTour,
      floorPlans: property.floorPlans || [],
      status: property.status,
      featured: property.featured,
      isVerified: property.isVerified,
      tags: property.tags || [],
      owner: {
        id: property.owner?._id?.toString() || property.owner?.toString(),
        name: property.owner?.name || 'Unknown',
        email: property.owner?.email || '',
        phone: property.owner?.phone,
        avatar: property.owner?.avatar,
      },
      agent: property.agent
        ? {
          id: property.agent._id.toString(),
          name: property.agent.name,
          email: property.agent.email,
          phone: property.agent.phone,
          avatar: property.agent.avatar,
          company: property.agent.company,
        }
        : undefined,
      views: property.views || 0,
      likes: property.likes
        ? property.likes.map((like: any) =>
          like._id?.toString() || like.toString()
        )
        : [],
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      isNew: this.isNewListing(property.createdAt),
    };

    if (property.listingType === 'rent') {
      const rentalResponse: IRentalPropertyResponse = {
        ...baseResponse,
        listingType: 'rent',
        rentPrice: property.rentPrice,
        currency: property.currency || 'USD',
        securityDeposit: property.securityDeposit,
        utilityDeposit: property.utilityDeposit,
        maintenanceFee: property.maintenanceFee,
        minimumStay: property.minimumStay,
        maximumStay: property.maximumStay,
        availableFrom:
          property.availableFrom?.toISOString() || new Date().toISOString(),
        leaseDuration: property.leaseDuration,
        isFurnished: property.isFurnished || false,
        utilitiesIncluded: property.utilitiesIncluded || [],
        petPolicy: property.petPolicy || 'not-allowed',
        smokingPolicy: property.smokingPolicy || 'not-allowed',
        isAvailable:
          property.isAvailable !== undefined ? property.isAvailable : true,
        lastRented: property.lastRented?.toISOString(),
      };
      return rentalResponse;
    } else {
      const saleResponse: ISalePropertyResponse = {
        ...baseResponse,
        listingType: 'sale',
        salePrice: property.salePrice,
        currency: property.currency || 'USD',
        originalPrice: property.originalPrice,
        priceNegotiable:
          property.priceNegotiable !== undefined
            ? property.priceNegotiable
            : true,
        mortgageAvailable:
          property.mortgageAvailable !== undefined
            ? property.mortgageAvailable
            : false,
        propertyCondition: property.propertyCondition || 'good',
        ownershipType: property.ownershipType || 'freehold',
        hoaFee: property.hoaFee,
        hoaFrequency: property.hoaFrequency,
        taxAmount: property.taxAmount,
        taxYear: property.taxYear,
        timeOnMarket: property.timeOnMarket || 0,
        openHouseDates:
          property.openHouseDates?.map((date: Date) => date.toISOString()) ||
          [],
        offerDeadline: property.offerDeadline?.toISOString(),
      };
      return saleResponse;
    }
  }

  private isNewListing(createdAt: Date, days = 7): boolean {
    const ageDays =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= days;
  }
}

export const propertyService = new PropertyService();