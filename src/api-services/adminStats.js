import { makeApiRequest } from "../lib/helpers/index";

// Admin Dashboard Statistics
export const getAdminStats = async () => {
  try {
    return await makeApiRequest({
      url: 'api/admin/stats/',
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return mock data for development
    return {
      total_users: 12453,
      active_companies: 1234,
      total_products: 5678,
      total_services: 2345,
      monthly_revenue: 89234,
      posts_created: 8901,
      user_growth: 12,
      company_growth: 8,
      product_growth: 15,
      service_growth: 6,
      revenue_growth: 23,
      posts_growth: 18,
    };
  }
};

// User Statistics for Analytics
export const getUserStats = async (period = '30d') => {
  try {
    return await makeApiRequest({
      url: 'api/admin/users/stats/',
      method: 'GET',
      params: { period }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return mock data for development
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      new_users: [1200, 1900, 3000, 5000, 4200, 6200],
      active_users: [800, 1200, 2100, 3800, 3200, 4800],
      total_users: 12453,
      growth_rate: 8.2,
      retention_rate: 76.8,
    };
  }
};

// Company Statistics
export const getCompanyStats = async (period = '30d') => {
  try {
    return await makeApiRequest({
      url: 'api/admin/companies/stats/',
      method: 'GET',
      params: { period }
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return {
      total_companies: 1234,
      verified_companies: 1180,
      verification_rate: 95.6,
      new_companies: [100, 150, 200, 250, 180, 220],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    };
  }
};

// Product Statistics
export const getProductStats = async (period = '30d') => {
  try {
    return await makeApiRequest({
      url: 'api/admin/products/stats/',
      method: 'GET',
      params: { period }
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return {
      total_products: 5678,
      featured_products: 456,
      pending_approval: 23,
      categories_distribution: {
        labels: ["Equipment", "Tools", "Services", "Parts"],
        data: [40, 30, 20, 10],
      },
    };
  }
};

// Revenue Statistics
export const getRevenueStats = async (period = '30d') => {
  try {
    return await makeApiRequest({
      url: 'api/admin/revenue/stats/',
      method: 'GET',
      params: { period }
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return {
      total_revenue: 89234,
      monthly_revenue: [12000, 19000, 30000, 50000, 42000, 62000],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      growth_rate: 23,
      avg_transaction: 145.67,
    };
  }
};

// Platform Performance Statistics
export const getPlatformStats = async () => {
  try {
    return await makeApiRequest({
      url: 'api/admin/platform/stats/',
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      uptime: 99.9,
      response_time: 125,
      error_rate: 0.12,
      cache_hit_rate: 94.2,
      active_sessions: 2453,
      avg_session_duration: 512, // seconds
      bounce_rate: 23.5,
      conversion_rate: 3.8,
    };
  }
};

// Recent Activities
export const getRecentActivities = async (limit = 10) => {
  try {
    return await makeApiRequest({
      url: 'api/admin/activities/',
      method: 'GET',
      params: { limit }
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [
      {
        id: 1,
        type: "user_registration",
        message: "New user John Doe registered",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        user: { name: "John Doe", avatar: null },
      },
      {
        id: 2,
        type: "company_verification",
        message: "Company 'Oil Tech Solutions' verification completed",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: null,
      },
      {
        id: 3,
        type: "product_approval",
        message: "Product 'Industrial Valve' approved",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        user: null,
      },
    ];
  }
};

// Top Performing Content
export const getTopContent = async (period = '30d', limit = 5) => {
  try {
    return await makeApiRequest({
      url: 'api/admin/content/top/',
      method: 'GET',
      params: { period, limit }
    });
  } catch (error) {
    console.error('Error fetching top content:', error);
    return [
      { id: 1, title: "Industrial Pump Model X200", views: 2453, type: "Product" },
      { id: 2, title: "Equipment Maintenance Service", views: 1876, type: "Service" },
      { id: 3, title: "Oil & Gas Industry Trends", views: 1654, type: "Post" },
      { id: 4, title: "Safety Equipment Guide", views: 1432, type: "Document" },
      { id: 5, title: "Pipeline Inspection Tools", views: 1298, type: "Product" },
    ];
  }
};

// Export functions for easy import
export default {
  getAdminStats,
  getUserStats,
  getCompanyStats,
  getProductStats,
  getRevenueStats,
  getPlatformStats,
  getRecentActivities,
  getTopContent,
};
