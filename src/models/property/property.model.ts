import { model, Schema, Types } from 'mongoose';
import { IProperty } from './property.interface';

const PropertySchema = new Schema<IProperty>(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters long'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: {
        values: ['rent', 'sale'],
        message: 'Listing type must be either rent or sale'
      }
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['apartment', 'house', 'condo', 'villa', 'townhouse', 'studio', 'land', 'commercial'],
        message: 'Invalid property type'
      }
    },

    // Location
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [10, 'Address must be at least 10 characters long'],
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters long'],
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    neighborhood: {
      type: String,
      required: [true, 'Neighborhood is required'],
      trim: true,
      minlength: [2, 'Neighborhood must be at least 2 characters long'],
      maxlength: [100, 'Neighborhood cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      minlength: [2, 'State must be at least 2 characters long'],
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'US',
      minlength: [2, 'Country must be at least 2 characters long'],
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },

    // Specifications
    bedrooms: {
      type: Number,
      required: [true, 'Bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      max: [50, 'Bedrooms cannot exceed 50']
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
      max: [50, 'Bathrooms cannot exceed 50']
    },
    areaSize: {
      type: Number,
      required: [true, 'Area size is required'],
      min: [1, 'Area size must be positive'],
      max: [1000000, 'Area size seems too large']
    },
    areaUnit: {
      type: String,
      required: [true, 'Area unit is required'],
      enum: {
        values: ['sqft', 'sqm', 'acres', 'hectares'],
        message: 'Invalid area unit'
      },
      default: 'sqft'
    },
    yearBuilt: {
      type: Number,
      min: [1800, 'Year built seems too old'],
      max: [new Date().getFullYear() + 1, 'Year built cannot be in the future']
    },
    lotSize: {
      type: Number,
      min: [1, 'Lot size must be positive'],
      max: [10000000, 'Lot size seems too large']
    },
    lotUnit: {
      type: String,
      enum: {
        values: ['sqft', 'sqm', 'acres', 'hectares'],
        message: 'Invalid lot unit'
      }
    },

    // Rental Specific Fields
    rentPrice: {
      type: Number,
      min: [0, 'Rent price cannot be negative'],
      max: [1000000, 'Rent price seems too high'],
      required: function (this: any): boolean {
        return this.listingType === 'rent';
      }
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
      max: [1000000, 'Security deposit seems too high']
    },
    utilityDeposit: {
      type: Number,
      min: [0, 'Utility deposit cannot be negative'],
      max: [100000, 'Utility deposit seems too high']
    },
    maintenanceFee: {
      type: Number,
      min: [0, 'Maintenance fee cannot be negative'],
      max: [10000, 'Maintenance fee seems too high']
    },
    minimumStay: {
      type: Number,
      min: [1, 'Minimum stay must be at least 1 month'],
      max: [60, 'Minimum stay cannot exceed 60 months'],
      default: 12,
      required: function (this: any): boolean {
        return this.listingType === 'rent';
      }
    },
    maximumStay: {
      type: Number,
      min: [1, 'Maximum stay must be at least 1 month'],
      max: [120, 'Maximum stay cannot exceed 120 months']
    },
    availableFrom: {
      type: Date,
      required: function (this: any): boolean {
        return this.listingType === 'rent';
      }
    },
    leaseDuration: {
      type: Number,
      min: [1, 'Lease duration must be at least 1 month'],
      max: [120, 'Lease duration cannot exceed 120 months']
    },
    isFurnished: {
      type: Boolean,
      default: false
    },
    utilitiesIncluded: [{
      type: String,
      trim: true
    }],
    petPolicy: {
      type: String,
      enum: {
        values: ['allowed', 'not-allowed', 'case-by-case'],
        message: 'Invalid pet policy'
      },
      default: 'not-allowed'
    },
    smokingPolicy: {
      type: String,
      enum: {
        values: ['allowed', 'not-allowed'],
        message: 'Invalid smoking policy'
      },
      default: 'not-allowed'
    },
    isAvailable: {
      type: Boolean,
      default: true,
      required: function (this: any): boolean {
        return this.listingType === 'rent';
      }
    },
    lastRented: {
      type: Date
    },

    // Sale Specific Fields
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      max: [100000000, 'Sale price seems too high'],
      required: function (this: any): boolean {
        return this.listingType === 'sale';
      }
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      max: [100000000, 'Original price seems too high']
    },
    priceNegotiable: {
      type: Boolean,
      default: true
    },
    mortgageAvailable: {
      type: Boolean,
      default: false
    },
    propertyCondition: {
      type: String,
      enum: {
        values: ['excellent', 'good', 'needs-renovation', 'new-construction'],
        message: 'Invalid property condition'
      },
      required: function (this: any): boolean {
        return this.listingType === 'sale';
      }
    },
    ownershipType: {
      type: String,
      enum: {
        values: ['freehold', 'leasehold', 'condominium'],
        message: 'Invalid ownership type'
      },
      required: function (this: any): boolean {
        return this.listingType === 'sale';
      }
    },
    hoaFee: {
      type: Number,
      min: [0, 'HOA fee cannot be negative'],
      max: [10000, 'HOA fee seems too high']
    },
    hoaFrequency: {
      type: String,
      enum: {
        values: ['monthly', 'quarterly', 'yearly'],
        message: 'Invalid HOA frequency'
      }
    },
    taxAmount: {
      type: Number,
      min: [0, 'Tax amount cannot be negative'],
      max: [100000, 'Tax amount seems too high']
    },
    taxYear: {
      type: Number,
      min: [2000, 'Tax year seems too old'],
      max: [new Date().getFullYear() + 1, 'Tax year cannot be in the future']
    },
    timeOnMarket: {
      type: Number,
      default: 0,
      min: [0, 'Time on market cannot be negative']
    },
    openHouseDates: [{
      type: Date
    }],
    offerDeadline: {
      type: Date
    },

    // Features & Media
    amenities: [{
      type: String,
      trim: true
    }],
    images: [{
      type: String,
      default: []
    }],
    videos: [{
      type: String
    }],
    virtualTour: {
      type: String
    },
    floorPlans: [{
      type: String
    }],

    // Property Status
    status: {
      type: String,
      enum: {
        values: ['available', 'pending', 'sold', 'rented', 'maintenance', 'unavailable'],
        message: 'Invalid status'
      },
      default: 'available'
    },
    featured: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }],

    // Ownership & Management
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    managementCompany: {
      type: String,
      trim: true,
      maxlength: [200, 'Management company name cannot exceed 200 characters']
    },

    // Engagement
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    savedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        if ('_id' in ret) {
          delete (ret as any)._id;
        }
        if ('__v' in ret) {
          delete (ret as any).__v;
        }
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        if ('_id' in ret) {
          delete (ret as any)._id;
        }
        if ('__v' in ret) {
          delete (ret as any).__v;
        }
        return ret;
      }
    }
  }
);

