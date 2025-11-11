// dashborad.model.ts

import { model, Schema } from 'mongoose';
import { IActivity, IMaintenanceRequest } from './dashboard.interface';

// -----------------
// Activity Schema
// -----------------
const ActivitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityModel: {
      type: String,
      required: true,
      enum: ['Property', 'User', 'MaintenanceRequest', 'Payment'],
    },
  },
  {
    timestamps: true,
  },
);

export const Activity = model<IActivity>('Activity', ActivitySchema);

// --------------------------
// Maintenance Request Schema
// --------------------------
const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
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
      },
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
      },
    },
  },
);

// Pre-save middleware to update completedAt
MaintenanceRequestSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

export const MaintenanceRequest = model<IMaintenanceRequest>(
  'MaintenanceRequest',
  MaintenanceRequestSchema,
);