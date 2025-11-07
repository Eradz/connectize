/**
 * ENTERPRISE STATE MANAGEMENT
 * Zustand stores for Fortune 500-level data management
 * Supervised by: Research & Product Development Team
 */

import { create } from 'zustand';
import { subscriptionService, advertisingService } from '../services/enterprise-api';

// =============================================================================
// SUBSCRIPTION STATE STORE
// =============================================================================

export const useSubscriptionStore = create((set, get) => ({
  // State
  currentSubscription: null,
  subscriptionPlans: [],
  billingHistory: [],
  usageAnalytics: null,
  loading: false, // General loading state
  subscriptionLoading: false, // Specific for subscription fetch
  plansLoading: false, // Specific for plans fetch
  error: null,
  lastFetch: null, // Track when we last fetched data

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch subscription plans
  fetchSubscriptionPlans: async () => {
    const state = get();
    
    // Avoid refetching if we have data and it's recent (within 5 minutes)
    if (state.subscriptionPlans.length > 0 && state.lastFetch && 
        (Date.now() - state.lastFetch) < 5 * 60 * 1000) {
      console.log('fetchSubscriptionPlans: Using cached data');
      return;
    }
    
    if (state.plansLoading) {
      console.log('fetchSubscriptionPlans: Already loading plans, skipping');
      return;
    }
    
    set({ plansLoading: true, error: null });
    try {
      const result = await subscriptionService.getSubscriptionPlans();
      if (result && result.success) {
        set({ 
          subscriptionPlans: result.plans || [], 
          plansLoading: false,
          lastFetch: Date.now()
        });
      } else {
        set({ error: result?.error, plansLoading: false });
      }
    } catch (error) {
      set({ error: error.message, plansLoading: false });
    }
  },

  // Fetch user's current subscription
  fetchMySubscription: async () => {
    console.log('🔄 fetchMySubscription: Function called');
    const currentState = get();
    console.log('🔄 fetchMySubscription: Current state:', { 
      subscriptionLoading: currentState.subscriptionLoading, 
      currentSubscription: currentState.currentSubscription 
    });
    
    // Prevent multiple simultaneous requests for subscription specifically
    if (currentState.subscriptionLoading) {
      console.log('fetchMySubscription: Already loading subscription, skipping');
      return;
    }
    
    set({ subscriptionLoading: true, error: null });
    console.log('fetchMySubscription: Starting request');
    
    try {
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const result = await Promise.race([
        subscriptionService.getMySubscription(),
        timeoutPromise
      ]);
      
      console.log('fetchMySubscription: Raw result', result);
      
      if (result && result.success) {
        console.log('fetchMySubscription: Success - setting subscription:', result.subscription);
        set({ 
          currentSubscription: result.subscription || null, 
          subscriptionLoading: false,
          error: null,
          lastFetch: Date.now()
        });
      } else {
        console.warn('fetchMySubscription: Failed - success:', result?.success, 'error:', result?.error);
        set({ 
          error: result?.error || 'Failed to fetch current subscription', 
          subscriptionLoading: false,
          currentSubscription: null
        });
      }
    } catch (error) {
      console.error('fetchMySubscription error:', error);
      set({ 
        error: error.message || 'Network error', 
        subscriptionLoading: false,
        currentSubscription: null
      });
    }
  },

  // Fetch billing history
  fetchBillingHistory: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const result = await subscriptionService.getBillingHistory(page, limit);
      if (result.success) {
        set({ billingHistory: result.billingHistory, loading: false });
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch usage analytics
  fetchUsageAnalytics: async (period = 'monthly') => {
    set({ loading: true, error: null });
    try {
      const result = await subscriptionService.getUsageAnalytics(period);
      if (result && result.success) {
        set({ usageAnalytics: result.analytics || null, loading: false });
      } else {
        set({ error: result?.error || 'Failed to fetch usage analytics', loading: false });
      }
    } catch (error) {
      console.error('fetchUsageAnalytics error:', error);
      set({ error: error.message || 'Network error', loading: false });
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (planId, paymentMethod) => {
    set({ loading: true, error: null });
    try {
      const result = await subscriptionService.upgradeSubscription(planId, paymentMethod);
      if (result.success) {
        set({ 
          currentSubscription: result.subscription, 
          loading: false 
        });
        // Refresh plans and billing history
        get().fetchSubscriptionPlans();
        get().fetchBillingHistory();
        return { success: true };
      } else {
        set({ error: result.error, loading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Reset state
  reset: () => set({
    currentSubscription: null,
    subscriptionPlans: [],
    billingHistory: [],
    usageAnalytics: null,
    loading: false,
    error: null,
  }),
}));

// =============================================================================
// ADVERTISING STATE STORE
// =============================================================================

export const useAdvertisingStore = create((set, get) => ({
  // State
  campaigns: [],
  activeCampaign: null,
  campaignAnalytics: {},
  dashboardMetrics: null,
  loading: false,
  error: null,
  lastFetch: null, // Track when we last fetched data
  filters: {
    status: 'all',
    dateRange: '30d',
    page: 1,
    limit: 20
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set(state => ({ 
    filters: { ...state.filters, ...filters } 
  })),

  // Fetch campaigns
  fetchCampaigns: async (customFilters = {}) => {
    const state = get();
    
    // Avoid refetching if we have data and it's recent (within 2 minutes)
    if (state.campaigns.length > 0 && state.lastFetch && 
        Date.now() - state.lastFetch < 2 * 60 * 1000 && 
        Object.keys(customFilters).length === 0) {
      console.log('fetchCampaigns: Using cached data');
      return;
    }
    
    if (state.loading) {
      console.log('fetchCampaigns: Already loading, skipping');
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const filters = { ...state.filters, ...customFilters };
      const result = await advertisingService.getCampaigns(filters);
      if (result && result.success) {
        set({ 
          campaigns: result.campaigns || [], 
          loading: false,
          lastFetch: Date.now()
        });
      } else {
        set({ error: result?.error || 'Failed to fetch campaigns', loading: false });
      }
    } catch (error) {
      console.error('fetchCampaigns error:', error);
      set({ error: error.message || 'Network error', loading: false });
    }
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    set({ loading: true, error: null });
    try {
      const result = await advertisingService.createCampaign(campaignData);
      if (result.success) {
        // Refresh campaigns list
        get().fetchCampaigns();
        set({ loading: false });
        return { success: true, campaign: result.campaign };
      } else {
        set({ error: result.error, loading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Fetch campaign analytics
  fetchCampaignAnalytics: async (campaignId, dateRange = '30d') => {
    set({ loading: true, error: null });
    try {
      const result = await advertisingService.getCampaignAnalytics(campaignId, dateRange);
      if (result.success) {
        set(state => ({
          campaignAnalytics: {
            ...state.campaignAnalytics,
            [campaignId]: result.analytics
          },
          loading: false
        }));
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch dashboard metrics
  fetchDashboardMetrics: async () => {
    const state = get();
    
    // Avoid refetching if we have data and it's recent (within 2 minutes)
    if (state.dashboardMetrics && state.lastFetch && 
        Date.now() - state.lastFetch < 2 * 60 * 1000) {
      console.log('fetchDashboardMetrics: Using cached data');
      return;
    }
    
    if (state.loading) {
      console.log('fetchDashboardMetrics: Already loading, skipping');
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const result = await advertisingService.getDashboardMetrics();
      if (result && result.success) {
        set({ 
          dashboardMetrics: result.metrics || null, 
          loading: false,
          lastFetch: Date.now()
        });
      } else {
        set({ error: result?.error || 'Failed to fetch dashboard metrics', loading: false });
      }
    } catch (error) {
      console.error('fetchDashboardMetrics error:', error);
      set({ error: error.message || 'Network error', loading: false });
    }
  },

  // Update campaign bid
  updateCampaignBid: async (campaignId, bidData) => {
    set({ loading: true, error: null });
    try {
      const result = await advertisingService.updateCampaignBid(campaignId, bidData);
      if (result.success) {
        // Refresh campaigns
        get().fetchCampaigns();
        set({ loading: false });
        return { success: true };
      } else {
        set({ error: result.error, loading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Set active campaign
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),

  // Reset state
  reset: () => set({
    campaigns: [],
    activeCampaign: null,
    campaignAnalytics: {},
    dashboardMetrics: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      dateRange: '30d',
      page: 1,
      limit: 20
    }
  }),
}));

// =============================================================================
// ENTERPRISE DASHBOARD STATE
// =============================================================================

export const useEnterpriseStore = create((set, get) => ({
  // State
  dashboardData: null,
  notifications: [],
  systemHealth: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Initialize enterprise dashboard
  initializeDashboard: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all enterprise data in parallel
      const [subscriptions, advertising] = await Promise.all([
        get().fetchSubscriptionOverview(),
        get().fetchAdvertisingOverview()
      ]);

      set({
        dashboardData: {
          subscriptions,
          advertising,
          lastUpdated: new Date().toISOString()
        },
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch subscription overview
  fetchSubscriptionOverview: async () => {
    try {
      const result = await subscriptionService.getUsageAnalytics('overview');
      return result.success ? result.analytics : null;
    } catch (error) {
      console.error('Subscription overview error:', error);
      return null;
    }
  },

  // Fetch advertising overview
  fetchAdvertisingOverview: async () => {
    try {
      const result = await advertisingService.getDashboardMetrics();
      return result.success ? result.metrics : null;
    } catch (error) {
      console.error('Advertising overview error:', error);
      return null;
    }
  },

  // Add notification
  addNotification: (notification) => set(state => ({
    notifications: [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...notification
      },
      ...state.notifications.slice(0, 49) // Keep last 50
    ]
  })),

  // Remove notification
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Clear all notifications
  clearNotifications: () => set({ notifications: [] }),

  // Reset state
  reset: () => set({
    dashboardData: null,
    notifications: [],
    systemHealth: null,
    loading: false,
    error: null,
  }),
}));
