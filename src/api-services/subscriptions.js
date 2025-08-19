import api from './crud';

const SUBSCRIPTION_BASE_URL = '/api/v1'; // subscriptions app mounts endpoints directly under /api/v1/

export default {
  // Plans
  getPlans: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/`, { params }),
  getPlan: (id) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/${id}/`),

  // User subscriptions
  getSubscriptions: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/`, { params }),
  getMySubscription: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/my/`),
  createSubscription: (data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/`, data),
  updateSubscription: (id, data) => api.put(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/`, data),
  cancelSubscription: (id) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/cancel/`),
};
