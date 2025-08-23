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
  getAllPlans: async () => {
    const response = await api.get('/api/v1/plans/');
    return response.data;
  },

  getSubscriptionPlan: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/plans/${id}/`);
    return response.data;
  },

  createSubscriptionPlan: async (data) => {
    const response = await api.post('/api/v1/subscriptions/plans/', data);
    return response.data;
  },

  updateSubscriptionPlan: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/plans/${id}/`, data);
    return response.data;
  },

  deleteSubscriptionPlan: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/plans/${id}/`);
    return response.data;
  },

  // User Subscriptions
  getUserSubscriptions: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/user-subscriptions/', { params });
    return response.data;
  },

  getUserSubscription: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/user-subscriptions/${id}/`);
    return response.data;
  },

  createUserSubscription: async (data) => {
    const response = await api.post('/api/v1/subscriptions/user-subscriptions/', data);
    return response.data;
  },

  updateUserSubscription: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/user-subscriptions/${id}/`, data);
    return response.data;
  },

  cancelUserSubscription: async (id, reason = '') => {
    const response = await api.patch(`/api/v1/subscriptions/user-subscriptions/${id}/`, {
      status: 'cancelled',
      cancellation_reason: reason
    });
    return response.data;
  },

  deleteUserSubscription: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/user-subscriptions/${id}/`);
    return response.data;
  },

  // Subscription Features
  getSubscriptionFeatures: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/features/', { params });
    return response.data;
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
    const response = await api.get('/api/v1/subscriptions/payment-methods/', { params });
    return response.data;
  },

  getPaymentMethod: async (id) => {
    const response = await api.get(`/api/v1/subscriptions/payment-methods/${id}/`);
    return response.data;
  },

  createPaymentMethod: async (data) => {
    const response = await api.post('/api/v1/subscriptions/payment-methods/', data);
    return response.data;
  },

  updatePaymentMethod: async (id, data) => {
    const response = await api.put(`/api/v1/subscriptions/payment-methods/${id}/`, data);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/api/v1/subscriptions/payment-methods/${id}/`);
    return response.data;
  },

  // Billing and Invoices
  getBillingHistory: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/billing-history/', { params });
    return response.data;
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
    const response = await api.get('/api/v1/subscriptions/usage-analytics/', { params });
    return response.data;
  },

  getSubscriptionAnalytics: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/analytics/', { params });
    return response.data;
  },

  getRevenueAnalytics: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/revenue-analytics/', { params });
    return response.data;
  },

  getChurnAnalytics: async (params = {}) => {
    const response = await api.get('/api/v1/subscriptions/churn-analytics/', { params });
    return response.data;
  },

  // Subscription Management Actions
  upgradeSubscription: async (subscriptionId, newPlanId) => {
    const response = await api.post(`/api/v1/subscriptions/user-subscriptions/${subscriptionId}/upgrade/`, {
      new_plan_id: newPlanId
    });
    return response.data;
  },

  downgradeSubscription: async (subscriptionId, newPlanId) => {
    const response = await api.post(`/api/v1/subscriptions/user-subscriptions/${subscriptionId}/downgrade/`, {
      new_plan_id: newPlanId
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
    const response = await api.post(`/api/v1/subscriptions/user-subscriptions/${subscriptionId}/renew/`);
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
  getSubscriptions: function(params) { return this.getUserSubscriptions(params); },
  getPlans: function(params) { return this.getSubscriptionPlans(params); },
  createSubscription: function(data) { return this.createUserSubscription(data); },
  updateSubscription: function(id, data) { return this.updateUserSubscription(id, data); },
  deleteSubscription: function(id) { return this.deleteUserSubscription(id); },
  cancelSubscription: function(id, reason) { return this.cancelUserSubscription(id, reason); },
  createPlan: function(data) { return this.createSubscriptionPlan(data); },
  updatePlan: function(id, data) { return this.updateSubscriptionPlan(id, data); },
  deletePlan: function(id) { return this.deleteSubscriptionPlan(id); },
  reactivateSubscription: function(id) { return this.resumeSubscription(id); },
  getCurrentSubscription: function() { return this.getUserSubscriptions({ current: true }); },
  getUsage: function() { return this.getUsageAnalytics(); },
  getAvailableFeatures: function() { return this.getSubscriptionFeatures(); },
  getPlan: function(id) { return this.getSubscriptionPlan(id); },
  getPlanDetails: function(id) { return this.getSubscriptionPlan(id); },
  getCompanySubscriptionSummary: function() { return this.getSubscriptionStats(); },
  getCompanySubscriptions: function() { return this.getUserSubscriptions({ company: 'current' }); },
  createSetupIntent: function() { return this.createPayment({ type: 'setup_intent' }); },
  addPaymentMethod: function(data) { return this.createPaymentMethod(data); },
  setDefaultPaymentMethod: function(id) { return this.updatePaymentMethod(id, { is_default: true }); },
  removePaymentMethod: function(id) { return this.deletePaymentMethod(id); },
};

export default subscriptions;
export const subscriptionsAPI = subscriptions;
