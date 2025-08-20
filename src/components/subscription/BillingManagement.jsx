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
  Receipt
} from 'lucide-react';

const BillingManagement = () => {
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const authHeaders = await getAuthorizationHeader();

      const [
        subscriptionResponse,
        billingResponse,
        usageResponse,
        analyticsResponse
      ] = await Promise.all([
        fetch('/api/v1/subscriptions/current/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/billing_history/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/usage/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/analytics/', { headers: { ...authHeaders } })
      ]);

      // Safe JSON parsing
      const safeJsonParse = async (response, defaultValue = null) => {
        if (!response.ok) return defaultValue;
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return defaultValue;
        try {
          return await response.json();
        } catch {
          return defaultValue;
        }
      };

      const subscriptionData = await safeJsonParse(subscriptionResponse, {});
      const billingData = await safeJsonParse(billingResponse, { results: [] });
      const usageData = await safeJsonParse(usageResponse, {});
      const analyticsData = await safeJsonParse(analyticsResponse, {});

      setSubscription(subscriptionData?.data?.subscription || subscriptionData);
      setBillingHistory(billingData?.results || billingData || []);
      setUsage(usageData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (billId) => {
    // Implementation for downloading invoice
    console.log('Downloading invoice for bill:', billId);
    // This would typically trigger a download or open a PDF
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'paid': CheckCircle,
      'pending': Clock,
      'failed': AlertCircle,
      'overdue': AlertCircle
    };
    const IconComponent = iconMap[status?.toLowerCase()] || Clock;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Current Plan Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${subscription?.plan?.price || '0.00'}
                  <span className="text-sm font-normal text-gray-600">/month</span>
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
                  {subscription?.next_billing_date ? 
                    new Date(subscription.next_billing_date).toLocaleDateString() : 
                    'N/A'
                  }
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
                <p className="text-lg font-semibold text-gray-900">
                  {subscription?.billing_cycle || 'Monthly'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Period Info */}
      {analytics?.billing_period && (
        <Card>
          <CardHeader>
            <CardTitle>Current Billing Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Period Start</p>
                <p className="font-medium">
                  {analytics.billing_period.start ? 
                    new Date(analytics.billing_period.start).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Period End</p>
                <p className="font-medium">
                  {analytics.billing_period.end ? 
                    new Date(analytics.billing_period.end).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="font-medium text-blue-600">
                  {analytics.billing_period.days_remaining || 'N/A'} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.map((bill, index) => {
                const StatusIcon = getStatusIcon(bill.status);
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{bill.description || 'Subscription Payment'}</p>
                        <p className="text-sm text-gray-600">
                          {bill.date ? new Date(bill.date).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">${bill.amount || '0.00'}</p>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status || 'Pending'}
                        </Badge>
                      </div>
                      
                      {bill.status === 'paid' && (
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
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
              <p className="text-gray-600">Your billing history will appear here once you have transactions</p>
            </div>
          )}
        </CardContent>
      </Card>

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
            <ArrowDownCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
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
