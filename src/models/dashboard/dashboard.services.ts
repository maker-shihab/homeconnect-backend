// modules/dashboard/dashboard.service.ts
import { Types } from 'mongoose';
import { AppError } from '../../shared/utils/AppError';
import { Booking } from '../booking/booking.model';
import { Maintenance } from '../maintenance/maintenance.model';
import { Property } from '../property/property.model';
import {
  IDashboardData,
  IDashboardFilters,
  IPropertyStats,
  IQuickStats,
  IRecentActivity,
  IRecentProperty
} from './dashboard.interface';

export class DashboardService {

  async getDashboardData(userId: string, filters?: IDashboardFilters): Promise<IDashboardData> {
    try {
      const userObjectId = new Types.ObjectId(userId);

      // Calculate stats
      const stats = await this.calculatePropertyStats(userObjectId);

      // Calculate quick stats
      const quickStats = await this.calculateQuickStats(userObjectId, filters);

      // Get recent activities
      const recentActivities = await this.getRecentActivities(userObjectId);

      // Get recent properties
      const recentProperties = await this.getRecentProperties(userObjectId);

      return {
        stats,
        quickStats,
        recentActivities,
        recentProperties
      };
    } catch (error) {
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  }

  private async calculatePropertyStats(userId: Types.ObjectId): Promise<IPropertyStats> {
    const total = await Property.countDocuments({ landlord: userId });
    const available = await Property.countDocuments({
      landlord: userId,
      status: 'available'
    });
    const rented = await Property.countDocuments({
      landlord: userId,
      status: 'rented'
    });
    const maintenance = await Property.countDocuments({
      landlord: userId,
      status: 'maintenance'
    });

    return {
      total,
      available,
      rented,
      maintenance
    };
  }

  private async calculateQuickStats(userId: Types.ObjectId, filters?: IDashboardFilters): Promise<IQuickStats> {
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Calculate monthly revenue from bookings
    const monthlyRevenueResult = await Booking.aggregate([
      {
        $match: {
          landlord: userId,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyRevenue = monthlyRevenueResult[0]?.totalRevenue || 0;

    // Calculate occupancy rate
    const totalProperties = await Property.countDocuments({ landlord: userId });
    const rentedProperties = await Property.countDocuments({
      landlord: userId,
      status: 'rented'
    });
    const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

    // Pending applications
    const pendingApplications = await Booking.countDocuments({
      landlord: userId,
      status: 'pending'
    });

    // Maintenance requests - FIXED: Now using Maintenance model
    const userPropertyIds = await this.getUserPropertyIds(userId);
    const maintenanceRequests = await Maintenance.countDocuments({
      property: { $in: userPropertyIds },
      status: 'pending'
    });

    // Total tenants
    const totalTenants = await Booking.countDocuments({
      landlord: userId,
      status: 'confirmed',
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    });

    return {
      monthlyRevenue,
      occupancyRate,
      pendingApplications,
      maintenanceRequests,
      totalTenants
    };
  }

  private async getRecentActivities(userId: Types.ObjectId): Promise<IRecentActivity[]> {
    const activities: IRecentActivity[] = [];

    // Recent bookings
    const recentBookings = await Booking.find({ landlord: userId })
      .populate('user', 'name email')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    recentBookings.forEach(booking => {
      activities.push({
        id: booking._id.toString(),
        type: booking.status === 'pending' ? 'application' : 'booking',
        title: booking.status === 'pending' ? 'New Booking Application' : 'Booking Confirmed',
        description: `${booking.user.name} booked ${booking.property.title}`,
        timestamp: booking.createdAt, // This is now required Date
        propertyId: booking.property._id.toString(),
        userId: booking.user._id.toString(),
        read: false
      });
    });

    // Recent maintenance requests - FIXED: Using Maintenance model
    const userPropertyIds = await this.getUserPropertyIds(userId);
    const recentMaintenance = await Maintenance.find({
      property: { $in: userPropertyIds }
    })
      .populate('property', 'title')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    recentMaintenance.forEach(maintenance => {
      activities.push({
        id: maintenance._id.toString(),
        type: 'maintenance',
        title: 'Maintenance Request',
        description: `${maintenance.reportedBy.name} reported issue at ${maintenance.property.title}`,
        timestamp: maintenance.createdAt, // This is now required Date
        propertyId: maintenance.property._id.toString(),
        read: false
      });
    });

    // Sort all activities by timestamp and return top 8
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }

  private async getRecentProperties(userId: Types.ObjectId): Promise<IRecentProperty[]> {
    const properties = await Property.find({ landlord: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title address price type bedrooms bathrooms status images createdAt');

    return properties.map(property => ({
      id: property._id.toString(),
      title: property.title,
      address: property.address,
      price: property.price,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      status: property.status,
      image: property.images[0] || '/images/default-property.jpg',
      lastUpdated: property.createdAt
    }));
  }

  private async getUserPropertyIds(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const properties = await Property.find({ landlord: userId }).select('_id');
    return properties.map(p => p._id);
  }

  async getLandlordEarnings(userId: string, year: number = new Date().getFullYear()) {
    const userObjectId = new Types.ObjectId(userId);

    const earnings = await Booking.aggregate([
      {
        $match: {
          landlord: userObjectId,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalEarnings: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Format for chart data
    const monthlyEarnings = Array(12).fill(0);
    earnings.forEach(earning => {
      monthlyEarnings[earning._id - 1] = earning.totalEarnings;
    });

    return {
      monthlyEarnings,
      totalYearlyEarnings: monthlyEarnings.reduce((sum, earning) => sum + earning, 0),
      totalBookings: earnings.reduce((sum, earning) => sum + earning.bookingCount, 0)
    };
  }
}

export const dashboardService = new DashboardService();