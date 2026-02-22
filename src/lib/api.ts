// API Configuration and Utilities
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Client Class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    try {
      const data = await response.json();
      
      if (response.ok) {
        return { data, status };
      } else {
        return {
          error: data.detail || data.message || 'An error occurred',
          status,
        };
      }
    } catch (error) {
      return {
        error: response.ok ? 'Failed to parse response' : 'Network error',
        status,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Permission-specific API functions
export const permissionApi = {
  // Get user permissions
  async getUserPermissions(userId?: string): Promise<ApiResponse<any>> {
    const endpoint = userId 
      ? `/api/permissions/admin/user-permissions/${userId}/`
      : '/api/permissions/user-permissions/';
    return apiClient.get(endpoint);
  },

  // Check feature access
  async checkFeatureAccess(featureCode: string): Promise<ApiResponse<{ has_access: boolean; reason?: string }>> {
    return apiClient.post('/api/permissions/check-feature-access/', { feature_code: featureCode });
  },

  // Check subscription access
  async checkSubscriptionAccess(planType: string): Promise<ApiResponse<{ has_access: boolean; current_plan?: string }>> {
    return apiClient.post('/api/permissions/check-subscription-access/', { plan_type: planType });
  },

  // Get available features
  async getAvailableFeatures(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/permissions/features/available/');
  },

  // Admin: Get all users
  async getUsers(page?: number, search?: string): Promise<ApiResponse<PaginatedResponse<any>>> {
    let endpoint = '/api/users/';
    const params = new URLSearchParams();
    
    if (page) params.append('page', page.toString());
    if (search) params.append('search', search);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return apiClient.get(endpoint);
  },

  // Admin: Grant user permission
  async grantUserPermission(userId: string, featureCode: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/permissions/admin/grant-user-permission/', {
      user_id: userId,
      feature_code: featureCode,
      reason,
    });
  },

  // Admin: Revoke user permission
  async revokeUserPermission(userId: string, featureCode: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/permissions/admin/revoke-user-permission/', {
      user_id: userId,
      feature_code: featureCode,
      reason,
    });
  },

  // Admin: Get features
  async getFeatures(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get('/api/permissions/admin/features/');
  },

  // Admin: Create feature
  async createFeature(featureData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/permissions/admin/features/', featureData);
  },

  // Admin: Update feature
  async updateFeature(featureCode: string, featureData: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/permissions/admin/features/${featureCode}/`, featureData);
  },

  // Admin: Delete feature
  async deleteFeature(featureCode: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/permissions/admin/features/${featureCode}/`);
  },

  // Admin: Get analytics stats
  async getAnalyticsStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/permissions/admin/analytics/stats/');
  },

  // Admin: Get usage metrics
  async getUsageMetrics(timeframe: string = '7d'): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/permissions/admin/analytics/usage/?timeframe=${timeframe}`);
  },

  // Admin: Bulk permission operations
  async bulkPermissionOperation(operation: 'grant' | 'revoke', data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/permissions/admin/bulk-operations/', {
      operation,
      ...data,
    });
  },

  // Admin: Export user permissions
  async exportUserPermissions(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/permissions/admin/export/user-permissions/?format=${format}`);
  },

  // Get subscription details
  async getSubscriptionDetails(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/subscriptions/details/');
  },

  // Get feature usage stats for current user
  async getUserFeatureUsage(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/permissions/user-feature-usage/');
  },
};

// Authentication API functions
export const authApi = {
  // Login
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return apiClient.post('/api/auth/login/', { email, password });
  },

  // Register
  async register(userData: any): Promise<ApiResponse<{ token: string; user: any }>> {
    return apiClient.post('/api/auth/register/', userData);
  },

  // Logout
  async logout(): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/api/auth/logout/');
    if (response.status === 200) {
      localStorage.removeItem('token');
    }
    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/auth/user/');
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/api/auth/refresh/');
  },

  // Reset password
  async resetPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/password-reset/', { email });
  },

  // Confirm password reset
  async confirmPasswordReset(token: string, password: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/password-reset-confirm/', { token, password });
  },
};

// Utility functions for API responses
export const apiUtils = {
  // Check if response is successful
  isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
    return response.status >= 200 && response.status < 300 && !response.error;
  },

  // Extract error message from response
  getErrorMessage(response: ApiResponse<any>): string {
    return response.error || 'An unknown error occurred';
  },

  // Handle authentication errors
  handleAuthError(response: ApiResponse<any>): boolean {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return true;
    }
    return false;
  },

  // Retry function for failed requests
  async retry<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastResponse: ApiResponse<T>;
    
    for (let i = 0; i <= maxRetries; i++) {
      lastResponse = await apiCall();
      
      if (this.isSuccess(lastResponse) || lastResponse.status < 500) {
        return lastResponse;
      }
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    
    return lastResponse!;
  },

  // Format validation errors
  formatValidationErrors(response: ApiResponse<any>): Record<string, string[]> {
    if (response.status === 400 && response.data) {
      return response.data;
    }
    return {};
  },
};

// Export types
export type { ApiClient };
export default apiClient;
