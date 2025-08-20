import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Progress from '@/components/ui/Progress';
import subscriptionsApi from '@/api-services/subscriptions';
import { getAuthorizationHeader } from '@/lib/helpers';
import BillingManagement from './BillingManagement';
import UsageAnalytics from './UsageAnalytics';
import {
  Crown,
  TrendingUp,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Eye,
  Download
} from 'lucide-react';

const SubscriptionManagementSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [features, setFeatures] = useState({});
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);

  // Get active tab from URL or default to dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Fetch all subscription data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const authHeaders = await getAuthorizationHeader();

      // Fetch all data in parallel with proper error handling
      const [
        subscriptionResponse,
        plansResponse,
        featuresResponse,
        usageResponse,
        analyticsResponse,
        billingResponse
      ] = await Promise.all([
        fetch('/api/v1/subscriptions/current/', { headers: { ...authHeaders } }),
        fetch('/api/v1/plans/', { headers: { ...authHeaders } }),
        fetch('/api/permissions/features/available/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/usage/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/analytics/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/billing_history/', { headers: { ...authHeaders } })
      ]);

      // Helper function for safe JSON parsing
      const safeJsonParse = async (response, defaultValue = null) => {
        if (!response.ok) {
          console.warn(`API returned ${response.status}: ${response.statusText}`);
          return defaultValue;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('API returned non-JSON response:', contentType);
          return defaultValue;
        }
        
        try {
          return await response.json();
        } catch (error) {
          console.warn('Failed to parse JSON response:', error);
          return defaultValue;
        }
      };

      // Parse responses safely
      const subscriptionData = await safeJsonParse(subscriptionResponse, {});
      const plansData = await safeJsonParse(plansResponse, { results: [] });
      const featuresData = await safeJsonParse(featuresResponse, { features_by_category: {} });
      const usageData = await safeJsonParse(usageResponse, {});
      const analyticsData = await safeJsonParse(analyticsResponse, {});
      const billingData = await safeJsonParse(billingResponse, { results: [] });

      // Update state
      setCurrentSubscription(subscriptionData?.data?.subscription || subscriptionData);
      setAvailablePlans(plansData?.results || plansData || []);
      setFeatures(featuresData?.features_by_category || {});
      setUsage(usageData);
      setAnalytics(analyticsData);
      setBillingHistory(billingData?.results || billingData || []);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get plan color based on type
  const getPlanColor = (planType) => {
    const colorMap = {
      'trial': 'bg-gray-100 text-gray-800 border-gray-300',
      'starter': 'bg-blue-100 text-blue-800 border-blue-300',
      'professional': 'bg-purple-100 text-purple-800 border-purple-300',
      'enterprise': 'bg-orange-100 text-orange-800 border-orange-300',
      'custom': 'bg-red-100 text-red-800 border-red-300'
    };
    return colorMap[planType?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Format usage percentage color
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Social Media': TrendingUp,
      'Analytics': BarChart3,
      'AI Services': Sparkles,
      'Enterprise Tools': Shield,
      'Team Management': Users,
      'Admin & Support': Settings
    };
    return iconMap[category] || CheckCircle;
  };

  // Handle plan upgrade
  const handlePlanUpgrade = async (planId) => {
    try {
      if (!currentSubscription?.id) {
        console.error('No current subscription found');
        return;
      }

      const response = await subscriptionsApi.upgradeSubscription(currentSubscription.id, {
        target_plan_id: planId
      });

      if (response.data) {
        // Refresh data after upgrade
        await fetchAllData();
        alert('Plan upgraded successfully!');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAllData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your plan, monitor usage, and optimize your investment</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentSubscription?.plan?.name || 'No Active Plan'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Cost</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${currentSubscription?.plan?.price || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Features Available</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.values(features).reduce((total, categoryFeatures) => 
                      total + (Array.isArray(categoryFeatures) ? categoryFeatures.length : 0), 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.keys(features).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DashboardContent 
                  subscription={currentSubscription}
                  usage={usage}
                  analytics={analytics}
                  features={features}
                  getUsageColor={getUsageColor}
                  getCategoryIcon={getCategoryIcon}
                  setActiveTab={setActiveTab}
                />
              </div>
              <div>
                <UsageAnalytics />
              </div>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <PlansContent 
              currentSubscription={currentSubscription}
              availablePlans={availablePlans}
              onUpgrade={handlePlanUpgrade}
              getPlanColor={getPlanColor}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <FeaturesContent 
              features={features}
              currentSubscription={currentSubscription}
              getCategoryIcon={getCategoryIcon}
            />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ subscription, usage, analytics, features, getUsageColor, getCategoryIcon, setActiveTab }) => (
  <div className="space-y-6">
    {/* Current Plan Overview */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Plan Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Plan Name</p>
              <p className="text-lg font-semibold">{subscription.plan?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={subscription.is_active ? 'success' : 'destructive'}>
                {subscription.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="text-lg font-semibold">
                {subscription.next_billing_date ? 
                  new Date(subscription.next_billing_date).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">Choose a plan to unlock Connectize's powerful features</p>
            <Button onClick={() => setActiveTab('plans')}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Usage Analytics */}
    {usage && (
      <Card>
        <CardHeader>
          <CardTitle>Current Period Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usage.current_usage && Object.entries(usage.current_usage).map(([key, usageData]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                  <span className={`text-sm font-medium ${getUsageColor(usageData.percentage)}`}>
                    {usageData.used} / {usageData.limit === 0 ? '∞' : usageData.limit}
                  </span>
                </div>
                <Progress 
                  value={usageData.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setActiveTab('plans')}>
        <CardContent className="p-6 text-center">
          <ArrowUpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold">Upgrade Plan</h3>
          <p className="text-sm text-gray-600">Unlock more features</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('features')}>
        <CardContent className="p-6 text-center">
          <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold">Explore Features</h3>
          <p className="text-sm text-gray-600">See what's included</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('billing')}>
        <CardContent className="p-6 text-center">
          <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold">Billing History</h3>
          <p className="text-sm text-gray-600">Download invoices</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Plans Content Component (to be continued in next part)
const PlansContent = ({ currentSubscription, availablePlans, onUpgrade, getPlanColor }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
      <p className="text-gray-600">Select the perfect plan for your business needs</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availablePlans.map((plan) => {
        const isCurrentPlan = currentSubscription?.plan?.id === plan.id;
        
        return (
          <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
            {isCurrentPlan && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-500 text-white">Current Plan</Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <Badge className={getPlanColor(plan.plan_type)}>
                  {plan.plan_type}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features?.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.features?.length > 5 && (
                  <p className="text-sm text-gray-500">+{plan.features.length - 5} more features</p>
                )}
              </div>

              <Button 
                className="w-full" 
                variant={isCurrentPlan ? 'outline' : 'default'}
                disabled={isCurrentPlan}
                onClick={() => !isCurrentPlan && onUpgrade(plan.id)}
              >
                {isCurrentPlan ? 'Current Plan' : 'Upgrade to This Plan'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

// Features Content Component
const FeaturesContent = ({ features, currentSubscription, getCategoryIcon }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Features</h2>
      <p className="text-gray-600">Explore all the capabilities included in your plan</p>
    </div>

    <div className="grid gap-6">
      {Object.entries(features).map(([category, categoryFeatures]) => {
        const IconComponent = getCategoryIcon(category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                {category}
                <Badge variant="secondary" className="ml-auto">
                  {Array.isArray(categoryFeatures) ? categoryFeatures.length : 0} features
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.isArray(categoryFeatures) && categoryFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{feature.name || feature}</p>
                      {feature.description && (
                        <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

// Billing Content Component
const BillingContent = ({ subscription, billingHistory, analytics }) => (
  <div className="space-y-6">
    {/* Billing Overview */}
    <Card>
      <CardHeader>
        <CardTitle>Billing Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Period</p>
            <p className="font-semibold">
              {analytics?.billing_period?.start ? 
                `${new Date(analytics.billing_period.start).toLocaleDateString()} - ${new Date(analytics.billing_period.end).toLocaleDateString()}` :
                'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Remaining</p>
            <p className="font-semibold">{analytics?.billing_period?.days_remaining || 'N/A'} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Billing</p>
            <p className="font-semibold">
              ${subscription?.plan?.price || '0.00'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Billing History */}
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        {billingHistory.length > 0 ? (
          <div className="space-y-3">
            {billingHistory.map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{bill.description || 'Subscription Payment'}</p>
                  <p className="text-sm text-gray-600">
                    {bill.date ? new Date(bill.date).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${bill.amount || '0.00'}</p>
                  <Badge variant={bill.status === 'paid' ? 'success' : 'destructive'}>
                    {bill.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
            <p className="text-gray-600">Your billing history will appear here once you have transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

export default SubscriptionManagementSystem;
