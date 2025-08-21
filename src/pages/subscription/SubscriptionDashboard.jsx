import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import Card components individually to avoid export conflicts
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Settings, 
  BarChart3, 
  Users, 
  Globe,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import subscriptionsApi from '../../api-services/subscriptions';
import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import { webRoutes } from '../../lib/webRoutes';

const SubscriptionDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    plans: [],
    currentSubscription: null,
    analytics: null,
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if test auth is active, if not, set it up for testing
      if (!isTestAuthActive()) {
        console.log('🔑 Setting up test authentication...');
        await loginForTesting();
      }

      console.log('🔄 SubscriptionDashboard: Loading dashboard data...');

      // Load all data in parallel
      const [plansResult, featuresResult, analyticsResult, currentSubscriptionResult] = await Promise.all([
        subscriptionsApi.getPlans().catch(err => {
          console.error('❌ Failed to load plans:', err);
          return { data: { results: [] } };
        }),
        subscriptionsApi.getAvailableFeatures().catch(err => {
          console.error('❌ Failed to load features:', err);
          return { data: { features_by_category: {} } };
        }),
        subscriptionsApi.getSubscriptionAnalytics().catch(err => {
          console.error('❌ Failed to load analytics:', err);
          return { data: null };
        }),
        subscriptionsApi.getCurrentSubscription().catch(err => {
          console.error('❌ Failed to load current subscription:', err);
          return { data: null };
        })
      ]);

      console.log('📊 Raw API responses:', {
        plansResponse: plansResult,
        featuresResponse: featuresResult,
        analyticsResponse: analyticsResult,
        currentSubscriptionResponse: currentSubscriptionResult
      });

      console.log('🔍 Current subscription analysis:', {
        rawData: currentSubscriptionResult?.data,
        subscriptionNested: currentSubscriptionResult?.data?.subscription,
        directSubscription: currentSubscriptionResult?.data,
        planName: currentSubscriptionResult?.data?.subscription?.plan?.name || currentSubscriptionResult?.data?.plan?.name,
        status: currentSubscriptionResult?.data?.subscription?.status || currentSubscriptionResult?.data?.status
      });

      console.log('📊 Extracted data:', {
        plans: plansResult?.data?.results?.length || 0,
        features: Object.keys(featuresResult?.data?.features_by_category || {}).length,
        analytics: !!analyticsResult?.data
      });

      // Extract and flatten features from categories
      const featuresData = featuresResult?.data?.features_by_category || {};
      const allFeatures = Object.values(featuresData).flat();

      console.log('📊 Dashboard data loaded:', {
        plans: plansResult?.data?.results?.length || 0,
        features: allFeatures.length || 0,
        analytics: !!analyticsResult?.data
      });

      const extractedSubscription = currentSubscriptionResult?.data?.subscription || null;
      console.log('🔧 Subscription extraction result:', {
        extracted: extractedSubscription,
        planName: extractedSubscription?.plan?.name,
        status: extractedSubscription?.status,
        isActive: extractedSubscription?.is_active
      });

      setDashboardData({
        plans: plansResult?.data?.results || [],
        features: allFeatures || [],
        featuresCategories: featuresData,
        analytics: analyticsResult?.data,
        currentSubscription: extractedSubscription
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Get plan features for a specific plan
  const getPlanFeatures = (planType) => {
    if (!dashboardData.features.length) return [];
    
    const planHierarchy = {
      'trial': ['trial'],
      'starter': ['trial', 'starter'],
      'professional': ['trial', 'starter', 'professional'],
      'enterprise': ['trial', 'starter', 'professional', 'enterprise'],
      'custom': ['trial', 'starter', 'professional', 'enterprise', 'custom']
    };

    const availablePlans = planHierarchy[planType?.toLowerCase()] || ['trial'];
    
    return dashboardData.features.filter(feature => 
      availablePlans.includes(feature.minimum_plan?.toLowerCase())
    );
  };

  // Categorize features by their category
  const categorizeFeatures = (features) => {
    // If we already have categories from the API, use them
    if (dashboardData.featuresCategories && Object.keys(dashboardData.featuresCategories).length > 0) {
      return dashboardData.featuresCategories;
    }
    
    // Fallback: categorize features manually
    const categories = {};
    features.forEach(feature => {
      const category = feature.feature_category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(feature);
    });
    return categories;
  };

  // Get plan icon
  const getPlanIcon = (planType) => {
    const icons = {
      'trial': Star,
      'starter': Zap,
      'professional': Crown,
      'enterprise': Shield,
      'custom': Settings
    };
    return icons[planType?.toLowerCase()] || Star;
  };

  // Get plan color
  const getPlanColor = (planType) => {
    const colors = {
      'trial': 'bg-gray-100 text-gray-800 border-gray-200',
      'starter': 'bg-blue-100 text-blue-800 border-blue-200',
      'professional': 'bg-purple-100 text-purple-800 border-purple-200',
      'enterprise': 'bg-amber-100 text-amber-800 border-amber-200',
      'custom': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[planType?.toLowerCase()] || colors.trial;
  };

  // Handle view plan details
  const handleViewPlanDetails = (plan) => {
    console.log('🔍 Viewing plan details for:', plan);
    // Navigate to plan detail page with plan ID
    navigate(webRoutes.subscriptionPlanDetail.replace(':planId', plan.id));
  };

  // Check if a plan is the current subscription
  const isCurrentPlan = (plan) => {
    if (!dashboardData.currentSubscription) return false;
    return dashboardData.currentSubscription.plan?.id === plan.id ||
           dashboardData.currentSubscription.plan_type === plan.plan_type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error loading dashboard</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button 
                onClick={loadDashboardData} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your subscription plans and features
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Plans</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardData.plans.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Subscription options
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Features</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {dashboardData.features.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all plans
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Only show analytics data if it exists */}
          {dashboardData.analytics?.active_users !== undefined && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Users</p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData.analytics.active_users.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Active subscribers
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {dashboardData.analytics?.countries !== undefined && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Global Reach</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData.analytics.countries}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Countries served
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Subscription */}
        {dashboardData.currentSubscription && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Overview */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-16 w-16 bg-green-100 rounded-full">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900">
                            {dashboardData.currentSubscription.plan?.name || 'No Active Plan'}
                          </h3>
                          <p className="text-green-700 font-medium">
                            {dashboardData.currentSubscription.status === 'active' ? 'Active Subscription' : 
                             dashboardData.currentSubscription.status || 'No Active Subscription'}
                          </p>
                          {dashboardData.currentSubscription.plan?.description && (
                            <p className="text-sm text-green-600 mt-1">
                              {dashboardData.currentSubscription.plan.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {dashboardData.currentSubscription.plan?.price && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900">
                            ${dashboardData.currentSubscription.plan.price}
                          </div>
                          <div className="text-sm text-green-600">
                            per {dashboardData.currentSubscription.plan.billing_cycle || 'month'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Subscription Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white bg-opacity-60 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700">Plan Type</p>
                        <p className="text-sm font-bold text-green-900 capitalize">
                          {dashboardData.currentSubscription.plan?.plan_type || 'N/A'}
                        </p>
                      </div>
                      
                      {dashboardData.currentSubscription.current_period_start && (
                        <div className="bg-white bg-opacity-60 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700">Started</p>
                          <p className="text-sm font-bold text-green-900">
                            {new Date(dashboardData.currentSubscription.current_period_start).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {dashboardData.currentSubscription.current_period_end && (
                        <div className="bg-white bg-opacity-60 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700">Next Billing</p>
                          <p className="text-sm font-bold text-green-900">
                            {new Date(dashboardData.currentSubscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {dashboardData.currentSubscription.days_remaining && (
                        <div className="bg-white bg-opacity-60 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700">Days Left</p>
                          <p className="text-sm font-bold text-green-900">
                            {dashboardData.currentSubscription.days_remaining} days
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Usage Summary */}
                    {dashboardData.currentSubscription.usage_summary && (
                      <div className="bg-white bg-opacity-60 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-900 mb-3">Current Usage</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(dashboardData.currentSubscription.usage_summary).map(([key, usage]) => (
                            <div key={key} className="text-center">
                              <p className="text-xs text-green-700 mb-1 capitalize">
                                {key.replace('_', ' ')}
                              </p>
                              <div className="text-lg font-bold text-green-900">
                                {typeof usage.used === 'number' ? usage.used.toLocaleString() : usage.used}
                              </div>
                              <div className="text-xs text-green-600">
                                of {typeof usage.limit === 'number' ? usage.limit.toLocaleString() : usage.limit}
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(usage.percentage || 0, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleViewPlanDetails(dashboardData.currentSubscription.plan || dashboardData.currentSubscription)}
                      className="w-full"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/billing')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Billing
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/usage')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Usage Analytics
                    </Button>
                    
                    {/* Billing Info */}
                    {dashboardData.currentSubscription.billing_info && (
                      <div className="bg-white bg-opacity-60 rounded-lg p-4 mt-4">
                        <h4 className="text-sm font-semibold text-green-900 mb-2">Billing Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Next Amount:</span>
                            <span className="font-medium text-green-900">
                              ${dashboardData.currentSubscription.billing_info.next_billing_amount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Auto Renew:</span>
                            <span className="font-medium text-green-900">
                              {dashboardData.currentSubscription.billing_info.auto_renew ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          {dashboardData.currentSubscription.billing_info.cancel_at_period_end && (
                            <div className="flex justify-between">
                              <span className="text-red-700">Status:</span>
                              <span className="font-medium text-red-900">
                                Cancels at period end
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dashboardData.plans.map((plan, index) => {
                const PlanIcon = getPlanIcon(plan.plan_type);
                const planFeatures = getPlanFeatures(plan.plan_type);
                const categorizedFeatures = categorizeFeatures(planFeatures);

                return (
                  <Card key={plan.id || index} className={`relative hover:shadow-lg transition-shadow ${getPlanColor(plan.plan_type)} border-2 ${isCurrentPlan(plan) ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PlanIcon className="h-6 w-6" />
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {plan.plan_type}
                          </Badge>
                          {isCurrentPlan(plan) && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      {plan.price && (
                        <div className="text-2xl font-bold">
                          ${plan.price}
                          {plan.billing_cycle && (
                            <span className="text-sm font-normal text-gray-600">
                              /{plan.billing_cycle}
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Features</span>
                          <Badge variant="secondary" className="text-xs">
                            {planFeatures.length}
                          </Badge>
                        </div>
                        
                        {Object.entries(categorizedFeatures).slice(0, 3).map(([category, features]) => (
                          <div key={category} className="text-xs">
                            <span className="font-medium text-gray-700 capitalize">
                              {category.replace('_', ' ')}:
                            </span>
                            <span className="ml-1 text-gray-600">
                              {features.length} feature{features.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                        
                        {Object.keys(categorizedFeatures).length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{Object.keys(categorizedFeatures).length - 3} more categories
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        size="sm"
                        onClick={() => handleViewPlanDetails(plan)}
                      >
                        {isCurrentPlan(plan) ? 'Manage Plan' : 'View Details'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.plans.map((plan, index) => {
                const PlanIcon = getPlanIcon(plan.plan_type);
                const planFeatures = getPlanFeatures(plan.plan_type);
                const categorizedFeatures = categorizeFeatures(planFeatures);

                return (
                  <Card key={plan.id || index} className={`${getPlanColor(plan.plan_type)} border-l-4 ${isCurrentPlan(plan) ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <PlanIcon className="h-8 w-8" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-bold">{plan.name}</h3>
                              {isCurrentPlan(plan) && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  Current Plan
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            {plan.price && (
                              <div className="text-xl font-bold">
                                ${plan.price}
                                {plan.billing_cycle && (
                                  <span className="text-sm font-normal text-gray-600">
                                    /{plan.billing_cycle}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              {planFeatures.length} features across {Object.keys(categorizedFeatures).length} categories
                            </div>
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleViewPlanDetails(plan)}
                          >
                            {isCurrentPlan(plan) ? 'Manage Plan' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Categories Overview */}
        {dashboardData.features.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Categories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categorizeFeatures(dashboardData.features)).map(([category, features]) => (
                <Card key={category} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold capitalize flex items-center justify-between">
                      {category.replace('_', ' ')}
                      <Badge variant="secondary">
                        {features.length}
                      </Badge>
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate">{feature.feature_name}</span>
                          <div className="flex items-center space-x-1">
                            {feature.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {feature.required_plan}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {features.length > 3 && (
                        <div className="text-xs text-gray-500 pt-2">
                          +{features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dashboardData.plans.length === 0 && dashboardData.features.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription data available</h3>
              <p className="text-gray-600 mb-4">
                Subscription plans and features will appear here once they're configured.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Debug info: Plans: {dashboardData.plans.length}, Features: {dashboardData.features.length}
              </div>
              <Button onClick={loadDashboardData}>
                Refresh Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
