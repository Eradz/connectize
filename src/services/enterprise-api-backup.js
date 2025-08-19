/**
 * CONNECTIZE FRONTEND DEVELOPMENT PLAN
 * Supervised by: Research & Product Development Team
 * Target: Fortune 500-Level User Experience
 * Backend Integration: Enterprise-grade APIs
 */

// =============================================================================
// PHASE 1: ENHANCED API INTEGRATION SERVICES
// =============================================================================

/**
 * Enterprise Subscription Service Integration
 * Connects frontend to Fortune 500-level subscription backend
 */

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
      // Return mock data for development/testing
      return this.getMockSubscriptionPlans();
    }
  }
      });
      
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const data = await response.json();
      return {
        success: true,
        plans: data.results || data,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Subscription plans fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // User Subscription Management
  async getMySubscription() {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/my/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscription');
      
      const data = await response.json();
      return { success: true, subscription: data };
    } catch (error) {
      console.error('My subscription fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Billing History - Enterprise Level
  async getBillingHistory(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/billing-history/?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch billing history');
      
      const data = await response.json();
      return {
        success: true,
        billingHistory: data.results || data,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Billing history fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Usage Analytics - Fortune 500 Level
  async getUsageAnalytics(period = 'monthly') {
    try {
      const response = await fetch(`${this.baseURL}/usage-analytics/?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch usage analytics');
      
      const data = await response.json();
      return { success: true, analytics: data };
    } catch (error) {
      console.error('Usage analytics fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscription Upgrade/Management
  async upgradeSubscription(planId, paymentMethod = null) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/upgrade/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          payment_method: paymentMethod
        })
      });
      
      if (!response.ok) throw new Error('Failed to upgrade subscription');
      
      const data = await response.json();
      return { success: true, subscription: data };
    } catch (error) {
      console.error('Subscription upgrade error:', error);
      return { success: false, error: error.message };
    }
  }

  // Payment Processing Integration
  async processPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/payments/process/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) throw new Error('Payment processing failed');
      
      const data = await response.json();
      return { success: true, payment: data };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Enterprise Advertising Service Integration
 * Connects to Fortune 500-level advertising backend
 */
class EnterpriseAdvertisingService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1/featured-ads`;
  }

  // Campaign Management - Fortune 500 Level
  async getCampaigns(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseURL}/campaigns/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      return {
        success: true,
        campaigns: data.results || data,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Campaigns fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create Enterprise Campaign
  async createCampaign(campaignData) {
    try {
      const response = await fetch(`${this.baseURL}/campaigns/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });
      
      if (!response.ok) throw new Error('Failed to create campaign');
      
      const data = await response.json();
      return { success: true, campaign: data };
    } catch (error) {
      console.error('Campaign creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Campaign Analytics - Fortune 500 Level
  async getCampaignAnalytics(campaignId, dateRange = '30d') {
    try {
      const response = await fetch(`${this.baseURL}/campaigns/${campaignId}/analytics/?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch campaign analytics');
      
      const data = await response.json();
      return { success: true, analytics: data };
    } catch (error) {
      console.error('Campaign analytics fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time Performance Dashboard
  async getDashboardMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard/metrics/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
      
      const data = await response.json();
      return { success: true, metrics: data };
    } catch (error) {
      console.error('Dashboard metrics fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Bid Management
  async updateCampaignBid(campaignId, bidData) {
    try {
      const response = await fetch(`${this.baseURL}/campaigns/${campaignId}/bid/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bidData)
      });
      
      if (!response.ok) throw new Error('Failed to update bid');
      
      const data = await response.json();
      return { success: true, campaign: data };
    } catch (error) {
      console.error('Bid update error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export services for frontend integration
export const subscriptionService = new EnterpriseSubscriptionService();
export const advertisingService = new EnterpriseAdvertisingService();
