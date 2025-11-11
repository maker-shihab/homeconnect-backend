// src/modules/dashboard/dashborad.interface.ts

import { Document, Types } from 'mongoose';

// ---------------
// Activity Log
// ---------------
export type TActivityAction =
  | 'user_registered'
  | 'user_login'
  | 'property_created'
  | 'property_updated'
  | 'property_deleted'
  | 'property_liked'
  | 'property_viewed'
  | 'maintenance_requested'
  | 'maintenance_status_changed'
  | 'rent_payment_received'
  | 'message_sent';

export interface IActivity extends Document {
  user: Types.ObjectId;
  action: TActivityAction;
  message: string;
  entityId: Types.ObjectId;
  entityModel: 'Property' | 'User' | 'MaintenanceRequest' | 'Payment';
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityResponse {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: TActivityAction;
  message: string;
  entityId: string;
  entityModel: 'Property' | 'User' | 'MaintenanceRequest' | 'Payment';
  createdAt: string;
}

// ---------------------
// Maintenance Request
// ---------------------
export type TMaintenanceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type TMaintenancePriority = 'low' | 'medium' | 'high';

export interface IMaintenanceRequest extends Document {
  _id: Types.ObjectId;
  property: Types.ObjectId;
  tenant: Types.ObjectId;
  title: string;
  description: string;
  status: TMaintenanceStatus;
  priority: TMaintenancePriority;
  images?: string[];
  reportedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMaintenanceRequest {
  property: string; // Property ID
  title: string;
  description: string;
  priority: TMaintenancePriority;
  images?: string[];
}

export interface IUpdateMaintenanceRequest {
  status?: TMaintenanceStatus;
  priority?: TMaintenancePriority;
}

export interface IMaintenanceRequestResponse {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
  };
  tenant: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  description: string;
  status: TMaintenanceStatus;
  priority: TMaintenancePriority;
  images?: string[];
  reportedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface IMaintenanceFilters {
  status?: TMaintenanceStatus;
  priority?: TMaintenancePriority;
  propertyId?: string;
  tenantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// -----------------
// Dashboard Overview
// -----------------
export interface IDashboardStats {
  totalProperties: number;
  totalPropertiesForRent: number;
  totalPropertiesForSale: number;
  occupiedProperties: number;
  totalUsers: number;
  totalLandlords: number;
  pendingMaintenance: number;
  totalRevenue: number;
}

export interface IDashboardOverviewResponse {
  stats: IDashboardStats;
  recentActivity: IActivityResponse[];
  pendingMaintenanceRequests: IMaintenanceRequestResponse[];
}