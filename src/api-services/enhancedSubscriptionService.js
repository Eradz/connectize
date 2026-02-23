/**
 * Enhanced Subscription API Service
 * Provides comprehensive subscription management with features, analytics, and billing
 */

const API_BASE_URL = '/api/permissions/api/v2';

class EnhancedSubscriptionService {
  
  // Subscription Management
  async getCurrentSubscription() {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/current/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }

  async getSubscriptionFeatures() {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/features/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription features:', error);
      throw error;
    }
  }

  async getUsageAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/analytics/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      throw error;
    }
  }

  // Plan Management
  async getEnhancedPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-plans/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching enhanced plans:', error);
      throw error;
    }
  }

  async getPlanComparison() {
    try {
      const response = await fetch(`${API_BASE_URL}/plans/comparison/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching plan comparison:', error);
      throw error;
    }
  }

  async getUpgradePreview(planId) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-plans/${planId}/upgrade_preview/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching upgrade preview:', error);
      throw error;
    }
  }

  // Feature Management
  async getFeaturesByCategory() {
    try {
      const response = await fetch(`${API_BASE_URL}/features/by-category/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching features by category:', error);
      throw error;
    }
  }

  async checkFeatureAccess(featureCodes) {
    try {
      const response = await fetch(`${API_BASE_URL}/features/check-access/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ feature_codes: featureCodes })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking feature access:', error);
      throw error;
    }
  }

  // Subscription Actions
  async upgradeSubscription(planId, paymentMethodId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/upgrade/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ 
          plan_id: planId,
          payment_method_id: paymentMethodId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  async downgradeSubscription(planId, effectiveDate = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/downgrade/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ 
          plan_id: planId,
          effective_date: effectiveDate
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(reason = null, effectiveDate = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ 
          reason: reason,
          effective_date: effectiveDate
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateAutoRenewal(autoRenew) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/auto-renewal/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ auto_renew: autoRenew })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating auto renewal:', error);
      throw error;
    }
  }

  // Billing and Payment
  async getBillingHistory(page = 1, pageSize = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/enhanced-subscriptions/billing-history/?page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/invoice/${invoiceId}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async downloadInvoice(invoiceId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/enhanced-subscriptions/invoice/${invoiceId}/download/`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  // Analytics and Insights
  async getUsageTrends(timeframe = '30d') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/enhanced-subscriptions/usage-trends/?timeframe=${timeframe}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching usage trends:', error);
      throw error;
    }
  }

  async getFeatureUsageStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/feature-usage/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching feature usage stats:', error);
      throw error;
    }
  }

  async getRecommendations() {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-subscriptions/recommendations/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  // Utility Methods
  getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    
    // Fallback: try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    return null;
  }

  // Batch Operations
  async getSubscriptionOverview() {
    try {
      const [subscription, features, analytics, plans] = await Promise.all([
        this.getCurrentSubscription(),
        this.getSubscriptionFeatures(),
        this.getUsageAnalytics(),
        this.getEnhancedPlans()
      ]);

      return {
        subscription,
        features,
        analytics,
        plans: plans.results || plans
      };
    } catch (error) {
      console.error('Error fetching subscription overview:', error);
      throw error;
    }
  }

  async getPlanComparisonWithFeatures() {
    try {
      const [comparison, featuresData] = await Promise.all([
        this.getPlanComparison(),
        this.getFeaturesByCategory()
      ]);

      return {
        ...comparison,
        detailed_features: featuresData
      };
    } catch (error) {
      console.error('Error fetching plan comparison with features:', error);
      throw error;
    }
  }

  // Event Handlers for Real-time Updates
  onSubscriptionChange(callback) {
    // This would integrate with WebSocket or Server-Sent Events for real-time updates
    // For now, we'll use polling as a fallback
    const intervalId = setInterval(async () => {
      try {
        const subscription = await this.getCurrentSubscription();
        callback(subscription);
      } catch (error) {
        console.error('Error in subscription change polling:', error);
      }
    }, 30000); // Poll every 30 seconds

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  onUsageUpdate(callback) {
    // Similar real-time updates for usage data
    const intervalId = setInterval(async () => {
      try {
        const analytics = await this.getUsageAnalytics();
        callback(analytics);
      } catch (error) {
        console.error('Error in usage update polling:', error);
      }
    }, 60000); // Poll every minute

    return () => clearInterval(intervalId);
  }
}

// Create singleton instance
const enhancedSubscriptionService = new EnhancedSubscriptionService();

export default enhancedSubscriptionService;
export { EnhancedSubscriptionService };