// Indexes for better query performance
PropertySchema.index({ listingType: 1, status: 1 });
PropertySchema.index({ city: 1, neighborhood: 1 });
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ price: 1 });
PropertySchema.index({ rentPrice: 1 });
PropertySchema.index({ salePrice: 1 });
PropertySchema.index({ bedrooms: 1, bathrooms: 1 });
PropertySchema.index({ owner: 1 });
PropertySchema.index({ featured: -1, createdAt: -1 });
PropertySchema.index({ isVerified: 1 });
PropertySchema.index({ availableFrom: 1 });
PropertySchema.index({ status: 1, createdAt: -1 });

// Virtual for location (for geo queries)
PropertySchema.virtual('location').get(function () {
  return {
    type: 'Point',
    coordinates: [this.longitude, this.latitude]
  };
});

// Virtual for currency (common field)
PropertySchema.virtual('currency').get(function () {
  return 'USD'; // Default currency, can be customized
});

// Pre-save middleware to calculate timeOnMarket
PropertySchema.pre('save', function (next) {
  if (this.listingType === 'sale' && this.isNew) {
    this.timeOnMarket = 0;
  }
  next();
});

// Method to check if property is rental
PropertySchema.methods.isRental = function (): boolean {
  return this.listingType === 'rent';
};

// Method to check if property is for sale
PropertySchema.methods.isForSale = function (): boolean {
  return this.listingType === 'sale';
};

// Static method to find featured properties
PropertySchema.statics.findFeatured = function (limit = 10) {
  return this.find({ featured: true, status: 'available' })
    .limit(limit)
    .populate('owner', 'name email phone avatar')
    .populate('agent', 'name email phone avatar company');
};

// Static method to find properties by owner
PropertySchema.statics.findByOwner = function (ownerId: Types.ObjectId) {
  return this.find({ owner: ownerId })
    .populate('owner', 'name email phone avatar')
    .sort({ createdAt: -1 });
};

// Static method for geographic search
PropertySchema.statics.findNearby = function (lng: number, lat: number, radius: number, limit = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000
      }
    },
    status: 'available'
  }).limit(limit);
};

export const Property = model<IProperty>('Property', PropertySchema);
export default Property;