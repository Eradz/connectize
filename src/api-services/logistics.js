import api from './crud';

const LOGISTICS_BASE_URL = '/api/v1/logistics';

export const logisticsAPI = {
  // Logistics Providers
  getProviders: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/providers/`, { params }),
  getProvider: (id) => api.get(`${LOGISTICS_BASE_URL}/providers/${id}/`),
  createProvider: (data) => api.post(`${LOGISTICS_BASE_URL}/providers/`, data),
  updateProvider: (id, data) => api.put(`${LOGISTICS_BASE_URL}/providers/${id}/`, data),
  searchProviders: (params) => api.get(`${LOGISTICS_BASE_URL}/providers/search/`, { params }),
  
  // Shipment Requests
  getRequests: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/requests/`, { params }),
  getRequest: (id) => api.get(`${LOGISTICS_BASE_URL}/requests/${id}/`),
  createRequest: (data) => api.post(`${LOGISTICS_BASE_URL}/requests/`, data),
  updateRequest: (id, data) => api.put(`${LOGISTICS_BASE_URL}/requests/${id}/`, data),
  deleteRequest: (id) => api.delete(`${LOGISTICS_BASE_URL}/requests/${id}/`),
  publishRequest: (id) => api.post(`${LOGISTICS_BASE_URL}/requests/${id}/publish/`),
  awardRequest: (id, data) => api.post(`${LOGISTICS_BASE_URL}/requests/${id}/award/`, data),
  getRequestQuotes: (id) => api.get(`${LOGISTICS_BASE_URL}/requests/${id}/quotes/`),
  
  // Shipment Quotes
  getQuotes: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/quotes/`, { params }),
  getQuote: (id) => api.get(`${LOGISTICS_BASE_URL}/quotes/${id}/`),
  createQuote: (data) => api.post(`${LOGISTICS_BASE_URL}/quotes/`, data),
  updateQuote: (id, data) => api.put(`${LOGISTICS_BASE_URL}/quotes/${id}/`, data),
  
  // Active Shipments
  getShipments: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/shipments/`, { params }),
  getShipment: (id) => api.get(`${LOGISTICS_BASE_URL}/shipments/${id}/`),
  updateShipmentStatus: (id, data) => api.post(`${LOGISTICS_BASE_URL}/shipments/${id}/update_status/`, data),
  getShipmentTracking: (id) => api.get(`${LOGISTICS_BASE_URL}/shipments/${id}/tracking/`),
  
  // Tracking Events
  getTrackingEvents: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/tracking/`, { params }),
  
  // Supply Chain Optimization
  getOptimizationReports: () => api.get(`${LOGISTICS_BASE_URL}/optimization/`),
  getOptimizationReport: (id) => api.get(`${LOGISTICS_BASE_URL}/optimization/${id}/`),
  generateOptimizationReport: (data) => api.post(`${LOGISTICS_BASE_URL}/optimization/generate_report/`, data),
  createOptimizationReport: (data) => api.post(`${LOGISTICS_BASE_URL}/optimization/`, data),
};

export default logisticsAPI;
