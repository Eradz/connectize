import api from './crud';

const subscriptions = {
  // Subscription Plans
  getSubscriptionPlans: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making subscription plans API call to:', '/api/v1/plans/', 'with params:', cleanParams);
    const response = await api.get('/api/v1/plans/', { params: cleanParams });
    return response.data;
  },

  // Get all available plans (public endpoint - no auth required)
  getAllPlans: async (params = {}) => {
    const response = await api.get('/api/v1/plans/', { params });
    return response.data;
  },

  getSubscriptionPlan: async (id) => {
    const response = await api.get(`/api/v1/plans/${id}/`);
    return response.data;
  },

  createSubscriptionPlan: async (data) => {
    const response = await api.post('/api/v1/plans/', data);
    return response.data;
  },

  updateSubscriptionPlan: async (id, data) => {
    const response = await api.patch(`/api/v1/plans/${id}/`, data);
    return response.data;
  },

  deleteSubscriptionPlan: async (id) => {
    const response = await api.delete(`/api/v1/plans/${id}/`);
    return response.data;
  },

  // User Subscriptions
  getUserSubscriptions: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/', { params });
    return response.data;
  },

  getUserSubscription: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/${id}/`);
    return response.data;
  },

  createUserSubscription: async (data) => {
    const response = await api.post('/api/v1/subscriptions/', data);
    return response.data;
  },

  updateUserSubscription: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/${id}/`, data);
    return response.data;
  },

  cancelUserSubscription: async (id, reason = '') => {
    const response = await api.patch(`/api/v1/subscriptions/${id}/`, {
      status: 'cancelled',
      cancellation_reason: reason
    });
    return response.data;
  },

  deleteUserSubscription: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/${id}/`);
    return response.data;
  },

  // Current user subscription - matches backend /api/v1/subscriptions/current/
  getCurrentUserSubscription: async () => {
    try {
      const response = await api.get('/api/v1/subscriptions/current/');
      return response.data;
    } catch (e) {
      if (e?.response?.status === 404 || e?.status === 404) {
        return { subscription: null, usage: null, plan_features: null };
      }
      throw e;
    }
  },

  // Subscription Features
  getSubscriptionFeatures: async (params = {}) => {
    // Primary: Permission system available features endpoint
    try {
      const available = await api.get('/api/permissions/features/available/', { params });
      if (available?.data) {
        const rawCategories = available.data.features_by_category || {};
        const normalizedCategories = Object.fromEntries(
          Object.entries(rawCategories).map(([cat, feats]) => [
            cat,
            (feats || []).map(f => ({
              ...f,
              minimum_plan: f.minimum_plan || f.required_plan || 'trial'
            }))
          ])
        );
        return {
          features_by_category: normalizedCategories,
          total_features: available.data.total_features,
          source: 'permissions_available'
        };
      }
    } catch (e) {
      if (e?.response?.status !== 404) {
        console.warn('Permissions features endpoint error:', e?.message);
      }
    }

    // Fallback 1: Enhanced v2 subscription features
    try {
      const enhanced = await api.get('/api/permissions/api/v2/subscription/features/', { params });
      if (enhanced?.data) {
        if (enhanced.data.features_by_category) return enhanced.data;
        if (enhanced.data.features) return { features_by_category: enhanced.data.features };
      }
    } catch (e2) {
      if (e2?.response?.status !== 404) {
        console.warn('Enhanced v2 subscription features endpoint unavailable:', e2?.message);
      }
    }

    // Fallback 2: Enhanced features by category
    try {
      const byCat = await api.get('/api/permissions/api/v2/features/by-category/', { params });
      if (byCat?.data) {
        const raw = byCat.data.features_by_category || byCat.data || {};
        const normalized = Object.fromEntries(
          Object.entries(raw).map(([cat, feats]) => [
            cat,
            (feats || []).map(f => ({
              ...f,
              minimum_plan: f.minimum_plan || f.required_plan || 'trial'
            }))
          ])
        );
        return {
          features_by_category: normalized,
          source: 'v2_features_by_category'
        };
      }
    } catch (e3) {
      if (e3?.response?.status !== 404) {
        console.warn('Enhanced features by category endpoint failed:', e3?.message);
      }
    }

    return { features_by_category: {}, source: 'empty' };
  },

  createSubscriptionFeature: async (data) => {
    const response = await api.post('/api/v1/subscriptions/features/', data);
    return response.data;
  },

  updateSubscriptionFeature: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/features/${id}/`, data);
    return response.data;
  },

  deleteSubscriptionFeature: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/features/${id}/`);
    return response.data;
  },

    // Payment Methods
  getPaymentMethods: async (params = {}) => {
    try {
      // Use standard JWT authentication - makeApiRequest handles auth automatically
      const response = await api.get('/api/v1/payment-methods/', { params });
      
      if (response.data?.payment_methods) {
        return response.data;
      }
      return { payment_methods: [], source: 'empty_response' };
    } catch (e) {
      console.warn('Payment methods API error:', e?.message);
      return { payment_methods: [], source: 'api_error', error: e?.message };
    }
  },

  getPaymentMethod: async (id) => {
    try {
      // Use standard JWT authentication - makeApiRequest handles auth automatically
      const response = await api.get(`/api/v1/payment-methods/${id}/`);
      return response.data;
    } catch (e) {
      console.warn('Get payment method API error:', e?.message);
      throw e;
    }
  },

  createPaymentMethod: async (data) => {
    const response = await api.post('/api/v1/payment-methods/', data);
    return response.data;
  },

  updatePaymentMethod: async (id, data) => {
    // Use set_default action if setting default, otherwise use PATCH
    if (data.is_default) {
      const response = await api.post(`/api/v1/payment-methods/${id}/set_default/`);
      return response.data;
    }
    const response = await api.patch(`/api/v1/payment-methods/${id}/`, data);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/api/v1/payment-methods/${id}/`);
    return response.data;
  },

  // Billing and Invoices
    getBillingHistory: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/subscriptions/billing_history/', { params });
      
      // Handle paginated response from Django REST framework
      if (response.data && response.data.results) {
        return {
          data: response.data.results,
          pagination: {
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous
          }
        };
      }
      
      // Handle array response (non-paginated)
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      
      // Handle other data structures
      return response.data;
    } catch (error) {
      console.warn('getBillingHistory error:', error?.message);
      // Return empty billing history on error
      return { data: [] };
    }
  },

  getInvoices: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/invoices/', { params });
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/invoices/${id}/`);
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await api.post('/api/v1/subscriptions/invoices/', data);
    return response.data;
  },

  updateInvoice: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/invoices/${id}/`, data);
    return response.data;
  },

  markInvoicePaid: async (id, paymentData = {}) => {
    const response = await api.patch(`/api/v1/subscriptions/invoices/${id}/`, {
      status: 'paid',
      ...paymentData
    });
    return response.data;
  },

  // Payments and Transactions
  getPayments: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/payments/', { params });
    return response.data;
  },

  getPayment: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/payments/${id}/`);
    return response.data;
  },

  createPayment: async (data) => {
    const response = await api.post('/api/v1/subscriptions/payments/', data);
    return response.data;
  },

  processRefund: async (paymentId, amount, reason = '') => {
    const response = await api.post(`/api/v1/subscriptions/payments/${paymentId}/refund/`, {
      amount,
      reason
    });
    return response.data;
  },

  // Coupons and Discounts
  getCoupons: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/coupons/', { params });
    return response.data;
  },

  createCoupon: async (data) => {
    const response = await api.post('/api/v1/subscriptions/coupons/', data);
    return response.data;
  },

  updateCoupon: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/coupons/${id}/`, data);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/coupons/${id}/`);
    return response.data;
  },

  validateCoupon: async (couponCode) => {
    const response = await api.post('/api/v1/subscriptions/coupons/validate/', {
      code: couponCode
    });
    return response.data;
  },

  // Usage and Analytics
  getUsageAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/permissions/api/v2/subscription/analytics/', { params });
      // If response is null (404 handled by makeApiRequest), return fallback
      if (!response || !response.data) {
        return { usage: null, source: 'missing_endpoint' };
      }
      return response.data;
    } catch (e) {
      // Additional fallback for any remaining errors
      console.warn('Usage analytics fallback triggered:', e?.message);
      return { usage: null, source: 'fallback_error' };
    }
  },

  getSubscriptionAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/subscriptions/analytics/', { params });
      return response.data;
    } catch (e) {
      if (e?.response?.status === 404 || e?.status === 404) {
        return { usage_trends: null, cost_optimization: null, forecasting: null };
      }
      throw e;
    }
  },

  getRevenueAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/subscriptions/revenue-analytics/', { params });
      return response.data;
    } catch (e) {
      if (e?.response?.status === 404 || e?.status === 404) return { data: [] };
      throw e;
    }
  },

  getChurnAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/subscriptions/churn-analytics/', { params });
      return response.data;
    } catch (e) {
      if (e?.response?.status === 404 || e?.status === 404) return { data: [] };
      throw e;
    }
  },

  // Subscription Management Actions
  upgradeSubscription: async (subscriptionId, newPlanId) => {
    // Use the payment-enabled upgrade endpoint
    const response = await api.post(`/api/v1/subscription-payments/upgrade_subscription_payment/`, {
      plan_id: newPlanId
    });
    return response.data;
  },

  // Simple upgrade (no payment processing - for free plan changes)
  upgradeSubscriptionSimple: async (newPlanId) => {
    const response = await api.post(`/api/v1/subscriptions/upgrade/`, {
      plan_id: newPlanId,
      upgrade_immediately: true
    });
    return response.data;
  },

  downgradeSubscription: async (subscriptionId, newPlanId) => {
    // The backend uses a detail=False action, so no subscription ID in URL
    const response = await api.post(`/api/v1/subscriptions/downgrade/`, {
      plan_id: newPlanId
    });
    return response.data;
  },

  pauseSubscription: async (subscriptionId, pauseUntil = null) => {
    const response = await api.post(`/api/v1/subscriptions/user-subscriptions/${subscriptionId}/pause/`, {
      pause_until: pauseUntil
    });
    return response.data;
  },

  resumeSubscription: async (subscriptionId) => {
    const response = await api.post(`/api/v1/subscriptions/user-subscriptions/${subscriptionId}/resume/`);
    return response.data;
  },

  // Billing Cycles and Renewals
  getBillingCycles: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/billing-cycles/', { params });
    return response.data;
  },

  processRenewal: async (subscriptionId) => {
    const response = await api.post(`/api/v1/subscriptions/${subscriptionId}/renew/`);
    return response.data;
  },

  // Notifications and Communication
  getSubscriptionNotifications: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/notifications/', { params });
    return response.data;
  },

  sendSubscriptionNotification: async (data) => {
    const response = await api.post('/api/v1/subscriptions/notifications/', data);
    return response.data;
  },

  // Bulk operations
  bulkUpdateSubscriptions: async (ids, data) => {
    const response = await api.post('/api/v1/subscriptions/user-subscriptions/bulk_update/', {
      ids,
      ...data
    });
    return response.data;
  },

  bulkCancelSubscriptions: async (ids, reason = '') => {
    const response = await api.post('/api/v1/subscriptions/user-subscriptions/bulk_cancel/', {
      ids,
      cancellation_reason: reason
    });
    return response.data;
  },

  // Export data
  exportSubscriptions: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/subscriptions/user-subscriptions/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  exportPayments: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/subscriptions/payments/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  exportInvoices: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/subscriptions/invoices/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  // Statistics
  getSubscriptionStats: async () => {
    const response = await api.get('/api/v1/subscriptions/stats/');
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/api/v1/subscriptions/payment-stats/');
    return response.data;
  },

  // Search and Filtering
  searchSubscriptions: async (query, filters = {}) => {
    const response = await api.get('/api/v1/subscriptions/user-subscriptions/search/', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  searchInvoices: async (query, filters = {}) => {
    const response = await api.get('/api/v1/subscriptions/invoices/search/', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Aliases for backward compatibility
  // NOTE: Many parts of the app expect a shape { data: ... }. The core methods above
  // return the raw response.data. These wrapper aliases normalize the shape so existing
  // dashboard code (e.g. SubscriptionDashboard.jsx) reads plansResult.data.results, etc.
  getSubscriptions: function(params) {
    return this.getUserSubscriptions(params).then(d => ({ data: d }));
  },
  getPlans: function(params) {
    return this.getSubscriptionPlans(params).then(d => ({ data: d }));
  },
  createSubscription: function(data) {
    return this.createUserSubscription(data).then(d => ({ data: d }));
  },
  updateSubscription: function(id, data) {
    return this.updateUserSubscription(id, data).then(d => ({ data: d }));
  },
  deleteSubscription: function(id) {
    return this.deleteUserSubscription(id).then(d => ({ data: d }));
  },
  cancelSubscription: function(id, reason) {
    return this.cancelUserSubscription(id, reason).then(d => ({ data: d }));
  },
  createPlan: function(data) {
    return this.createSubscriptionPlan(data).then(d => ({ data: d }));
  },
  updatePlan: function(id, data) {
    return this.updateSubscriptionPlan(id, data).then(d => ({ data: d }));
  },
  deletePlan: function(id) {
    return this.deleteSubscriptionPlan(id).then(d => ({ data: d }));
  },
  reactivateSubscription: function(id) {
    return this.resumeSubscription(id).then(d => ({ data: d }));
  },
  getCurrentSubscription: function() {
    return this.getCurrentUserSubscription().then(d => ({ data: d }));
  },
  getUsage: function() {
    return this.getUsageAnalytics().then(d => ({ data: d })).catch(e => {
      console.warn('getUsage alias fallback triggered:', e?.message);
      return { data: { usage: null, source: 'alias_fallback' } };
    });
  },
  getAvailableFeatures: function() {
    return this.getSubscriptionFeatures().then(d => ({ data: d }));
  },
  getPlan: function(id) {
    return this.getSubscriptionPlan(id).then(d => ({ data: d }));
  },
  getPlanDetails: function(id) {
    return this.getSubscriptionPlan(id).then(d => ({ data: d }));
  },
  getCompanySubscriptionSummary: function() {
    return this.getSubscriptionStats().then(d => ({ data: d }));
  },
  getCompanySubscriptions: function() {
    return this.getUserSubscriptions({ company: 'current' }).then(d => ({ data: d }));
  },
  createSetupIntent: async function() {
    // Don't pass custom headers - let makeApiRequest handle JWT auth automatically
    const response = await api.post('/api/v1/payment-methods/create_setup_intent/', {});
    return { data: response.data };
  },
  addPaymentMethod: function(data) {
    return this.createPaymentMethod(data).then(d => ({ data: d }));
  },
  setDefaultPaymentMethod: async function(id) {
    // Use the dedicated set_default endpoint
    const response = await api.post(`/api/v1/payment-methods/${id}/set_default/`);
    return { data: response.data };
  },
  removePaymentMethod: function(id) {
    return this.deletePaymentMethod(id).then(d => ({ data: d }));
  },
  getBilling: function(params = {}) {
    return this.getBillingHistory(params).then(d => ({ data: d?.data || d }));
  },
  getBillingData: function(params = {}) {
    return this.getBillingHistory(params).then(d => ({ data: d?.data || d }));
  },
};

export default subscriptions;
export const subscriptionsAPI = subscriptions;
