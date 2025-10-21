export interface IPropertyStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}

export interface IQuickStats {
  monthlyRevenue: number;
  occupancyRate: number;
  pendingApplications: number;
  maintenanceRequests: number;
  totalTenants: number;
}

export interface IRecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'maintenance' | 'inquiry' | 'application';
  title: string;
  description: string;
  timestamp: Date; // Required - remove optional
  propertyId?: string;
  userId?: string;
  read: boolean;
}

export interface IRecentProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'apartment' | 'house' | 'studio' | 'condo';
  bedrooms: number;
  bathrooms: number;
  status: 'available' | 'rented' | 'maintenance';
  image: string;
  lastUpdated: Date;
}

export interface IDashboardData {
  stats: IPropertyStats;
  quickStats: IQuickStats;
  recentActivities: IRecentActivity[];
  recentProperties: IRecentProperty[];
}

export interface IDashboardFilters {
  startDate?: Date;
  endDate?: Date;
  propertyType?: string;
}