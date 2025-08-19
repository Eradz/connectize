/**
 * CONNECTIZE ENTERPRISE API SERVICES
 * Supervised by: Research & Product Development Team
 * Target: Fortune 500-Level User Experience
 * Backend Integration: Enterprise-grade APIs
 */

import { makeApiRequest } from '../lib/helpers/index';

// =============================================================================
// ENVIRONMENT CONFIGURATION WITH DEVELOPMENT MODE DETECTION
// =============================================================================

// Environment-safe base URL configuration
const getBaseURL = () => {
  // Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

// Development mode detection
const isDevelopmentMode = () => {
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
};

// =============================================================================
// ENTERPRISE SUBSCRIPTION SERVICE
// =============================================================================

class EnterpriseSubscriptionService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }

  // All requests go through makeApiRequest which attaches Authorization and refreshes tokens

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
        plan: { 
          id: 3, 
          name: 'Enterprise Pro', 
          price: 299,
          featured_ads_enabled: true,
          api_calls_limit: 10000,
          storage_limit: 100
        },
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        auto_renew: true,
        trial_end: null
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
  const data = await makeApiRequest({ url: `/api/v1/plans/`, method: 'GET' });
  // Normalize for store
  return { success: true, plans: Array.isArray(data) ? data : (data?.results || []) };
  }

  // User Subscription Management
  async getMySubscription() {
    try {
      const data = await makeApiRequest({ url: `/api/v1/subscriptions/current/`, method: 'GET' });
      
      // Handle null/undefined response
      if (!data) {
        console.warn('getMySubscription: No data received');
        return { success: true, subscription: null };
      }
      
      // Normalize date fields expected by UI
      const normalized = {
        ...data,
        start_date: data.start_date || data.started_at || data.current_period_start,
        end_date: data.end_date || data.expires_at || data.current_period_end,
      };
      
      console.log('getMySubscription: Success', { status: normalized.status, plan: normalized.plan?.name });
      return { success: true, subscription: normalized };
    } catch (error) {
      // Handle 404 as "no subscription" rather than an error
      if (error.message?.includes('404') || error.message?.includes('No active subscription')) {
        console.log('getMySubscription: User has no subscription (404)');
        return { success: true, subscription: null };
      }
      
      console.error('getMySubscription: Error', error);
      return { success: false, error: error.message, subscription: null };
    }
  }

  // Usage Analytics - Enterprise Level
  async getUsageAnalytics(period = 'monthly') {
  const data = await makeApiRequest({ url: `/api/v1/subscriptions/usage/`, method: 'GET', params: { period } });
  // Normalize to include chart-friendly arrays used by the UI
  const analytics = data || {};
    // If backend returns usage as an object keyed by date, convert to sorted array
    const usageArray = Array.isArray(analytics.usage_data)
      ? analytics.usage_data
      : (analytics.usage && typeof analytics.usage === 'object')
        ? Object.entries(analytics.usage)
            .map(([date, usage]) => ({ date, usage }))
            .sort((a, b) => (a.date > b.date ? 1 : -1))
        : [];
  const normalized = {
    ...analytics,
      // Provide arrays so charts render gracefully
      usage_data: usageArray,
      patterns: Array.isArray(analytics.patterns) ? analytics.patterns : [],
  };
  return { success: true, analytics: normalized };
  }

  // Billing History
  async getBillingHistory(page = 1, limit = 20) {
  const data = await makeApiRequest({ url: `/api/v1/subscriptions/billing-history/`, method: 'GET', params: { page, limit } });
  // Normalize
  return { success: true, billingHistory: Array.isArray(data) ? data : (data?.results || []) };
  }

  // Subscription Management
  async upgradeSubscription(planId, paymentMethod = null) {
  const data = await makeApiRequest({ url: `/api/v1/subscriptions/upgrade/`, method: 'POST', data: { plan_id: planId, payment_method: paymentMethod } });
  return { success: true, subscription: data };
  }
}

// =============================================================================
// ENTERPRISE ADVERTISING SERVICE
// =============================================================================

class EnterpriseAdvertisingService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }
  // All requests go through makeApiRequest which attaches Authorization and refreshes tokens

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
  async getCampaigns(filters = {}) {
    const { status = 'all', page = 1, limit = 20, ...rest } = filters || {};
    const params = { page, limit, ...rest };
    if (status !== 'all') params.status = status;
    const data = await makeApiRequest({ url: `/api/v1/featured-ads/`, method: 'GET', params });
    return { success: true, campaigns: Array.isArray(data) ? data : (data?.results || []) };
  }

  // Campaign Creation
  async createCampaign(campaignData) {
  const data = await makeApiRequest({ url: `/api/v1/featured-ads/`, method: 'POST', data: campaignData });
  return { success: true, campaign: data };
  }

  // Dashboard Metrics
  async getDashboardMetrics(period = '30d') {
  // Backend returns summary; normalize to UI shape
  const data = await makeApiRequest({ url: `/api/v1/featured-ads/summary/`, method: 'GET', params: { period } });
  const base = data || {};
  const normalized = {
    ...base,
    // Ensure fields expected by charts exist as arrays
    performanceData: Array.isArray(base.performanceData) ? base.performanceData : [],
    trends: Array.isArray(base.trends) ? base.trends : [],
    detailed: Array.isArray(base.detailed) ? base.detailed : [],
  };
  return { success: true, metrics: normalized };
  }

  // Campaign Analytics
  async getCampaignAnalytics(campaignId, period = '7d') {
  const data = await makeApiRequest({ url: `/api/v1/featured-ads/${campaignId}/analytics/`, method: 'GET', params: { period } });
  return { success: true, analytics: data };
  }

  // Campaign Management Actions
  async updateCampaignStatus(campaignId, status) {
  const data = await makeApiRequest({ url: `/api/v1/featured-ads/${campaignId}/`, method: 'PATCH', data: { status } });
  return { success: true, campaign: data };
  }

  async updateCampaignBid(campaignId, bidData) {
    const data = await makeApiRequest({ url: `/api/v1/featured-ads/${campaignId}/`, method: 'PATCH', data: bidData });
    return { success: true, campaign: data };
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
