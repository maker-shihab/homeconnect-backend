// src/modules/dashboard/dashborad.services.ts

import { Types } from 'mongoose';
import { AppError } from '../../shared/utils/AppError';
import Property from '../property/property.model';
import { User } from '../user/user.models';
import {
  IActivity,
  IActivityResponse,
  IDashboardOverviewResponse,
  IDashboardStats,
  IMaintenanceFilters,
  IMaintenanceRequest,
  IMaintenanceRequestResponse,
  TActivityAction,
} from './dashboard.interface';
import { Activity, MaintenanceRequest } from './dashboard.model';
import {
  ActivityFiltersInput,
  CreateMaintenanceRequestInput,
  UpdateMaintenanceRequestInput,
} from './dashboard.validation';

export type TUserRole = 'tenant' | 'landlord' | 'admin' | 'support';

export class DashboardService {
  // -----------------
  // OVERVIEW
  // -----------------
  async getDashboardOverview(
    userId: string,
    userRole: TUserRole,
  ): Promise<IDashboardOverviewResponse> {
    if (userRole === 'admin') {
      return this.getAdminDashboardOverview();
    } else if (userRole === 'landlord') {
      return this.getLandlordDashboardOverview(userId);
    } else if (userRole === 'tenant') {
      return this.getTenantDashboardOverview(userId);
    } else {
      return this.getSupportDashboardOverview();
    }
  }

