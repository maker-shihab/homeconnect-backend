import { Types } from 'mongoose';
import { AppError } from '../../shared/utils/AppError';
import { uploadService } from '../upload/upload.service';
import {
  ICreatePropertyRequest,
  IProperty,
  IPropertyFilters,
  IPropertyResponse,
  IPropertySearchResult,
  IRentalPropertyResponse,
  ISalePropertyResponse,
  isRentalRequest,
  isSaleRequest
} from './property.interface';
import { Property } from './property.model';
import { PropertyFiltersInput, UpdatePropertyInput } from './property.validation';

export class PropertyService {

  async createProperty(
    userId: string,
    propertyData: ICreatePropertyRequest,
    files?: Express.Multer.File[]
  ): Promise<IProperty> {
    try {
      let imageUrls: string[] = [];

      // Upload images to Cloudinary if files are provided
      if (files && files.length > 0) {
        try {
          console.log('🔄 Attempting to upload images to Cloudinary...');
          const uploadResults = await uploadService.uploadMultipleImages(files, 'properties');
          imageUrls = uploadResults.map(result => result.url);
          console.log('✅ Cloudinary upload successful');
        } catch (uploadError) {
          console.error('❌ Cloudinary upload failed:', uploadError);
          // Don't throw error - just continue without images
          console.log('🔄 Continuing without images due to upload failure');
        }
      }

      // If no images uploaded, use empty array (property can be created without images)
      console.log('🔍 Final images array:', imageUrls);

      // Prepare base property data
      const basePropertyData = {
        title: propertyData.title,
        description: propertyData.description,
        propertyType: propertyData.propertyType,
        address: propertyData.address,
        city: propertyData.city,
        neighborhood: propertyData.neighborhood,
        state: propertyData.state,
        country: propertyData.country,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        zipCode: propertyData.zipCode,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        areaSize: propertyData.areaSize,
        areaUnit: propertyData.areaUnit,
        yearBuilt: propertyData.yearBuilt,
        lotSize: propertyData.lotSize,
        lotUnit: propertyData.lotUnit,
        amenities: propertyData.amenities,
        images: imageUrls, // This can be empty array now
        videos: propertyData.videos || [],
        virtualTour: propertyData.virtualTour,
        floorPlans: propertyData.floorPlans || [],
        tags: propertyData.tags || [],
        owner: new Types.ObjectId(userId),
        agent: propertyData.agent ? new Types.ObjectId(propertyData.agent) : undefined,
        managementCompany: propertyData.managementCompany,
        status: 'available' as const,
        featured: false,
        isVerified: false,
        views: 0,
        likes: [],
        savedBy: []
      };

      // Handle rental-specific data
      if (isRentalRequest(propertyData)) {
        const rentalProperty = await Property.create({
          ...basePropertyData,
          listingType: 'rent' as const,
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
          isAvailable: true
        });

        console.log('✅ Rental property created successfully');
        return rentalProperty;
      }
      // Handle sale-specific data
      else if (isSaleRequest(propertyData)) {
        const saleProperty = await Property.create({
          ...basePropertyData,
          listingType: 'sale' as const,
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
          openHouseDates: propertyData.openHouseDates?.map(date => new Date(date)) || [],
          offerDeadline: propertyData.offerDeadline ? new Date(propertyData.offerDeadline) : undefined,
          timeOnMarket: 0
        });

        console.log('✅ Sale property created successfully');
        return saleProperty;
      } else {
        throw new AppError('Invalid listing type', 400);
      }
    } catch (error) {
      console.error('❌ Error creating property:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create property', 500);
    }
  }
  async getProperties(filters: IPropertyFilters | PropertyFiltersInput = {} as IPropertyFilters): Promise<IPropertySearchResult> {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      lat,
      lng,
      radius
    } = filters;

    // Build query
    const query: any = { status: 'available' };

    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;

