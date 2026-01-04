import api from './crud';

const logistics = {
  // Shipment Requests
  getShipmentRequests: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
      console.log('🔗 Making requests API call to:', '/api/v1/logistics/requests/', 'with params:', cleanParams);
      const response = await api.get('/api/v1/logistics/requests/', { params: cleanParams });
      console.log('📋 Requests API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Requests API error:', error);
      throw error;
    }
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
    const response = await api.patch(`/api/v1/logistics/requests/${id}/`, data);
    return response.data;
  },

  deleteShipmentRequest: async (id) => {
    const response = await api.delete(`/api/v1/logistics/requests/${id}/`);
    return response.data;
  },

  // Shipments
  getShipments: async (params = {}) => {
    try {
      console.log('🚛 Making shipments API call with params:', params);
      const response = await api.get('/api/v1/logistics/shipments/', { params });
      console.log('🚛 Shipments API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Shipments API error:', error);
      throw error;
    }
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
    const response = await api.patch(`/api/v1/logistics/shipments/${id}/`, data);
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
    try {
      console.log('🏢 Making providers API call with params:', params);
      const response = await api.get('/api/v1/logistics/providers/', { params });
      console.log('🏢 Providers API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Providers API error:', error);
      throw error;
    }
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
    const response = await api.patch(`/api/v1/logistics/providers/${id}/`, data);
    return response.data;
  },

  deleteLogisticsProvider: async (id) => {
    const response = await api.delete(`/api/v1/logistics/providers/${id}/`);
    return response.data;
  },

  // Inventory Items
  getInventoryItems: async (params = {}) => {
    try {
      console.log('📦 Making inventory API call with params:', params);
      const response = await api.get('/api/v1/logistics/inventory-items/', { params });
      console.log('📦 Inventory API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Inventory API error:', error);
      throw error;
    }
  },

  getInventoryItem: async (id) => {
    try {
      console.log('📦 Fetching single inventory item:', id);
      const response = await api.get(`/api/v1/logistics/inventory-items/${id}/`);
      console.log('📦 Item data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching inventory item:', error);
      throw error;
    }
  },

  createInventoryItem: async (data) => {
    const response = await api.post('/api/v1/logistics/inventory-items/', data);
    return response.data;
  },

  updateInventoryItem: async (id, data) => {
    const response = await api.patch(`/api/v1/logistics/inventory-items/${id}/`, data);
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

  // Inventory Field Choices (for dropdowns)
  getInventoryFieldChoices: async () => {
    try {
      console.log('📋 Fetching inventory field choices...');
      const response = await api.get('/api/v1/logistics/inventory-items/field_choices/');
      console.log('📋 Field choices received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching field choices:', error);
      throw error;
    }
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
    try {
      console.log('📥 Exporting shipments with filters:', filters);
      const response = await api.get('/api/v1/logistics/shipments/export/', {
        // NOTE: DRF treats `format=` as content-negotiation in some setups and can return 404.
        // Use a different param name and let the backend treat it as a hint.
        params: { export_format: format, ...filters },
        responseType: 'blob'
      });
      console.log('📥 Export response:', response);
      console.log('📥 Export completed, blob size:', response?.data?.size, 'type:', response?.data?.type);
      
      // Check if response or response.data is null/undefined
      if (!response || !response.data) {
        console.error('❌ Response is null/undefined:', response);
        throw new Error('Server returned empty response');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Export shipments error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data type:', typeof error.response?.data);
      
      // If error response data is a blob (HTML error page), try to read it
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.error('❌ Error response body (first 200 chars):', text.substring(0, 200));
        } catch (e) {
          console.error('❌ Could not read error blob');
        }
      }
      
      throw error;
    }
  },

  downloadShipment: async (id) => {
    try {
      console.log('📥 Downloading shipment:', id);
      const response = await api.get(`/api/v1/logistics/shipments/${id}/download/`, {
        responseType: 'blob'
      });
      console.log('📥 Shipment download completed, blob size:', response.data?.size);
      return response.data;
    } catch (error) {
      console.error('❌ Shipment download error:', error);
      throw error;
    }
  },

  exportInventoryItems: async (filters = {}) => {
    try {
      console.log('📥 Exporting inventory items with filters:', filters);
      const response = await api.get('/api/v1/logistics/inventory-items/export/', {
        params: filters,
        responseType: 'blob'
      });
      console.log('📥 Export completed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Export error:', error);
      throw error;
    }
  },

  // Statistics
  getLogisticsStats: async () => {
    const response = await api.get('/api/v1/logistics/stats/');
    return response.data;
  },

  // Status update methods for requests
  approveRequest: async (id) => {
    const response = await api.patch(`/api/v1/logistics/requests/${id}/`, {
      status: 'approved'
    });
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await api.patch(`/api/v1/logistics/requests/${id}/`, {
      status: 'rejected'
    });
    return response.data;
  },

  // Aliases for backward compatibility
  getRequests: function(params) { return this.getShipmentRequests(params); },
  getRequest: function(id) { return this.getShipmentRequest(id); },
  updateRequest: function(id, data) { return this.updateShipmentRequest(id, data); },
  deleteRequest: function(id) { return this.deleteShipmentRequest(id); },
  deleteLogisticsRequest: function(id) { return this.deleteShipmentRequest(id); },
  getLogisticsRequests: function(params) { return this.getShipmentRequests(params); },
  updateShipmentStatus: function(id, data) { return this.updateShipment(id, data); },
  adjustStock: function(id, data) { return this.updateInventoryItem(id, data); },
  getTrackingById: function(id) { return this.getShipmentTrackingById(id); },
};

export default logistics;
export const logisticsAPI = logistics;