  private async getAdminDashboardOverview(): Promise<IDashboardOverviewResponse> {
    const [
      totalProperties,
      totalPropertiesForRent,
      totalPropertiesForSale,
      occupiedProperties,
      totalUsers,
      totalLandlords,
      pendingMaintenanceCount,
      recentActivity,
      pendingMaintenanceRequests,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ listingType: 'rent' }),
      Property.countDocuments({ listingType: 'sale' }),
      Property.countDocuments({ status: 'rented' }),
      User.countDocuments(),
      User.countDocuments({ role: 'landlord' }),
      MaintenanceRequest.countDocuments({ status: 'pending' }),
      this.getActivities({ page: 1, limit: 10 }),
      this.getMaintenanceRequests({ status: 'pending', page: 1, limit: 5 }),
    ]);

    const stats: IDashboardStats = {
      totalProperties,
      totalPropertiesForRent,
      totalPropertiesForSale,
      occupiedProperties,
      totalUsers,
      totalLandlords: totalLandlords,
      pendingMaintenance: pendingMaintenanceCount,
      totalRevenue: 0,
    };

    return {
      stats,
      recentActivity: recentActivity.activities,
      pendingMaintenanceRequests: pendingMaintenanceRequests.requests,
    };
  }

  private async getLandlordDashboardOverview(
    userId: string,
  ): Promise<IDashboardOverviewResponse> {
    const landlordId = new Types.ObjectId(userId);

    const [
      totalProperties,
      totalPropertiesForRent,
      totalPropertiesForSale,
      occupiedProperties,
      pendingMaintenanceCount,
      recentActivity,
      pendingMaintenanceRequests,
    ] = await Promise.all([
      Property.countDocuments({ owner: landlordId }),
      Property.countDocuments({ owner: landlordId, listingType: 'rent' }),
      Property.countDocuments({ owner: landlordId, listingType: 'sale' }),
      Property.countDocuments({ owner: landlordId, status: 'rented' }),
      MaintenanceRequest.countDocuments({
        property: {
          $in: await Property.find({ owner: landlordId }).distinct('_id'),
        },
        status: 'pending',
      }),
      this.getActivities({ userId: userId, page: 1, limit: 10 }),
      this.getMaintenanceRequests({
        status: 'pending',
        page: 1,
        limit: 5,
      }),
    ]);

    const stats: IDashboardStats = {
      totalProperties,
      totalPropertiesForRent,
      totalPropertiesForSale,
      occupiedProperties,
      totalUsers: 0,
      totalLandlords: 0,
      pendingMaintenance: pendingMaintenanceCount,
      totalRevenue: 0,
    };

    return {
      stats,
      recentActivity: recentActivity.activities,
      pendingMaintenanceRequests: pendingMaintenanceRequests.requests,
    };
  }

  private async getTenantDashboardOverview(
    userId: string,
  ): Promise<IDashboardOverviewResponse> {
    const [myMaintenanceRequests, myActivity] = await Promise.all([
      this.getMaintenanceRequests({ tenantId: userId, page: 1, limit: 5 }),
      this.getActivities({ userId: userId, page: 1, limit: 10 }),
    ]);

    const stats: IDashboardStats = {
      totalProperties: 0,
      totalPropertiesForRent: 0,
      totalPropertiesForSale: 0,
      occupiedProperties: 0,
      totalUsers: 0,
      totalLandlords: 0,
      pendingMaintenance: myMaintenanceRequests.total,
      totalRevenue: 0,
    };

    return {
      stats,
      recentActivity: myActivity.activities,
      pendingMaintenanceRequests: myMaintenanceRequests.requests,
    };
  }

  private async getSupportDashboardOverview(): Promise<IDashboardOverviewResponse> {
    const [pendingMaintenanceCount, pendingMaintenanceRequests] =
      await Promise.all([
        MaintenanceRequest.countDocuments({ status: 'pending' }),
        this.getMaintenanceRequests({ status: 'pending', page: 1, limit: 10 }),
      ]);

    const stats: IDashboardStats = {
      totalProperties: 0,
      totalPropertiesForRent: 0,
      totalPropertiesForSale: 0,
      occupiedProperties: 0,
      totalUsers: 0,
      totalLandlords: 0,
      pendingMaintenance: pendingMaintenanceCount,
      totalRevenue: 0,
    };

    return {
      stats,
      recentActivity: [],
      pendingMaintenanceRequests: pendingMaintenanceRequests.requests,
    };
  }

  // -----------------
  // ACTIVITY
  // -----------------

  async createActivity(
    user: Types.ObjectId,
    action: TActivityAction,
    entityId: Types.ObjectId,
    entityModel: 'Property' | 'User' | 'MaintenanceRequest' | 'Payment',
    message: string,
  ): Promise<IActivity> {
    const activity = await Activity.create({
      user,
      action,
      entityId,
      entityModel,
      message,
    });
    return activity;
  }

  async getActivities(
    filters: ActivityFiltersInput,
  ): Promise<{ activities: IActivityResponse[]; total: number; totalPages: number }> {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      entityId,
      entityModel,
    } = filters;
    const query: any = {};

    if (action) query.action = action;
    if (userId) query.user = new Types.ObjectId(userId);
    if (entityId) query.entityId = new Types.ObjectId(entityId);
    if (entityModel) query.entityModel = entityModel;

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      activities: activities.map(this.transformActivity),
      total,
      totalPages,
    };
  }

  // -----------------
  // MAINTENANCE
  // -----------------

  async createMaintenanceRequest(
    tenantId: string,
    data: CreateMaintenanceRequestInput,
  ): Promise<IMaintenanceRequest> {
    const { property: propertyId, title, description, priority } = data;

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const request = await MaintenanceRequest.create({
      property: new Types.ObjectId(propertyId),
      tenant: new Types.ObjectId(tenantId),
      title,
      description,
      priority,
      reportedAt: new Date(),
    });

    await createActivityLog(
      new Types.ObjectId(tenantId),
      'maintenance_requested',
      request._id,
      'MaintenanceRequest',
      `New maintenance request: "${title}"`,
    );

    return request;
  }

  async getMaintenanceRequests(
    filters: IMaintenanceFilters,
  ): Promise<{
    requests: IMaintenanceRequestResponse[];
    total: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      propertyId,
      tenantId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (propertyId) query.property = new Types.ObjectId(propertyId);
    if (tenantId) query.tenant = new Types.ObjectId(tenantId);

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(query)
        .populate('property', 'title address')
        .populate('tenant', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      MaintenanceRequest.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      requests: requests.map(this.transformMaintenanceRequest),
      total,
      totalPages,
    };
  }

  async updateMaintenanceRequest(
    requestId: string,
    data: UpdateMaintenanceRequestInput,
    userId: string,
    userRole: TUserRole,
  ): Promise<IMaintenanceRequest | null> {
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    if (userRole !== 'admin') {
      const property = await Property.findById(request.property);
      if (property?.owner.toString() !== userId) {
        throw new AppError('You are not authorized to update this request', 403);
      }
    }

    const oldStatus = request.status;
    const { status, priority } = data;
    if (status) request.status = status;
    if (priority) request.priority = priority;

    await request.save();

    if (status && status !== oldStatus) {
      await createActivityLog(
        new Types.ObjectId(userId),
        'maintenance_status_changed',
        request._id,
        'MaintenanceRequest',
        `Maintenance status changed to ${status}`,
      );
    }

    return request;
  }

  // -----------------
  // TRANSFORMERS
  // -----------------
  private transformActivity(activity: any): IActivityResponse {
    return {
      id: activity._id.toString(),
      user: {
        id: activity.user?._id?.toString() || activity.user.toString(),
        name: activity.user?.name || 'System',
        avatar: activity.user?.avatar,
      },
      action: activity.action,
      message: activity.message,
      entityId: activity.entityId.toString(),
      entityModel: activity.entityModel,
      createdAt: activity.createdAt.toISOString(),
    };
  }

  private transformMaintenanceRequest(
    request: any,
  ): IMaintenanceRequestResponse {
    return {
      id: request._id.toString(),
      property: {
        id: request.property?._id?.toString() || request.property.toString(),
        title: request.property?.title || 'Unknown Property',
        address: request.property?.address || 'N/A',
      },
      tenant: {
        id: request.tenant?._id?.toString() || request.tenant.toString(),
        name: request.tenant?.name || 'Unknown Tenant',
        avatar: request.tenant?.avatar,
      },
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      images: request.images,
      reportedAt: request.reportedAt.toISOString(),
      completedAt: request.completedAt?.toISOString(),
      createdAt: request.createdAt.toISOString(),
    };
  }
}

export const dashboardService = new DashboardService();

export const createActivityLog = async (
  user: Types.ObjectId,
  action: TActivityAction,
  entityId: Types.ObjectId,
  entityModel: 'Property' | 'User' | 'MaintenanceRequest' | 'Payment',
  message: string,
) => {
  try {
    await Activity.create({
      user,
      action,
      entityId,
      entityModel,
      message,
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
};