    // Price filters based on listing type
    if (filters.listingType === 'rent') {
      const rentalFilters = filters; // Type is now narrowed to IRentalFilters
      if (rentalFilters.minRent !== undefined) query.rentPrice = { ...query.rentPrice, $gte: rentalFilters.minRent };
      if (rentalFilters.maxRent !== undefined) query.rentPrice = { ...query.rentPrice, $lte: rentalFilters.maxRent };
    } else if (filters.listingType === 'sale') {
      const saleFilters = filters; // Type is now narrowed to ISaleFilters
      if (saleFilters.minPrice !== undefined) query.salePrice = { ...query.salePrice, $gte: saleFilters.minPrice };
      if (saleFilters.maxPrice !== undefined) query.salePrice = { ...query.salePrice, $lte: saleFilters.maxPrice };
    }

    if (bedrooms !== undefined) {
      if (typeof bedrooms === 'object') {
        if (bedrooms.min !== undefined) query.bedrooms = { ...query.bedrooms, $gte: bedrooms.min };
        if (bedrooms.max !== undefined) query.bedrooms = { ...query.bedrooms, $lte: bedrooms.max };
      } else {
        query.bedrooms = { $gte: bedrooms };
      }
    }

    if (bathrooms !== undefined) {
      if (typeof bathrooms === 'object') {
        if (bathrooms.min !== undefined) query.bathrooms = { ...query.bathrooms, $gte: bathrooms.min };
        if (bathrooms.max !== undefined) query.bathrooms = { ...query.bathrooms, $lte: bathrooms.max };
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

    // Rental-specific filters
    if (listingType === 'rent') {
      if ((filters as any).minStay) query.minimumStay = { $gte: (filters as any).minStay };
      if ((filters as any).isFurnished !== undefined) query.isFurnished = (filters as any).isFurnished;
      if ((filters as any).petPolicy) query.petPolicy = (filters as any).petPolicy;
      if ((filters as any).availableFrom) {
        query.availableFrom = { $lte: new Date((filters as any).availableFrom) };
      }
    }

    // Sale-specific filters
    if (listingType === 'sale') {
      if ((filters as any).propertyCondition) {
        query.propertyCondition = { $in: (filters as any).propertyCondition };
      }
      if ((filters as any).priceNegotiable !== undefined) {
        query.priceNegotiable = (filters as any).priceNegotiable;
      }
    }

    // Geospatial query
    if (lat && lng && radius) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1] // Convert km to radians
        }
      };
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { neighborhood: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sort: any = {};
    if (sortBy === 'price') {
      sort[listingType === 'rent' ? 'rentPrice' : 'salePrice'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query
    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name email phone avatar')
        .populate('agent', 'name email phone avatar company')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query)
    ]);

    // Transform properties
    const transformedProperties = properties.map(property =>
      this.transformProperty(property)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      properties: transformedProperties,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async getPropertyById(id: string): Promise<IPropertyResponse | null> {
    const property = await Property.findById(id)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .populate('likes', 'name')
      .lean();

    if (!property) return null;

    // Increment views
    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return this.transformProperty(property);
  }

  async getFeaturedProperties(limit: number = 6): Promise<IPropertyResponse[]> {
    const properties = await Property.find({
      featured: true,
      status: 'available',
      isVerified: true
    })
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return properties.map(property => this.transformProperty(property));
  }

  async getPropertiesByCity(city: string): Promise<IPropertyResponse[]> {
    const properties = await Property.find({
      city: new RegExp(city, 'i'),
      status: 'available'
    })
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar company')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return properties.map(property => this.transformProperty(property));
  }

  async updateProperty(
    propertyId: string,
    userId: string,
    updateData: UpdatePropertyInput
  ): Promise<IProperty | null> {
    const property = await Property.findOne({ _id: propertyId, owner: new Types.ObjectId(userId) });

    if (!property) {
      throw new AppError('Property not found or you are not the owner', 404);
    }

    // Handle different update data based on property type
    const updatePayload: any = { ...updateData };

    // Convert dates if present
    if ('availableFrom' in updateData && updateData.availableFrom && typeof updateData.availableFrom === 'string') {
      updatePayload.availableFrom = new Date(updateData.availableFrom);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    return updatedProperty;
  }

  async deleteProperty(propertyId: string, userId: string): Promise<void> {
    const property = await Property.findOne({
      _id: propertyId,
      owner: new Types.ObjectId(userId)
    });

    if (!property) {
      throw new AppError('Property not found or you are not the owner', 404);
    }

    await Property.findByIdAndDelete(propertyId);
  }

  async likeProperty(propertyId: string, userId: string): Promise<{ liked: boolean }> {
    const property = await Property.findById(propertyId);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = property.likes.some(likeId =>
      likeId.toString() === userObjectId.toString()
    );

    if (hasLiked) {
      // Unlike
      await Property.findByIdAndUpdate(propertyId, {
        $pull: { likes: userObjectId }
      });
      return { liked: false };
    } else {
      // Like
      await Property.findByIdAndUpdate(propertyId, {
        $addToSet: { likes: userObjectId }
      });
      return { liked: true };
    }
  }

  async getUserProperties(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IPropertySearchResult> {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find({ owner: new Types.ObjectId(userId) })
        .populate('owner', 'name email phone avatar')
        .populate('agent', 'name email phone avatar company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments({ owner: new Types.ObjectId(userId) })
    ]);

    const transformedProperties = properties.map(property =>
      this.transformProperty(property)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      properties: transformedProperties,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async getAvailableFilters() {
    const [cities, neighborhoods, propertyTypes, listingTypes, bedOptions, amenities] = await Promise.all([
      Property.distinct('city'),
      Property.distinct('neighborhood'),
      Property.distinct('propertyType'),
      Property.distinct('listingType'),
      Property.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$bedrooms' } },
        { $sort: { _id: 1 } }
      ]),
      Property.aggregate([
        { $match: { status: 'available' } },
        { $unwind: '$amenities' },
        { $group: { _id: '$amenities' } },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      cities: cities.filter(Boolean).sort(),
      neighborhoods: neighborhoods.filter(Boolean).sort(),
      propertyTypes: propertyTypes.filter(Boolean).sort(),
      listingTypes: listingTypes.filter(Boolean),
      bedOptions: bedOptions.map(b => b._id).filter(b => b !== undefined && b !== null).sort((a, b) => a - b),
      amenities: amenities.map(a => a._id).filter(Boolean).sort()
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
        avatar: property.owner?.avatar
      },
      agent: property.agent ? {
        id: property.agent._id.toString(),
        name: property.agent.name,
        email: property.agent.email,
        phone: property.agent.phone,
        avatar: property.agent.avatar,
        company: property.agent.company
      } : undefined,
      views: property.views || 0,
      likes: property.likes ? property.likes.map((like: any) =>
        like._id?.toString() || like.toString()
      ) : [],
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      isNew: this.isNewListing(property.createdAt)
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
        availableFrom: property.availableFrom?.toISOString() || new Date().toISOString(),
        leaseDuration: property.leaseDuration,
        isFurnished: property.isFurnished || false,
        utilitiesIncluded: property.utilitiesIncluded || [],
        petPolicy: property.petPolicy || 'not-allowed',
        smokingPolicy: property.smokingPolicy || 'not-allowed',
        isAvailable: property.isAvailable !== undefined ? property.isAvailable : true,
        lastRented: property.lastRented?.toISOString()
      };
      return rentalResponse;
    } else {
      const saleResponse: ISalePropertyResponse = {
        ...baseResponse,
        listingType: 'sale',
        salePrice: property.salePrice,
        currency: property.currency || 'USD',
        originalPrice: property.originalPrice,
        priceNegotiable: property.priceNegotiable !== undefined ? property.priceNegotiable : true,
        mortgageAvailable: property.mortgageAvailable !== undefined ? property.mortgageAvailable : false,
        propertyCondition: property.propertyCondition || 'good',
        ownershipType: property.ownershipType || 'freehold',
        hoaFee: property.hoaFee,
        hoaFrequency: property.hoaFrequency,
        taxAmount: property.taxAmount,
        taxYear: property.taxYear,
        timeOnMarket: property.timeOnMarket || 0,
        openHouseDates: property.openHouseDates?.map((date: Date) => date.toISOString()) || [],
        offerDeadline: property.offerDeadline?.toISOString()
      };
      return saleResponse;
    }
  }

  private isNewListing(createdAt: Date, days = 7): boolean {
    const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= days;
  }
}

export const propertyService = new PropertyService();