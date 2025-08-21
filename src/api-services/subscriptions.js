import api from './crud';

const SUBSCRIPTION_BASE_URL = '/api/v1'; // subscriptions app mounts endpoints directly under /api/v1/

export default {
  // Plans
  getPlans: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/`, { params }),
  getPlan: (id) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/${id}/`),
  getPlanDetails: (id) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/${id}/detail_view/`),
  comparePlans: (currentPlanId, targetPlanId) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/compare/`, { 
    params: { current_plan: currentPlanId, target_plan: targetPlanId } 
  }),
  compareMultiplePlans: (planIds) => api.post(`${SUBSCRIPTION_BASE_URL}/plans/compare_plans/`, { plan_ids: planIds }),

  // User subscriptions
  getSubscriptions: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/`, { params }),
  getSubscription: (id) => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/`),
  getMySubscription: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/current/`),
  getCurrentSubscription: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/current/`),
  createSubscription: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/`, data),
  updateSubscription: (id, data) => api.put(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/`, data),
  
  // Subscription management
  upgradeSubscription: (id, data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/upgrade/`, data),
  downgradeSubscription: (id, data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/downgrade/`, data),
  cancelSubscription: (id) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/cancel/`),
  reactivateSubscription: (id) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/reactivate/`),
  
  // Usage and billing
  getUsage: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/usage/`, { params }),
  getUsageHistory: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/usage_history/`),
  getBillingHistory: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/billing_history/`),
  
  // Enhanced analytics
  getDetailedAnalytics: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/detailed_analytics/`),
  getSubscriptionAnalytics: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/analytics/`, { params }),
  
  // Plan-specific endpoints
  getPlanTestimonials: (planId) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/${planId}/testimonials/`),
  getPlanFAQs: (planId) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/${planId}/faqs/`),
  
  // Company subscriptions
  getCompanySubscriptions: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/company-subscriptions/`, { params }),
  getCompanySubscriptionSummary: () => api.get(`${SUBSCRIPTION_BASE_URL}/company-subscriptions/summary/`),
  
  // Features API - using correct admin_permissions URLs
  getAvailableFeatures: (planType = null) => {
    const params = planType ? { plan_type: planType } : {};
    return api.get(`/api/permissions/features/available/`, { params });
  },
  getPlanFeatures: (planType) => api.get(`/api/permissions/features/available/`, { params: { plan_type: planType } }),
  
  // Conversion tracking and analytics
  trackPlanView: (planId) => api.post(`${SUBSCRIPTION_BASE_URL}/analytics/plan_view/`, { plan_id: planId }),
  trackUpgradeIntent: (planId) => api.post(`${SUBSCRIPTION_BASE_URL}/analytics/upgrade_intent/`, { plan_id: planId }),
  trackConversionEvent: (eventType, planId, additionalData = {}) => api.post(`${SUBSCRIPTION_BASE_URL}/analytics/conversion_event/`, {
    event_type: eventType,
    plan_id: planId,
    ...additionalData
  }),
  
  // ROI and cost calculations
  calculateUpgradeBenefits: (currentPlanId, targetPlanId) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/upgrade_benefits/`, {
    params: { current_plan: currentPlanId, target_plan: targetPlanId }
  }),
  calculateCostSavings: (currentPlanId, targetPlanId) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/cost_savings/`, {
    params: { current_plan: currentPlanId, target_plan: targetPlanId }
  }),

  // Payment Methods
  getPaymentMethods: () => api.get(`${SUBSCRIPTION_BASE_URL}/payment-methods/`),
  addPaymentMethod: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/payment-methods/`, data),
  removePaymentMethod: (paymentMethodId) => api.delete(`${SUBSCRIPTION_BASE_URL}/payment-methods/${paymentMethodId}/`),
  setDefaultPaymentMethod: (paymentMethodId) => api.post(`${SUBSCRIPTION_BASE_URL}/payment-methods/${paymentMethodId}/set_default/`),
  createSetupIntent: () => api.post(`${SUBSCRIPTION_BASE_URL}/payment-methods/create_setup_intent/`),
  
  // Subscription Payments
  createSubscriptionPayment: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscription-payments/create_subscription_payment/`, data),
  upgradeSubscriptionPayment: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscription-payments/upgrade_subscription_payment/`, data),
  processPaymentIntent: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscription-payments/process_payment_intent/`, data),
};
