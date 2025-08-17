import api from './crud';

const LOGISTICS_BASE_URL = '/api/v1/logistics';

export const logisticsAPI = {
  // Logistics Providers
  getAvailableProviders: () => api.get(`${LOGISTICS_BASE_URL}/providers/available/`),
  getProviders: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/providers/`, { params }),
  getProvider: (id) => api.get(`${LOGISTICS_BASE_URL}/providers/${id}/`),
  createProvider: (data) => api.post(`${LOGISTICS_BASE_URL}/providers/`, data),
  updateProvider: (id, data) => api.put(`${LOGISTICS_BASE_URL}/providers/${id}/`, data),
  searchProviders: (params) => api.get(`${LOGISTICS_BASE_URL}/providers/search/`, { params }),
  
  // Shipment Requests
  getRequests: (params = {}) => {
    console.log('🔗 Making requests API call to:', `${LOGISTICS_BASE_URL}/requests/`);
    return api.get(`${LOGISTICS_BASE_URL}/requests/`, { params });
  },
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
  
  // DHL Integration
  awardToDHL: (requestId, dhlConfig) => api.post(`${LOGISTICS_BASE_URL}/requests/${requestId}/award_to_dhl/`, dhlConfig),
  syncDHLTracking: (shipmentId) => api.post(`${LOGISTICS_BASE_URL}/shipments/${shipmentId}/sync_dhl_tracking/`),
  
  // Multi-Provider Integration - Enhanced
  getServiceTypes: () => api.get(`${LOGISTICS_BASE_URL}/service-types/`),
  
  // Enhanced rate calculation with automatic fetching
  calculateRates: (requestId, options = {}) => {
    const defaultOptions = {
      force_refresh: false,
      include_metadata: true,
      sort_by: 'rate'
    };
    return api.post(`${LOGISTICS_BASE_URL}/requests/${requestId}/calculate-rates/`, {
      ...defaultOptions,
      ...options
    });
  },
  
  // Award shipment to specific provider with service selection
  awardToProvider: (requestId, data) => {
    const requestData = {
      provider_name: data.provider_name,
      service_code: data.service_code || data.service_type,
      additional_services: data.additional_services || [],
      insurance_value: data.insurance_value,
      signature_required: data.signature_required || false,
      ...data
    };
    return api.post(`${LOGISTICS_BASE_URL}/requests/${requestId}/award-to-provider/`, requestData);
  },
  
  // Enhanced tracking with provider-specific handling
  syncTracking: (requestId, providerName = null) => api.post(`${LOGISTICS_BASE_URL}/requests/${requestId}/sync-tracking/`, { 
    provider_name: providerName,
    update_all: !providerName 
  }),
  
  // Provider health and status monitoring
  getProviderStatus: (providerName) => api.get(`${LOGISTICS_BASE_URL}/providers/${providerName}/status/`),
  getAllProviderStatus: () => api.get(`${LOGISTICS_BASE_URL}/providers/status/`),
  
  // Provider configuration management
  updateProviderConfig: (providerName, config) => api.patch(`${LOGISTICS_BASE_URL}/providers/${providerName}/config/`, config),
  testProviderConnection: (providerName) => api.post(`${LOGISTICS_BASE_URL}/providers/${providerName}/test/`),
  
  // Rate history and analytics
  getRateHistory: (requestId) => api.get(`${LOGISTICS_BASE_URL}/requests/${requestId}/rate-history/`),
  getProviderAnalytics: (timeframe = '30d') => api.get(`${LOGISTICS_BASE_URL}/analytics/providers/`, { 
    params: { timeframe } 
  }),
  
  // Tracking Events
  getTrackingEvents: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/tracking/`, { params }),
  
  // Supply Chain Optimization
  getOptimizationReports: () => api.get(`${LOGISTICS_BASE_URL}/optimization/`),
  getOptimizationReport: (id) => api.get(`${LOGISTICS_BASE_URL}/optimization/${id}/`),
  generateOptimizationReport: (data) => api.post(`${LOGISTICS_BASE_URL}/optimization/generate_report/`, data),
  createOptimizationReport: (data) => api.post(`${LOGISTICS_BASE_URL}/optimization/`, data),

  // Inventory Management
  getInventoryItems: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/inventory-items/`, { params }),
  getInventoryItem: (id) => api.get(`${LOGISTICS_BASE_URL}/inventory-items/${id}/`),
  createInventoryItem: (data) => api.post(`${LOGISTICS_BASE_URL}/inventory-items/`, data),
  updateInventoryItem: (id, data) => api.put(`${LOGISTICS_BASE_URL}/inventory-items/${id}/`, data),
  deleteInventoryItem: (id) => api.delete(`${LOGISTICS_BASE_URL}/inventory-items/${id}/`),
  adjustStock: (id, data) => api.post(`${LOGISTICS_BASE_URL}/inventory-items/${id}/adjust_stock/`, data),
  
  // Inventory Categories
  getInventoryCategories: () => api.get(`${LOGISTICS_BASE_URL}/inventory-categories/`),
  getInventoryCategory: (id) => api.get(`${LOGISTICS_BASE_URL}/inventory-categories/${id}/`),
  createInventoryCategory: (data) => api.post(`${LOGISTICS_BASE_URL}/inventory-categories/`, data),
  
  // Inventory Movements
  getInventoryMovements: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/inventory-movements/`, { params }),
  getInventoryMovement: (id) => api.get(`${LOGISTICS_BASE_URL}/inventory-movements/${id}/`),
  
  // Inventory Alerts
  getInventoryAlerts: (params = {}) => api.get(`${LOGISTICS_BASE_URL}/inventory-alerts/`, { params }),
  getInventoryAlert: (id) => api.get(`${LOGISTICS_BASE_URL}/inventory-alerts/${id}/`),
  acknowledgeAlert: (id) => api.post(`${LOGISTICS_BASE_URL}/inventory-alerts/${id}/acknowledge/`),
};

export default logisticsAPI;
