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
import { loginForTesting, isTestAuthActive } from '@/lib/testAuth';
import BillingManagement from './BillingManagement';
import UsageAnalytics from './UsageAnalytics';
import PlanSelector from './PlanSelector';
import PaymentMethodManager from './PaymentMethodManager';
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
    const initializeAuth = async () => {
      // Enable test authentication if needed
      if (!isTestAuthActive()) {
        try {
          await loginForTesting();
        } catch (error) {
          console.warn('❌ Failed to enable test authentication:', error);
        }
      } else {
      }
      
      // Fetch subscription data
      fetchAllData();
    };

    initializeAuth();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);


      // Use the subscriptionsApi service instead of direct fetch calls
      const [
        subscriptionResult,
        plansResult,
        featuresResult,
        usageResult,
        analyticsResult,
        billingResult
      ] = await Promise.allSettled([
        subscriptionsApi.getCurrentSubscription(),
        subscriptionsApi.getPlans(),
        subscriptionsApi.getAvailableFeatures(),
        subscriptionsApi.getUsage(),
        subscriptionsApi.getSubscriptionAnalytics(),
        subscriptionsApi.getBillingHistory()
      ]);

      // Helper function for safe data extraction
      const safeExtract = (result, defaultValue = null) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          return result.value.data;
        } else {
          console.warn('❌ API call failed:', result.reason?.message || result.reason);
          return defaultValue;
        }
      };

      // Parse responses safely
      const subscriptionData = safeExtract(subscriptionResult, {});
      const plansData = safeExtract(plansResult, { results: [] });
      const featuresData = safeExtract(featuresResult, { features_by_category: {} });
      const usageData = safeExtract(usageResult, {});
      const analyticsData = safeExtract(analyticsResult, {});
      const billingData = safeExtract(billingResult, { results: [] });

      // Update state with extracted data - handle the actual API response structure
      setCurrentSubscription(subscriptionData?.subscription || subscriptionData);
      setAvailablePlans(plansData?.results || plansData || []);
      setFeatures(featuresData?.features_by_category || featuresData || {});
      setUsage(usageData?.usage || usageData);
      setAnalytics(analyticsData);
      setBillingHistory(billingData?.results || billingData || []);

      // Handle subscription data structure from /api/v1/subscriptions/current/
      const subscription = subscriptionData?.subscription || subscriptionData;
      const subscriptionUsage = subscriptionData?.usage || usageData;
      
      setCurrentSubscription(subscription);
      setAvailablePlans(plansData?.results || plansData || []);
      setFeatures(featuresData?.features_by_category || {});
      setUsage(subscriptionUsage);
      setAnalytics(analyticsData);
      setBillingHistory(billingData?.results || billingData || []);


    } catch (error) {
      console.error('❌ Error fetching subscription data:', error);
      setError(`Failed to load subscription data: ${error.message}`);
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Subscription Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your plan, monitor usage, and optimize your investment
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Crown className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Current Plan</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                    {currentSubscription?.plan?.name || 'No Plan'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Monthly Cost</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    ${currentSubscription?.plan?.price || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Features</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    {Object.values(features).reduce((total, categoryFeatures) => 
                      total + (Array.isArray(categoryFeatures) ? categoryFeatures.length : 0), 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Categories</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    {Object.keys(features).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Mobile Tab Selector (Dropdown-style for small screens) */}
          <div className="sm:hidden mb-4">
            <select 
              value={activeTab} 
              onChange={(e) => handleTabChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dashboard">📊 Dashboard</option>
              <option value="plans">👑 Plans</option>
              <option value="choose-plan">➕ Choose Plan</option>
              <option value="features">⚡ Features</option>
              <option value="billing">💳 Billing</option>
              <option value="payment-methods">⚙️ Payment Methods</option>
            </select>
          </div>

          {/* Desktop/Tablet Tabs */}
          <TabsList className="hidden sm:grid w-full grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-0 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden md:inline">Dashboard</span>
              <span className="md:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <Crown className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Plans</span>
            </TabsTrigger>
            <TabsTrigger value="choose-plan" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <PlusCircle className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden md:inline">Choose Plan</span>
              <span className="md:hidden">Choose</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm p-2 lg:p-3">
              <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">Payment</span>
              <span className="lg:hidden">Pay</span>
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
                <UsageAnalytics 
                  usage={usage}
                  analytics={analytics}
                  subscription={currentSubscription}
                  billingHistory={billingHistory}
                />
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
            <BillingManagement 
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              onUpdatePaymentMethod={() => setActiveTab('payment-methods')}
            />
          </TabsContent>

          {/* Choose Plan Tab */}
          <TabsContent value="choose-plan" className="space-y-6">
            <PlanSelector 
              currentSubscription={currentSubscription}
              onPlanSelected={(subscriptionData) => {
                // Refresh data after plan selection
                fetchAllData();
                setActiveTab('dashboard');
              }}
            />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <PaymentMethodManager 
              subscription={currentSubscription}
              onUpdate={() => {
                // Refresh data after payment method changes
                fetchAllData();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ subscription, usage, analytics, features, getUsageColor, getCategoryIcon, setActiveTab }) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Current Plan Overview */}
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
          Plan Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {subscription ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Plan Name</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold truncate">
                {subscription.plan?.name || subscription.plan_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Status</p>
              <Badge 
                variant={subscription.is_active || subscription.status === 'active' ? 'success' : 'destructive'}
                className="text-xs sm:text-sm"
              >
                {subscription.is_active || subscription.status === 'active' ? 'Active' : subscription.status || 'Inactive'}
              </Badge>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600">Next Billing</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold">
                {(() => {
                  // Use same logic as PaymentMethodManager for consistency
                  if (subscription?.status === 'active' && subscription?.current_period_end) {
                    return new Date(subscription.current_period_end).toLocaleDateString();
                  }
                  
                  const nextDate = subscription?.next_payment_date || 
                                 subscription?.next_billing_date ||
                                 subscription?.billing_info?.next_payment_date;
                  
                  if (nextDate) {
                    return new Date(nextDate).toLocaleDateString();
                  }
                  
                  if (subscription?.current_period_end) {
                    return new Date(subscription.current_period_end).toLocaleDateString();
                  }
                  
                  return 'N/A';
                })()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Crown className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Choose a plan to unlock Connectize's powerful features</p>
            <Button onClick={() => setActiveTab('plans')} className="w-full sm:w-auto">
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Usage Analytics */}
    {usage && (
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Current Period Usage</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            {usage.current_usage && Object.entries(usage.current_usage).map(([key, usageData]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-medium capitalize truncate pr-2">
                    {key.replace('_', ' ')}
                  </span>
                  <span className={`text-xs sm:text-sm font-medium ${getUsageColor(usageData.percentage)} flex-shrink-0`}>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setActiveTab('plans')}>
        <CardContent className="p-4 sm:p-6 text-center">
          <ArrowUpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold">Upgrade Plan</h3>
          <p className="text-xs sm:text-sm text-gray-600">Unlock more features</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('features')}>
        <CardContent className="p-4 sm:p-6 text-center">
          <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold">Explore Features</h3>
          <p className="text-xs sm:text-sm text-gray-600">See what's included</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1"
            onClick={() => setActiveTab('billing')}>
        <CardContent className="p-4 sm:p-6 text-center">
          <Download className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold">Billing History</h3>
          <p className="text-xs sm:text-sm text-gray-600">Download invoices</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Plans Content Component
const PlansContent = ({ currentSubscription, availablePlans, onUpgrade, getPlanColor }) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
      <p className="text-sm sm:text-base text-gray-600">Select the perfect plan for your business needs</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {availablePlans.map((plan) => {
        const isCurrentPlan = currentSubscription?.plan?.id === plan.id;
        
        return (
          <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} h-full flex flex-col`}>
            {isCurrentPlan && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-500 text-white text-xs sm:text-sm">Current Plan</Badge>
              </div>
            )}
            
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-lg sm:text-xl font-bold truncate">{plan.name}</span>
                <Badge className={`${getPlanColor(plan.plan_type)} text-xs sm:text-sm flex-shrink-0`}>
                  {plan.plan_type}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  ${plan.price}
                  <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{plan.description}</p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                {(() => {
                  // Handle different feature data structures
                  let featuresArray = [];
                  
                  if (Array.isArray(plan.features)) {
                    featuresArray = plan.features;
                  } else if (plan.features && typeof plan.features === 'object') {
                    // Handle nested feature object structure from Django API
                    featuresArray = [];
                    
                    // Extract features from nested categories
                    Object.entries(plan.features).forEach(([categoryKey, categoryFeatures]) => {
                      if (categoryFeatures && typeof categoryFeatures === 'object') {
                        Object.entries(categoryFeatures).forEach(([featureKey, featureValue]) => {
                          if (featureValue === true) {
                            // Boolean features that are enabled
                            featuresArray.push(featureKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                          } else if (typeof featureValue === 'number' && featureValue > 0) {
                            // Numeric limits
                            featuresArray.push(`${featureKey.replace(/_/g, ' ')}: ${featureValue}`);
                          } else if (typeof featureValue === 'string' && featureValue !== 'false') {
                            // String values
                            featuresArray.push(`${featureKey.replace(/_/g, ' ')}: ${featureValue}`);
                          }
                        });
                      }
                    });
                    
                    // If no features extracted, try to get feature names from object values
                    if (featuresArray.length === 0) {
                      featuresArray = Object.values(plan.features).map(f => 
                        typeof f === 'string' ? f : f?.name || f?.title || 'Feature'
                      );
                    }
                  } else if (plan.feature_list && Array.isArray(plan.feature_list)) {
                    featuresArray = plan.feature_list;
                  } else {
                    // Fallback to some common features based on plan type
                    featuresArray = [
                      'Basic Features',
                      'User Management', 
                      'Dashboard Access',
                      'Email Support'
                    ];
                  }
                  
                  return featuresArray.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">{feature}</span>
                    </div>
                  ));
                })()}
                {(() => {
                  // Calculate features count from the processed featuresArray
                  let featuresCount = 0;
                  
                  if (Array.isArray(plan.features)) {
                    featuresCount = plan.features.length;
                  } else if (plan.features && typeof plan.features === 'object') {
                    // Count enabled features from nested object structure
                    Object.values(plan.features).forEach(categoryFeatures => {
                      if (categoryFeatures && typeof categoryFeatures === 'object') {
                        Object.values(categoryFeatures).forEach(featureValue => {
                          if (featureValue === true || (typeof featureValue === 'number' && featureValue > 0) || 
                              (typeof featureValue === 'string' && featureValue !== 'false')) {
                            featuresCount++;
                          }
                        });
                      }
                    });
                  } else if (plan.feature_list?.length) {
                    featuresCount = plan.feature_list.length;
                  }
                  
                  return featuresCount > 5 && (
                    <p className="text-xs sm:text-sm text-gray-500">+{featuresCount - 5} more features</p>
                  );
                })()}
              </div>

              <Button 
                className="w-full mt-auto text-sm sm:text-base" 
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
  <div className="space-y-4 sm:space-y-6">
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Available Features</h2>
      <p className="text-sm sm:text-base text-gray-600">Explore all the capabilities included in your plan</p>
    </div>

    <div className="grid gap-4 sm:gap-6">
      {Object.entries(features).map(([category, categoryFeatures]) => {
        const IconComponent = getCategoryIcon(category);
        
        return (
          <Card key={category}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-lg sm:text-xl">{category}</span>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {Array.isArray(categoryFeatures) ? categoryFeatures.length : 0} features
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.isArray(categoryFeatures) && categoryFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm leading-tight">
                        {feature.feature_name || feature.name || (typeof feature === 'string' ? feature : 'Unknown Feature')}
                      </p>
                      {(feature.description) && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{feature.description}</p>
                      )}
                      {(feature.minimum_plan) && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {feature.minimum_plan}+ plan
                        </Badge>
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
const BillingContent = ({ subscription, billingHistory, analytics, usage }) => (
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
              {usage?.period_start && usage?.period_end ? 
                `${new Date(usage.period_start).toLocaleDateString()} - ${new Date(usage.period_end).toLocaleDateString()}` :
                subscription?.current_period_start && subscription?.current_period_end ?
                `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}` :
                'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Remaining</p>
            <p className="font-semibold">{usage?.days_remaining || subscription?.days_remaining || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Billing</p>
            <p className="font-semibold">
              {usage?.next_billing_date || subscription?.next_billing_date || subscription?.next_payment_date ? 
                new Date(usage?.next_billing_date || subscription?.next_billing_date || subscription?.next_payment_date).toLocaleDateString() :
                'N/A'
              }
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
