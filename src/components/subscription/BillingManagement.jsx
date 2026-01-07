import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import subscriptionsApi from '@/api-services/subscriptions';
import { getAuthorizationHeader } from '@/lib/helpers';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  ExternalLink,
  Settings,
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const BillingManagement = ({ setActiveTab, onUpdatePaymentMethod, activeTab }) => {
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalError, setRenewalError] = useState(null);
  const [renewalSuccess, setRenewalSuccess] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  // When user navigates back to Billing tab after adding a method, refresh methods
  useEffect(() => {
    if (activeTab === 'billing') {
      // Lightweight refresh of payment methods only
      subscriptionsApi.getPaymentMethods()
        .then(resp => {
          const data = resp?.data || resp;
          if (data?.payment_methods) setPaymentMethods(data.payment_methods);
          else if (Array.isArray(data)) setPaymentMethods(data);
        })
        .catch(() => {})
    }
  }, [activeTab]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing API service methods
      const [
        subscriptionResult,
        billingResult,
        usageResult,
        analyticsResult,
        paymentMethodsResult
      ] = await Promise.allSettled([
        subscriptionsApi.getCurrentSubscription(),
        subscriptionsApi.getBillingHistory(),
        subscriptionsApi.getUsage(),
        subscriptionsApi.getSubscriptionAnalytics(),
        subscriptionsApi.getPaymentMethods()
      ]);

      // Extract data safely
      const subscriptionData = subscriptionResult.status === 'fulfilled' ? 
        subscriptionResult.value?.data : null;
      
      const billingData = billingResult.status === 'fulfilled' ? 
        billingResult.value?.data : null;
      
      const usageData = usageResult.status === 'fulfilled' ? 
        usageResult.value?.data : null;
      
      const analyticsData = analyticsResult.status === 'fulfilled' ? 
        analyticsResult.value?.data : null;

      const paymentMethodsData = paymentMethodsResult.status === 'fulfilled' ? 
        paymentMethodsResult.value?.data : null;

      console.log('Billing API responses:', {
        subscription: subscriptionData,
        billing: billingData,
        usage: usageData,
        analytics: analyticsData,
        paymentMethods: paymentMethodsData
      });

      // Handle payment methods data
      if (paymentMethodsData?.payment_methods) {
        setPaymentMethods(paymentMethodsData.payment_methods);
      } else if (Array.isArray(paymentMethodsData)) {
        setPaymentMethods(paymentMethodsData);
      } else {
        setPaymentMethods([]);
      }

      // Handle subscription data
      if (subscriptionData?.subscription) {
        setSubscription(subscriptionData.subscription);
      } else if (subscriptionData) {
        setSubscription(subscriptionData);
      } else {
        // No subscription found - user might not have one yet
        setSubscription(null);
      }

      // Handle billing history
      console.log('Raw billing API response:', billingResult);
      
      if (billingResult.status === 'fulfilled') {
        const billingData = billingResult.value?.data;
        console.log('Billing data extracted:', billingData);
        
        // Handle different response structures
        if (billingData?.results && Array.isArray(billingData.results)) {
          // Paginated response from Django REST framework
          setBillingHistory(billingData.results);
          console.log('Set billing history from paginated results:', billingData.results.length, 'records');
        } else if (billingData?.data && Array.isArray(billingData.data)) {
          // Wrapped response from our updated API service
          setBillingHistory(billingData.data);
          console.log('Set billing history from wrapped data:', billingData.data.length, 'records');
        } else if (Array.isArray(billingData)) {
          // Direct array response
          setBillingHistory(billingData);
          console.log('Set billing history from direct array:', billingData.length, 'records');
        } else if (billingData?.billing_history && Array.isArray(billingData.billing_history)) {
          // Named property response
          setBillingHistory(billingData.billing_history);
          console.log('Set billing history from billing_history property:', billingData.billing_history.length, 'records');
        } else {
          // No billing history found or unknown structure
          console.log('No billing history found or unknown structure:', billingData);
          setBillingHistory([]);
        }
      } else {
        console.log('Billing API call failed:', billingResult.reason);
        setBillingHistory([]);
      }

      setUsage(usageData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBillingData();
    setRefreshing(false);
  };

  const handleDownloadInvoice = (billId) => {
    // Implementation for downloading invoice
    console.log('Downloading invoice for bill:', billId);
    // This would typically trigger a download or open a PDF
  };

  const handleUpdatePaymentMethod = () => {
    // Navigate to payment methods management
    if (setActiveTab) {
      setActiveTab('payment-methods');
    } else {
      // Fallback: Navigate to a payment methods page
      window.location.href = '/subscription/payment-methods';
    }
  };

  const handleAddPaymentMethod = () => {
    // Navigate to payment methods management to add new method
    if (setActiveTab) {
      setActiveTab('payment-methods');
    } else {
      // Fallback: Navigate to a payment methods page
      window.location.href = '/subscription/payment-methods';
    }
  };

  const handleViewAllInvoices = () => {
    // Implementation for viewing all invoices
    console.log('Viewing all invoices');
  };

  // Handle subscription renewal
  const handleRenewSubscription = async () => {
    if (!subscription?.id) return;
    
    try {
      setRenewalLoading(true);
      setRenewalError(null);
      
      // Check if user has a payment method
      if (paymentMethods.length === 0) {
        setRenewalError('Please add a payment method before renewing your subscription.');
        return;
      }
      
      // Call the renewal API
      const response = await subscriptionsApi.processRenewal(subscription.id);
      
      if (response?.data || response) {
        setRenewalSuccess('Your subscription has been renewed successfully!');
        // Refresh billing data to reflect the changes
        await fetchBillingData();
        setTimeout(() => setRenewalSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Error renewing subscription:', err);
      setRenewalError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        'Failed to renew subscription. Please try again or contact support.'
      );
    } finally {
      setRenewalLoading(false);
    }
  };

  // Navigate to plans to resubscribe
  const handleResubscribe = () => {
    if (setActiveTab) {
      setActiveTab('plans');
    } else {
      window.location.href = '/subscription?tab=plans';
    }
  };

  // Check if subscription period has expired (regardless of status)
  const isPeriodExpired = () => {
    if (!subscription?.current_period_end) return false;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    return endDate < now;
  };

  // Check if subscription needs renewal
  const needsRenewal = () => {
    if (!subscription) return false;
    const status = subscription.status?.toLowerCase();
    
    // Check explicit status
    if (['expired', 'cancelled', 'canceled', 'past_due', 'unpaid'].includes(status)) {
      return true;
    }
    
    // Also check if the period has expired (even if status hasn't updated)
    if (isPeriodExpired()) {
      return true;
    }
    
    return false;
  };

  // Check if subscription is about to expire (within 7 days)
  const isExpiringSoon = () => {
    if (!subscription?.current_period_end) return false;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'completed': 'bg-green-100 text-green-800',
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'overdue': 'bg-red-100 text-red-800',
      'refund': 'bg-blue-100 text-blue-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'completed': CheckCircle,
      'paid': CheckCircle,
      'pending': Clock,
      'failed': AlertCircle,
      'overdue': AlertCircle,
      'refund': RefreshCw
    };
    const IconComponent = iconMap[status?.toLowerCase()] || Clock;
    return IconComponent;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading billing information...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>No active subscription found. Please subscribe to a plan to view billing information.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab && setActiveTab('choose-plan')}
            >
              Choose Plan
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh and debug info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
          <p className="text-gray-600 mt-1">Manage your subscription billing and payment methods</p>
          {import.meta.env.DEV && (
            <p className="text-xs text-blue-600 mt-1">
              🔄 Data loaded from API • Last updated: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Renewal Success Message */}
      {renewalSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{renewalSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Renewal Error Message */}
      {renewalError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 flex items-center justify-between">
            <span>{renewalError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setRenewalError(null)}
              className="text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Renewal Alert - Shows when subscription is expired/cancelled */}
      {needsRenewal() && (
        <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {subscription?.status === 'cancelled' || subscription?.status === 'canceled' 
                      ? 'Subscription Cancelled' 
                      : subscription?.status === 'past_due'
                        ? 'Payment Overdue'
                        : 'Subscription Period Expired'}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {subscription?.status === 'past_due' 
                      ? 'Your payment is overdue. Please update your payment method or make a payment to continue service.'
                      : isPeriodExpired()
                        ? 'Your subscription billing period has ended. Renew now to continue enjoying premium features without interruption.'
                        : 'Your subscription has ended. Renew now to continue enjoying premium features.'}
                  </p>
                  {subscription?.current_period_end && (
                    <p className="text-xs text-red-600 mt-2">
                      Period ended: {formatDate(subscription.current_period_end)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {paymentMethods.length > 0 ? (
                  <Button 
                    onClick={handleRenewSubscription}
                    disabled={renewalLoading}
                    className="bg-gradient-to-r from-[#FFC000] to-[#FF8400] hover:from-[#FF8400] hover:to-[#FFC000] text-white w-full sm:w-auto"
                  >
                    {renewalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Renewing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Subscription
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAddPaymentMethod}
                    className="bg-gradient-to-r from-[#FFC000] to-[#FF8400] hover:from-[#FF8400] hover:to-[#FFC000] text-white w-full sm:w-auto"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={handleResubscribe}
                  className="w-full sm:w-auto"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Alert */}
      {isExpiringSoon() && !needsRenewal() && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>
                Your subscription expires on <strong>{formatDate(subscription?.current_period_end)}</strong>. 
                {subscription?.auto_renew 
                  ? ' It will automatically renew.'
                  : ' Enable auto-renewal or renew manually to avoid service interruption.'}
              </span>
              {!subscription?.auto_renew && (
                <Button 
                  size="sm" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={handleResubscribe}
                >
                  Manage
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Current Plan Cost</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                  {subscription?.plan?.price !== undefined ? 
                    formatCurrency(subscription.plan.price) : 
                    subscription?.billing_info?.next_billing_amount !== undefined ?
                      formatCurrency(subscription.billing_info.next_billing_amount) :
                      '$0.00'
                  }
                  <span className="text-xs sm:text-sm font-normal text-gray-600">
                    /{subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'monthly'}
                  </span>
                </p>
                {subscription?.status === 'trialing' && (
                  <p className="text-xs text-blue-600 mt-1">Free trial period</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Next Billing Date</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  {formatDate(subscription?.next_payment_date || subscription?.current_period_end)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Billing Cycle</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 capitalize truncate">
                  {subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'Monthly'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Auto Renewal</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  {subscription?.auto_renew || subscription?.billing_info?.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Period Info */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Current Billing Period
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Period Start</p>
              <p className="text-sm sm:text-base font-medium">
                {formatDate(subscription?.current_period_start)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Period End</p>
              <p className="text-sm sm:text-base font-medium">
                {formatDate(subscription?.current_period_end)}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600">Days Remaining</p>
              <p className="text-sm sm:text-base font-medium text-blue-600">
                {subscription?.current_period_end ? 
                  Math.max(0, Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24))) : 
                  'N/A'
                } days
              </p>
            </div>
          </div>
          
          {subscription?.status === 'trialing' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Trial Period</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You're currently on a free trial. Your subscription will begin after the trial period ends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Payment Method
            </span>
            <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod} className="w-full sm:w-auto">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Update
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Show real payment methods if available */}
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={method.id || index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate">
                        •••• •••• •••• {method.card?.last4 || method.last_four || method.last4 || '****'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {method.card?.brand || method.brand || 'Card'} • Expires {method.card?.exp_month || method.exp_month}/{method.card?.exp_year || method.exp_year}
                      </p>
                      {(method.is_default || method.default) && (
                        <Badge variant="outline" className="mt-1 text-xs">Default</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : subscription?.payment_method ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CreditCard className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-800 truncate">{subscription.payment_method}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddPaymentMethod} className="w-full sm:w-auto">
                Manage
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span className="text-sm font-medium text-yellow-800">No Payment Method on File</span>
              </div>
              <p className="text-xs sm:text-sm text-yellow-700 mb-3">
                Add a payment method to ensure uninterrupted service when your trial ends.
              </p>
              <Button size="sm" className="w-full sm:w-auto" onClick={handleAddPaymentMethod}>
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-lg sm:text-xl">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              Billing History
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleViewAllInvoices} className="text-xs sm:text-sm">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                View All
              </Button>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.slice(0, 5).map((bill, index) => {
                const StatusIcon = getStatusIcon(bill.status);
                
                return (
                  <div key={bill.id || index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium truncate">{bill.description || 'Subscription Payment'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {formatDate(bill.created_at || bill.processed_at || bill.date)}
                        </p>
                        {bill.transaction_type && (
                          <Badge variant="outline" className="mt-1 text-xs w-fit">
                            {bill.transaction_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <div className="text-left sm:text-right order-2 sm:order-1">
                        <p className="text-sm sm:text-base font-semibold">
                          {bill.transaction_type === 'refund' ? '-' : ''}
                          {formatCurrency(bill.amount, bill.currency)}
                        </p>
                        <Badge className={`${getStatusColor(bill.status)} text-xs w-fit`}>
                          {bill.status || 'Pending'}
                        </Badge>
                      </div>
                      
                      {(bill.status === 'completed' || bill.status === 'paid') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(bill.id)}
                          className="order-1 sm:order-2 w-full sm:w-auto"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="sm:hidden">Download</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {billingHistory.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" onClick={handleViewAllInvoices} className="w-full sm:w-auto">
                    View {billingHistory.length - 5} More Transactions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                Your billing history will appear here once payments are processed.
              </p>
              
              {/* Context-aware messages */}
              {subscription?.status === 'trialing' ? (
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Trial period - No charges yet</span>
                  </div>
                  <p className="text-xs text-gray-500 px-4">
                    Your first charge will appear after your trial ends on {formatDate(subscription?.current_period_end)}.
                  </p>
                </div>
              ) : subscription?.plan?.price === 0 || subscription?.plan?.price === '0' || subscription?.plan?.price === '0.00' ? (
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Free plan - No charges apply</span>
                  </div>
                  <p className="text-xs text-gray-500 px-4">
                    Upgrade to a paid plan to access premium features.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Transactions will appear here</span>
                  </div>
                  <p className="text-xs text-gray-500 px-4">
                    When you make a payment or your subscription renews, you'll see the transaction details here.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Insights */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Billing Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {formatCurrency(
                    billingHistory
                      .filter(b => b.transaction_type === 'charge' && b.status === 'completed')
                      .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Spent</p>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {billingHistory.filter(b => b.status === 'completed').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Successful Payments</p>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-purple-600">
                  {formatDate(billingHistory.find(b => b.status === 'completed')?.created_at)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Last Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <ArrowUpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-sm sm:text-base font-semibold">Upgrade Plan</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Get access to more features</p>
            <Button className="w-full text-sm">View Plans</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-sm sm:text-base font-semibold">Manage Subscription</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Pause, cancel, or modify your plan</p>
            <Button variant="outline" className="w-full text-sm">Manage</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingManagement;
