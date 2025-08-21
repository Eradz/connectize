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
  RefreshCw
} from 'lucide-react';

const BillingManagement = () => {
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing API service methods
      const [
        subscriptionResult,
        billingResult,
        usageResult,
        analyticsResult
      ] = await Promise.allSettled([
        subscriptionsApi.getCurrentSubscription(),
        subscriptionsApi.getBillingHistory(),
        subscriptionsApi.getUsage(),
        subscriptionsApi.getSubscriptionAnalytics()
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

      console.log('Billing API responses:', {
        subscription: subscriptionData,
        billing: billingData,
        usage: usageData,
        analytics: analyticsData
      });

      // Handle subscription data
      if (subscriptionData?.subscription) {
        setSubscription(subscriptionData.subscription);
      } else if (subscriptionData) {
        setSubscription(subscriptionData);
      } else {
        // Mock data for demonstration when no real subscription exists
        setSubscription({
          plan: {
            name: 'Professional Plan',
            price: 0.00,
            billing_cycle: 'monthly',
            currency: 'USD'
          },
          status: 'trialing',
          next_payment_date: null,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          billing_info: {
            next_billing_amount: 0.00,
            currency: 'USD',
            billing_cycle: 'monthly',
            auto_renew: true
          }
        });
      }

      // Handle billing history
      if (billingData?.billing_history) {
        setBillingHistory(billingData.billing_history);
      } else if (Array.isArray(billingData)) {
        setBillingHistory(billingData);
      } else {
        // Mock billing history for demonstration
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
    // Implementation for updating payment method
    console.log('Updating payment method');
    // This would open a payment method update modal
  };

  const handleViewAllInvoices = () => {
    // Implementation for viewing all invoices
    console.log('Viewing all invoices');
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
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
          <p className="text-gray-600 mt-1">Manage your subscription billing and payment methods</p>
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

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Current Plan Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(subscription?.plan?.price || subscription?.billing_info?.next_billing_amount)}
                  <span className="text-sm font-normal text-gray-600">
                    /{subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'month'}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(subscription?.next_payment_date || subscription?.current_period_end)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'Monthly'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Auto Renewal</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription?.auto_renew || subscription?.billing_info?.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Period Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Billing Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Period Start</p>
              <p className="font-medium">
                {formatDate(subscription?.current_period_start)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Period End</p>
              <p className="font-medium">
                {formatDate(subscription?.current_period_end)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="font-medium text-blue-600">
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </span>
            <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
              <Settings className="h-4 w-4 mr-2" />
              Update
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
                <Badge variant="outline" className="mt-1">Default</Badge>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">No Payment Method on File</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Add a payment method to ensure uninterrupted service when your trial ends.
            </p>
            <Button size="sm" className="mt-2">Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleViewAllInvoices}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.slice(0, 5).map((bill, index) => {
                const StatusIcon = getStatusIcon(bill.status);
                
                return (
                  <div key={bill.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{bill.description || 'Subscription Payment'}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(bill.created_at || bill.processed_at || bill.date)}
                        </p>
                        {bill.transaction_type && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {bill.transaction_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          {bill.transaction_type === 'refund' ? '-' : ''}
                          {formatCurrency(bill.amount, bill.currency)}
                        </p>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status || 'Pending'}
                        </Badge>
                      </div>
                      
                      {(bill.status === 'completed' || bill.status === 'paid') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(bill.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {billingHistory.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" onClick={handleViewAllInvoices}>
                    View {billingHistory.length - 5} More Transactions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
              <p className="text-gray-600 mb-4">Your billing history will appear here once you have transactions</p>
              
              {subscription?.status === 'trialing' && (
                <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  Trial period - No charges yet
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Insights */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Billing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    billingHistory
                      .filter(b => b.transaction_type === 'charge' && b.status === 'completed')
                      .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Spent</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {billingHistory.filter(b => b.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Successful Payments</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formatDate(billingHistory.find(b => b.status === 'completed')?.created_at)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Last Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ArrowUpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Upgrade Plan</h3>
            <p className="text-sm text-gray-600 mb-4">Get access to more features</p>
            <Button className="w-full">View Plans</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold">Manage Subscription</h3>
            <p className="text-sm text-gray-600 mb-4">Pause, cancel, or modify your plan</p>
            <Button variant="outline" className="w-full">Manage</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingManagement;
