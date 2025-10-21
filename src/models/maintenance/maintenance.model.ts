// modules/maintenance/maintenance.model.ts
import { Document, Schema, model } from 'mongoose';

export interface IMaintenance {
  _id?: string;
  property: string;
  reportedBy: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  images?: string[];
  scheduledDate?: Date;
  completedDate?: Date;
  cost?: number;
  assignedTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMaintenanceDocument extends IMaintenance, Document { }

const maintenanceSchema = new Schema<IMaintenanceDocument>({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported by user is required'],
  },
  title: {
    type: String,
    required: [true, 'Maintenance title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  images: [String],
  scheduledDate: Date,
  completedDate: Date,
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
maintenanceSchema.index({ property: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ createdAt: -1 });

export const Maintenance = model<IMaintenanceDocument>('Maintenance', maintenanceSchema);