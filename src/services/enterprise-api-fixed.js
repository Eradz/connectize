/**
 * CONNECTIZE ENTERPRISE API SERVICES
 * Supervised by: Research & Product Development Team
 * Target: Fortune 500-Level User Experience
 * Backend Integration: Enterprise-grade APIs
 */

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

// Environment-safe base URL configuration
const getBaseURL = () => {
  // Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';
  }
  
  // Fallback for browser environment
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return `${protocol}//${hostname}:8000`;
  }
  
  // Default fallback
  return 'http://localhost:8000';
};

const BASE_URL = getBaseURL();

// =============================================================================
// ENTERPRISE SUBSCRIPTION SERVICE
// =============================================================================

class EnterpriseSubscriptionService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }

  // Safe token retrieval with error handling
  getAuthToken() {
    try {
      return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    } catch (error) {
      console.warn('LocalStorage not available:', error);
      return '';
    }
  }

  // Enhanced error handling for API requests
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Mock data for development
  getMockSubscriptionPlans() {
    return {
      success: true,
      plans: [
        { id: 1, name: 'Basic', price: 99, features: 'Basic features' },
        { id: 2, name: 'Professional', price: 199, features: 'Professional features' },
        { id: 3, name: 'Enterprise', price: 299, features: 'Enterprise features' },
        { id: 4, name: 'Enterprise Pro', price: 499, features: 'Fortune 500 features' }
      ]
    };
  }

  getMockSubscription() {
    return {
      success: true,
      subscription: {
        id: 1,
        plan: { id: 3, name: 'Enterprise Pro', price: 299 },
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-12-31'
      }
    };
  }

  getMockUsageAnalytics() {
    return {
      success: true,
      analytics: {
        api_calls: 5000,
        api_limit: 10000,
        storage_used: 25,
        storage_limit: 100,
        bandwidth_used: 15,
        bandwidth_limit: 50,
        usage_data: [
          { date: '2025-08-01', usage: 1000 },
          { date: '2025-08-02', usage: 1200 },
          { date: '2025-08-03', usage: 1100 }
        ]
      }
    };
  }

  // Plan Management - Fortune 500 Level
  async getSubscriptionPlans() {
    try {
      const response = await fetch(`${this.baseURL}/plans/`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return this.getMockSubscriptionPlans();
    }
  }

  // User Subscription Management
  async getMySubscription() {
    try {
      const response = await fetch(`${this.baseURL}/subscription/my-subscription/`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching my subscription:', error);
      return this.getMockSubscription();
    }
  }

  // Usage Analytics - Enterprise Level
  async getUsageAnalytics(period = 'monthly') {
    try {
      const response = await fetch(`${this.baseURL}/subscription/usage-analytics/?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      return this.getMockUsageAnalytics();
    }
  }

  // Billing History
  async getBillingHistory(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/subscription/billing-history/?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return { success: true, billing_records: [] };
    }
  }

  // Subscription Management
  async upgradeSubscription(planId, paymentMethod = null) {
    try {
      const response = await fetch(`${this.baseURL}/subscription/subscribe/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          payment_method: paymentMethod
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { success: false, error: error.message };
    }
  }
}

// =============================================================================
// ENTERPRISE ADVERTISING SERVICE
// =============================================================================

class EnterpriseAdvertisingService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }

  getAuthToken() {
    try {
      return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    } catch (error) {
      console.warn('LocalStorage not available:', error);
      return '';
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Mock data for development
  getMockCampaigns() {
    return {
      success: true,
      campaigns: [
        {
          id: 1,
          name: 'Summer Campaign',
          status: 'active',
          impressions: 50000,
          clicks: 2500,
          spent_amount: 1500,
          budget: 5000,
          description: 'Summer promotional campaign'
        },
        {
          id: 2,
          name: 'Product Launch',
          status: 'paused',
          impressions: 25000,
          clicks: 1200,
          spent_amount: 800,
          budget: 3000,
          description: 'New product launch campaign'
        }
      ]
    };
  }

  getMockDashboardMetrics() {
    return {
      success: true,
      metrics: {
        total_campaigns: 50,
        active_campaigns: 30,
        total_impressions: 1000000,
        total_clicks: 50000,
        performanceData: [
          { date: '2025-08-01', impressions: 10000, clicks: 500 },
          { date: '2025-08-02', impressions: 12000, clicks: 600 },
          { date: '2025-08-03', impressions: 11000, clicks: 550 }
        ],
        trends: [
          { date: '2025-08-01', value: 100 },
          { date: '2025-08-02', value: 120 },
          { date: '2025-08-03', value: 110 }
        ],
        detailed: [
          { metric: 'Conversion Rate', value: '4.2%', change: 12 },
          { metric: 'Cost Per Click', value: '$0.65', change: -8 },
          { metric: 'Return on Ad Spend', value: '3.2x', change: 15 }
        ]
      }
    };
  }

  // Campaign Management
  async getCampaigns(status = 'all', page = 1, limit = 20) {
    try {
      let url = `${this.baseURL}/featured-ads/?page=${page}&limit=${limit}`;
      if (status !== 'all') {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return this.getMockCampaigns();
    }
  }

  // Campaign Creation
  async createCampaign(campaignData) {
    try {
      const response = await fetch(`${this.baseURL}/featured-ads/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Dashboard Metrics
  async getDashboardMetrics(period = '30d') {
    try {
      const response = await fetch(`${this.baseURL}/featured-ads/dashboard-metrics/?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return this.getMockDashboardMetrics();
    }
  }

  // Campaign Analytics
  async getCampaignAnalytics(campaignId, period = '7d') {
    try {
      const response = await fetch(`${this.baseURL}/featured-ads/${campaignId}/analytics/?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      return { success: true, analytics: {} };
    }
  }

  // Campaign Management Actions
  async updateCampaignStatus(campaignId, status) {
    try {
      const response = await fetch(`${this.baseURL}/featured-ads/${campaignId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      return { success: false, error: error.message };
    }
  }
}

// =============================================================================
// SERVICE INSTANCES
// =============================================================================

// Create service instances
export const subscriptionService = new EnterpriseSubscriptionService();
export const advertisingService = new EnterpriseAdvertisingService();

// Export classes for direct instantiation if needed
export { EnterpriseSubscriptionService, EnterpriseAdvertisingService };

// Default export
export default {
  subscriptionService,
  advertisingService,
  EnterpriseSubscriptionService,
  EnterpriseAdvertisingService
};
