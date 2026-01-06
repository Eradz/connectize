import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { subscriptionsAPI } from "../api-services/subscriptions";
import { loginForTesting, isTestAuthActive } from "../lib/testAuth";
import { makeApiRequest } from "../lib/helpers";

// Create the context
const SubscriptionContext = createContext();

// Create the provider component
export const SubscriptionProvider = ({ children }) => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [features, setFeatures] = useState({});
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [enhancedFeatures, setEnhancedFeatures] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('[SubscriptionProvider] Render - currentSubscription:', currentSubscription?.plan?.name || 'null', 'loading:', loading);

  /**
   * Safe extract function to handle various API response structures
   */
  const safeExtract = (result, defaultValue = null) => {
    if (result.status === 'fulfilled' && (result.value?.data || result.value)) {
      return result.value.data || result.value;
    }
    return defaultValue;
  };

  /**
   * Fetch all subscription data
   */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize auth if needed
      if (!isTestAuthActive()) {
        try {
          await loginForTesting();
        } catch (error) {
          console.warn('❌ Failed to enable test authentication:', error);
        }
      }

      const [
        subscriptionResult,
        plansResult,
        featuresResult,
        usageResult,
        analyticsResult,
        billingResult,
        paymentMethodsResult
      ] = await Promise.allSettled([
        subscriptionsAPI.getCurrentSubscription(),
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getAvailableFeatures(),
        subscriptionsAPI.getUsage(),
        subscriptionsAPI.getSubscriptionAnalytics(),
        subscriptionsAPI.getBillingHistory(),
        subscriptionsAPI.getPaymentMethods()
      ]);

      const subscriptionData = safeExtract(subscriptionResult, {});
      const plansData = safeExtract(plansResult, { results: [] });
      const featuresData = safeExtract(featuresResult, { features_by_category: {} });
      const usageData = safeExtract(usageResult, {});
      const analyticsData = safeExtract(analyticsResult, {});
      const billingData = safeExtract(billingResult, { results: [] });
      const paymentMethodsData = safeExtract(paymentMethodsResult, { results: [] });

      // Update state with extracted data
      const subscription = subscriptionData?.subscription || subscriptionData;
      const subscriptionUsage = subscriptionData?.usage || usageData;

      setCurrentSubscription(subscription);
      setAvailablePlans(plansData?.results || plansData || []);
      setFeatures(featuresData?.features_by_category || featuresData || {});
      setUsage(subscriptionUsage);
      setAnalytics(analyticsData);
      setBillingHistory(billingData?.results || billingData || []);
      setPaymentMethods(paymentMethodsData?.results || paymentMethodsData || []);

      // Handle enhanced features for the current plan
      if (subscriptionResult.status === 'fulfilled' && subscriptionResult.value?.data?.plan_features?.id) {
        try {
          console.log("Fetching enhanced features for plan:", subscriptionResult.value.data.plan_features.id);
          const enhancedResult = await makeApiRequest({
            url: `api/permissions/api/v2/enhanced-plans/${subscriptionResult.value.data.plan_features.id}/`,
            method: 'GET'
          });

          if (enhancedResult?.features && Object.keys(enhancedResult.features).length > 0) {
            setEnhancedFeatures(enhancedResult);
          }
        } catch (enhancedError) {
          console.warn('Failed to load enhanced features:', enhancedError?.message);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching subscription data:', error);
      setError(`Failed to load subscription data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /**
   * Refetch subscription data without full reload
   */
  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  /**
   * Check if a specific plan is the current user's plan
   */
  const isCurrentUserPlan = useCallback((plan) => {
    if (!plan || !currentSubscription?.plan) return false;
    return currentSubscription.plan.id === plan.id || 
           currentSubscription.plan.name === plan.name;
  }, [currentSubscription]);

  /**
   * Get the current user's plan
   */
  const getCurrentPlan = useCallback(() => {
    return currentSubscription?.plan || null;
  }, [currentSubscription]);

  /**
   * Utility function to get currency symbol
   */
  const getCurrencySymbol = (currencyCode) => {
    const currencyMap = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NZD': 'NZ$'
    };
    return currencyMap[currencyCode?.toUpperCase()] || currencyCode || '$';
  };

  /**
   * Export billing history to CSV
   */
  const exportBillingHistoryToCSV = (billingData = billingHistory) => {
    if (!billingData || billingData.length === 0) {
      alert('No billing history to export');
      return;
    }

    const headers = ['Transaction ID', 'Type', 'Amount', 'Currency', 'Status', 'Plan', 'Date', 'Description'];
    
    const rows = billingData.map(transaction => [
      transaction?.id || 'N/A',
      transaction?.transaction_type === 'subscription' ? 'Subscription' : 'Payment',
      transaction?.amount || '0.00',
      transaction?.currency || 'USD',
      transaction?.display_info?.is_failed ? 'Failed' : 
      transaction?.display_info?.is_pending ? 'Pending' : 'Completed',
      transaction?.plan_info?.name || 'N/A',
      new Date(transaction?.display_info?.transaction_date || transaction?.processed_at).toLocaleDateString('en-GB'),
      transaction?.description || transaction?.plan_info?.name || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `billing-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contextValue = React.useMemo(
    () => ({
      // State
      currentSubscription,
      availablePlans,
      features,
      usage,
      analytics,
      billingHistory,
      enhancedFeatures,
      paymentMethods,
      loading,
      error,

      // Methods
      refetch,
      isCurrentUserPlan,
      getCurrentPlan,
      getCurrencySymbol,
      exportBillingHistoryToCSV,
      setCurrentSubscription,
      setAvailablePlans,
      setFeatures,
      setUsage,
      setAnalytics,
      setBillingHistory,
      setEnhancedFeatures,
      setPaymentMethods,
    }),
    [
      currentSubscription,
      availablePlans,
      features,
      usage,
      analytics,
      billingHistory,
      enhancedFeatures,
      paymentMethods,
      loading,
      error,
      refetch,
      isCurrentUserPlan,
      getCurrentPlan,
      getCurrencySymbol,
      exportBillingHistoryToCSV,
    ]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Hook to use the subscription context
 */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
