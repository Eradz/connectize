import api from './crud';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) =>
      value !== undefined && value !== null && value !== 'all' && value !== ''
    )
  );

const logistics = {
  // Shipment Requests
  getShipmentRequests: async (params = {}) => {
    try {
      const requestParams = cleanParams(params);
      console.log('🔗 Making requests API call to:', '/api/v1/logistics/requests/', 'with params:', requestParams);
      const response = await api.get('/api/v1/logistics/requests/', { params: requestParams });
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

  // ==================== PROVIDER DASHBOARD ====================
  
  // Get shipment requests awarded to the current provider
  getMyAwardedRequests: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/requests/my-awarded/', { params });
    return response.data;
  },

  // Get all quotes submitted by the current provider
  getMyQuotes: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/requests/my-quotes/', { params });
    return response.data;
  },

  // Get provider's assigned shipments (already exists in ShipmentViewSet via queryset)
  getMyShipments: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/shipments/', { params });
    return response.data;
  },

  // ==================== QUOTES ====================
  
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

  // Alias for createShipmentQuote
  createQuote: async (data) => {
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

  // Get current user's provider profile
  getMyProviderProfile: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/providers/my_profile/', {
      params: cleanParams(params),
    });
    return response.data;
  },

  // Get available providers for requests
  getAvailableProviders: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/providers/', { params });
    return response.data;
  },

  // Search providers
  searchProviders: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/providers/search/', { params });
    return response.data;
  },

  createLogisticsProvider: async (data) => {
    try {
      const response = await api.post('/api/v1/logistics/providers/', data);
      // api.post returns { data: actualData } or { data: null } on error
      if (!response || response.data === null || response.data === undefined) {
        throw new Error('Failed to create provider - please check your session and try again');
      }
      return response.data;
    } catch (error) {
      console.error('Create provider error:', error);
      // Re-throw to allow component to handle
      throw error;
    }
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

  // Calculate rates for a shipment request
  calculateRates: async (requestId, options = {}) => {
    try {
      console.log('💰 Calculating rates for request:', requestId, 'options:', options);
      const response = await api.post(`/api/v1/logistics/requests/${requestId}/calculate-rates/`, options);
      console.log('💰 Rates calculated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Calculate rates error:', error);
      // Return empty providers if not authorized or error
      if (error.response?.status === 403) {
        console.log('⚠️ User not authorized to view rates');
        return { providers: [], metadata: { error: 'Not authorized' } };
      }
      throw error;
    }
  },

  // Assign provider to a shipment request
  assignProvider: async (requestId, providerId, serviceCode = null) => {
    try {
      console.log('🤝 Assigning provider:', providerId, 'to request:', requestId);
      const response = await api.post(`/api/v1/logistics/requests/${requestId}/award-to-provider/`, {
        provider_name: providerId,
        service_code: serviceCode
      });
      console.log('🤝 Provider assigned:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Assign provider error:', error);
      throw error;
    }
  },

  // Status update methods for requests
  approveRequest: async (id) => {
    const response = await api.patch(`/api/v1/logistics/requests/${id}/`, {
      status: 'posted'
    });
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await api.patch(`/api/v1/logistics/requests/${id}/`, {
      status: 'cancelled'
    });
    return response.data;
  },

  // ==========================================
  // Provider API Integration Settings
  // ==========================================
  
  // Get provider API settings
  getProviderAPISettings: async () => {
    const response = await api.get('/api/v1/logistics/providers/api_settings/');
    return response.data;
  },

  // Update provider API settings
  updateProviderAPISettings: async (data) => {
    const response = await api.patch('/api/v1/logistics/providers/api_settings/', data);
    return response.data;
  },

  // Test provider API connection
  testProviderAPIConnection: async () => {
    const response = await api.post('/api/v1/logistics/providers/test_api_connection/');
    return response.data;
  },

  // Get webhook logs
  getProviderWebhookLogs: async () => {
    const response = await api.get('/api/v1/logistics/providers/webhook_logs/');
    return response.data;
  },

  // Generate new webhook secret
  generateWebhookSecret: async () => {
    const response = await api.post('/api/v1/logistics/providers/generate_webhook_secret/');
    return response.data;
  },

  // ==================== LOGISTICS NOTIFICATIONS ====================

  // Get logistics-specific notifications
  getLogisticsNotifications: async () => {
    const response = await api.get('/api/notifications/logistics/');
    return response.data;
  },

  // Mark all logistics notifications as read
  markLogisticsNotificationsRead: async () => {
    const response = await api.post('/api/notifications/logistics-mark-all-read/');
    return response.data;
  },

  // Mark a single notification as read
  markNotificationRead: async (notificationId) => {
    const response = await api.post(`/api/notifications/${notificationId}/mark-as-read/`);
    return response.data;
  },

  // Cargo Types (admin-managed lookup)
  getCargoTypes: async (params = {}) => {
    const response = await api.get('/api/v1/logistics/cargo-types/', { params });
    return response.data;
  },

  // Award a quote on a shipment request
  awardRequest: async (requestId, data) => {
    const response = await api.post(`/api/v1/logistics/requests/${requestId}/award/`, data);
    return response.data;
  },

  // Patch a shipment request (partial update)
  patchRequest: async (requestId, data) => {
    const response = await api.patch(`/api/v1/logistics/requests/${requestId}/`, data);
    return response.data;
  },

  // Aliases for backward compatibility
  getRequests: function(params) { return this.getShipmentRequests(params); },
  getRequest: function(id) { return this.getShipmentRequest(id); },
  createRequest: function(data) { return this.createShipmentRequest(data); },
  updateRequest: function(id, data) { return this.updateShipmentRequest(id, data); },
  deleteRequest: function(id) { return this.deleteShipmentRequest(id); },
  deleteLogisticsRequest: function(id) { return this.deleteShipmentRequest(id); },
  getLogisticsRequests: function(params) { return this.getShipmentRequests(params); },
  updateShipmentStatus: function(id, data) { return this.updateShipment(id, data); },
  adjustStock: async function(id, data) {
    const response = await api.post(`/api/v1/logistics/inventory-items/${id}/adjust_stock/`, data);
    return response.data;
  },
  getTrackingById: function(id) { return this.getShipmentTrackingById(id); },
  awardToProvider: function(requestId, data) { return this.assignProvider(requestId, data.provider_id || data.provider_name, data.service_code); },
};

export default logistics;
export const logisticsAPI = logistics;
