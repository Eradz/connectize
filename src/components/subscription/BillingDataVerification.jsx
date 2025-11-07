import React, { useState, useEffect } from 'react';
import subscriptionsApi from '@/api-services/subscriptions';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Billing Data Verification Component
 * Tests and displays the actual API responses for billing data
 */
const BillingDataVerification = () => {
  const [data, setData] = useState({
    subscription: null,
    paymentMethods: null,
    billingHistory: null,
    loading: false,
    lastUpdated: null
  });

  const [apiStatus, setApiStatus] = useState({
    subscription: 'untested',
    paymentMethods: 'untested', 
    billingHistory: 'untested'
  });

  const testAPI = async (endpoint, apiCall) => {
    try {
      setApiStatus(prev => ({ ...prev, [endpoint]: 'loading' }));
      const result = await apiCall();
      setApiStatus(prev => ({ ...prev, [endpoint]: 'success' }));
      return result;
    } catch (error) {
      console.error(`${endpoint} API error:`, error);
      setApiStatus(prev => ({ ...prev, [endpoint]: 'error' }));
      return null;
    }
  };

  const fetchAllData = async () => {
    setData(prev => ({ ...prev, loading: true }));

    const [subscriptionResult, paymentMethodsResult, billingHistoryResult] = await Promise.all([
      testAPI('subscription', () => subscriptionsApi.getCurrentSubscription()),
      testAPI('paymentMethods', () => subscriptionsApi.getPaymentMethods()),
      testAPI('billingHistory', () => subscriptionsApi.getBillingHistory())
    ]);

    setData({
      subscription: subscriptionResult?.data || null,
      paymentMethods: paymentMethodsResult?.data || null,
      billingHistory: billingHistoryResult?.data || null,
      loading: false,
      lastUpdated: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'loading': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'API Working';
      case 'error': return 'API Error';
      case 'loading': return 'Testing...';
      default: return 'Not Tested';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Billing Data Verification</span>
            <Button 
              onClick={fetchAllData} 
              disabled={data.loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${data.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.lastUpdated && (
            <p className="text-sm text-gray-600 mb-4">
              Last updated: {data.lastUpdated}
            </p>
          )}

          {/* API Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(apiStatus).map(([endpoint, status]) => (
              <div key={endpoint} className="flex items-center gap-2 p-3 border rounded-lg">
                {getStatusIcon(status)}
                <div>
                  <p className="font-medium capitalize">{endpoint}</p>
                  <p className="text-sm text-gray-600">{getStatusText(status)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription Data */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Subscription Data</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(data.subscription, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Methods Data</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(data.paymentMethods, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Billing History Data</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(data.billingHistory, null, 2)}
              </pre>
            </div>
          </div>

          {/* Data Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Data Summary</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Subscription: {data.subscription ? '✅ Loaded' : '❌ No data'} 
                {data.subscription?.subscription?.plan?.name && ` (${data.subscription.subscription.plan.name})`}
              </li>
              <li>
                • Payment Methods: {data.paymentMethods?.payment_methods?.length > 0 ? 
                  `✅ ${data.paymentMethods.payment_methods.length} method(s)` : 
                  '❌ No payment methods'}
              </li>
              <li>
                • Billing History: {data.billingHistory?.billing_history?.length > 0 ? 
                  `✅ ${data.billingHistory.billing_history.length} record(s)` : 
                  '❌ No billing history'}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDataVerification;
