import api from './crud';

const logistics = {
  // Shipment Requests
  getShipmentRequests: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making requests API call to:', '/api/v1/logistics/requests/', 'with params:', cleanParams);
    const response = await api.get('/api/v1/logistics/requests/', { params: cleanParams });
    return response.data;
  },

  getShipmentRequest: async (id) => {
    const response = await api.get(`/api/v1/logistics/requests/${id}/`);
    return response.data;
  },

  createShipmentRequest: async (data) => {
    const response = await api.post('/api/v1/logistics/requests/', data);
    return response.data;
  },

  updateShipmentRequest: async (id, data) => {
    const response = await api.put(`/api/v1/logistics/requests/${id}/`, data);
    return response.data;
  },

  deleteShipmentRequest: async (id) => {
    const response = await api.delete(`/api/v1/logistics/requests/${id}/`);
    return response.data;
  },

  // Shipments
  getShipments: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/shipments/', { params });
    return response.data;
  },

  getShipment: async (id) => {
    const response = await api.get(`/api/v1/logistics/shipments/${id}/`);
    return response.data;
  },

  createShipment: async (data) => {
    const response = await api.post('/api/v1/logistics/shipments/', data);
    return response.data;
  },

  updateShipment: async (id, data) => {
    const response = await api.put(`/api/v1/logistics/shipments/${id}/`, data);
    return response.data;
  },

  deleteShipment: async (id) => {
    const response = await api.delete(`/api/v1/logistics/shipments/${id}/`);
    return response.data;
  },

  // Shipment Tracking
  getShipmentTracking: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/tracking/', { params });
    return response.data;
  },

  // Get tracking for a specific shipment ID
  getShipmentTrackingById: async (shipmentId) => {
    const response = await api.get(`/api/v1/logistics/shipments/${shipmentId}/tracking/`);
    return response.data;
  },

  updateShipmentTracking: async (id, data) => {
    const response = await api.put(`/api/v1/logistics/tracking/${id}/`, data);
    return response.data;
  },

  // Quotes
  getShipmentQuotes: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/quotes/', { params });
    return response.data;
  },

  // Get quotes for a specific request
  getRequestQuotes: async (requestId) => {
    const response = await api.get(`/api/v1/logistics/requests/${requestId}/quotes/`);
    return response.data;
  },

  createShipmentQuote: async (data) => {
    const response = await api.post('/api/v1/logistics/quotes/', data);
    return response.data;
  },

  // Logistics Providers
  getLogisticsProviders: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/providers/', { params });
    return response.data;
  },

  // Get available providers for requests
  getAvailableProviders: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/providers/', { params });
    return response.data;
  },

  createLogisticsProvider: async (data) => {
    const response = await api.post('/api/v1/logistics/providers/', data);
    return response.data;
  },

  updateLogisticsProvider: async (id, data) => {
    const response = await api.put(`/api/v1/logistics/providers/${id}/`, data);
    return response.data;
  },

  deleteLogisticsProvider: async (id) => {
    const response = await api.delete(`/api/v1/logistics/providers/${id}/`);
    return response.data;
  },

  // Inventory Items
  getInventoryItems: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/inventory-items/', { params });
    return response.data;
  },

  createInventoryItem: async (data) => {
    const response = await api.post('/api/v1/logistics/inventory-items/', data);
    return response.data;
  },

  updateInventoryItem: async (id, data) => {
    const response = await api.put(`/api/v1/logistics/inventory-items/${id}/`, data);
    return response.data;
  },

  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/api/v1/logistics/inventory-items/${id}/`);
    return response.data;
  },

  // Inventory Categories
  getInventoryCategories: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/inventory-categories/', { params });
    return response.data;
  },

  // Inventory Movements
  getInventoryMovements: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/inventory-movements/', { params });
    return response.data;
  },

  createInventoryMovement: async (data) => {
    const response = await api.post('/api/v1/logistics/inventory-movements/', data);
    return response.data;
  },

  // Inventory Alerts
  getInventoryAlerts: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/inventory-alerts/', { params });
    return response.data;
  },

  markAlertRead: async (id) => {
    const response = await api.patch(`/api/v1/logistics/inventory-alerts/${id}/`, {
      is_read: true
    });
    return response.data;
  },

  // Bulk operations
  bulkUpdateShipments: async (ids, data) => {
    const response = await api.post('/api/v1/logistics/shipments/bulk_update/', {
      ids,
      ...data
    });
    return response.data;
  },

  bulkDeleteShipments: async (ids) => {
    const response = await api.post('/api/v1/logistics/shipments/bulk_delete/', {
      ids
    });
    return response.data;
  },

  // Export data
  exportShipments: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/logistics/shipments/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  // Statistics
  getLogisticsStats: async () => {
    const response = await api.get('/api/v1/logistics/stats/');
    return response.data;
  },

  // Aliases for backward compatibility
  getRequests: function(params) { return this.getShipmentRequests(params); },
  getRequest: function(id) { return this.getShipmentRequest(id); },
  updateRequest: function(id, data) { return this.updateShipmentRequest(id, data); },
  deleteRequest: function(id) { return this.deleteShipmentRequest(id); },
  updateShipmentStatus: function(id, data) { return this.updateShipment(id, data); },
  adjustStock: function(id, data) { return this.updateInventoryItem(id, data); },
  getTrackingById: function(id) { return this.getShipmentTrackingById(id); },
};

export default logistics;
export const logisticsAPI = logistics;
