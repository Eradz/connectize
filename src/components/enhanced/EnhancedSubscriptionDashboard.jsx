import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { getAuthorizationHeader } from '../../lib/helpers';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Crown, 
  Zap, 
  Shield,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const EnhancedSubscriptionDashboard = () => {
  const [subscription, setSubscription] = useState(null);
  const [features, setFeatures] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Get authentication headers
      const authHeaders = await getAuthorizationHeader();

      // Fetch current subscription with enhanced details
      const [subResponse, featuresResponse, analyticsResponse, plansResponse] = await Promise.all([
        fetch('/api/v1/subscriptions/current/', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }),
        fetch('/api/v1/subscriptions/usage/', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }),
        fetch('/api/v1/subscriptions/analytics/', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }),
        fetch('/api/v1/plans/', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        })
      ]);

      // Helper function to safely parse JSON responses
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

      const subData = await safeJsonParse(subResponse, {});
      const featuresData = await safeJsonParse(featuresResponse, { features_by_category: {} });
      const analyticsData = await safeJsonParse(analyticsResponse, {});
      const plansData = await safeJsonParse(plansResponse, { results: [] });

      setSubscription(subData);
      setFeatures(featuresData.features_by_category || {});
      setAnalytics(analyticsData);
      setPlans(plansData.results || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Core Social': Users,
      'Deal Management': BarChart3,
      'AI Services': Sparkles,
      'Enterprise Tools': Shield,
      'Logistics': TrendingUp,
      'Admin & Support': Settings
    };
    return iconMap[category] || CheckCircle;
  };

  const getImportanceColor = (importance) => {
    const colorMap = {
      'essential': 'bg-red-100 text-red-800',
      'important': 'bg-yellow-100 text-yellow-800',
      'premium': 'bg-purple-100 text-purple-800',
      'standard': 'bg-blue-100 text-blue-800'
    };
    return colorMap[importance] || 'bg-gray-100 text-gray-800';
  };

  const formatUsagePercentage = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-6">
            Choose a plan to unlock Connectize's powerful business features
          </p>
          <Button 
            className="bg-gold hover:bg-custom_yellow"
            onClick={() => setActiveTab('plans')}
          >
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {subscription.plan?.name} Plan
            </h1>
            <p className="text-blue-100">
              {subscription.plan?.value_proposition?.headline}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${subscription.plan?.price}
              <span className="text-lg font-normal">/{subscription.plan?.billing_cycle}</span>
            </div>
            <Badge className="bg-white text-blue-600 mt-2">
              {subscription.status}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="plans">Upgrade Plans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Features Available</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {subscription.feature_summary?.total_features || 0}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {subscription.feature_summary?.categories || 0}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Premium Features</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {subscription.feature_summary?.premium_features || 0}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Overview */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Current Period Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.current_usage && Object.entries(analytics.current_usage).map(([key, usage]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className={`text-sm ${formatUsagePercentage(usage.percentage)}`}>
                          {usage.used} / {usage.limit === 0 ? '∞' : usage.limit}
                        </span>
                      </div>
                      <Progress 
                        value={usage.percentage} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analytics?.recommendations && analytics.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, index) => (
                    <Alert key={index} className={rec.type === 'usage_warning' ? 'border-yellow-200' : 'border-blue-200'}>
                      <AlertDescription>
                        <strong>{rec.message}</strong>
                        {rec.suggestion && (
                          <div className="mt-1 text-sm text-gray-600">
                            {rec.suggestion}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            {features && Object.entries(features).map(([category, categoryFeatures]) => {
              const IconComponent = getCategoryIcon(category);
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {category}
                      <Badge variant="secondary" className="ml-auto">
                        {categoryFeatures.length} features
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {categoryFeatures.map((feature) => (
                        <div
                          key={feature.feature_code}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{feature.feature_name}</h4>
                              {feature.is_available ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge 
                                variant="secondary" 
                                className={getImportanceColor(feature.importance_level)}
                              >
                                {feature.importance_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {feature.description}
                            </p>
                            
                            {/* Feature Benefits */}
                            {feature.benefit_description?.benefits && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Key Benefits:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {feature.benefit_description.benefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Usage Info */}
                            {feature.usage_info && feature.usage_info.quota > 0 && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <div className="flex justify-between">
                                  <span>Usage:</span>
                                  <span>{feature.usage_info.used} / {feature.usage_info.quota}</span>
                                </div>
                                <Progress 
                                  value={feature.usage_info.percentage_used} 
                                  className="h-1 mt-1"
                                />
                              </div>
                            )}
                          </div>

                          {/* Upgrade Button */}
                          {feature.upgrade_required?.required && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="ml-4"
                              onClick={() => setActiveTab('plans')}
                            >
                              Upgrade
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          {analytics && (
            <>
              {/* Billing Period Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Period Start</p>
                      <p className="font-medium">
                        {analytics?.billing_period?.start ? new Date(analytics.billing_period.start).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Period End</p>
                      <p className="font-medium">
                        {analytics?.billing_period?.end ? new Date(analytics.billing_period.end).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <p className="font-medium text-blue-600">
                        {analytics?.billing_period?.days_remaining ?? 'N/A'} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analytics?.current_usage && Object.entries(analytics.current_usage).map(([key, usage]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium capitalize">
                            {key.replace('_', ' ')}
                          </h4>
                          <Badge variant="outline">
                            {usage.percentage.toFixed(1)}% used
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Usage</p>
                            <p className="font-medium">{usage.used}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Limit</p>
                            <p className="font-medium">
                              {usage.limit === 0 ? 'Unlimited' : usage.limit}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Projected Monthly</p>
                            <p className="font-medium text-blue-600">
                              {usage.projected_monthly}
                            </p>
                          </div>
                        </div>

                        <Progress 
                          value={usage.percentage} 
                          className="h-2 mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              {analytics?.insights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Usage Efficiency</p>
                        <p className="text-lg font-bold text-blue-800 capitalize">
                          {analytics.insights?.usage_efficiency || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Cost per Post</p>
                        <p className="text-lg font-bold text-green-800">
                          ${analytics.insights?.cost_per_post?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Value Score</p>
                        <p className="text-lg font-bold text-purple-800">
                          {analytics.insights?.value_score ? Math.round(analytics.insights.value_score) : 'N/A'}/100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gold text-dark">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">
                    ${plan.price}
                    <span className="text-base font-normal text-gray-600">
                      /{plan.billing_cycle}
                    </span>
                  </div>
                  {plan.tagline && (
                    <p className="text-sm text-gray-600">{plan.tagline}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Value Proposition */}
                    {plan.value_proposition && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {plan.value_proposition.headline}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {plan.value_proposition.description}
                        </p>
                      </div>
                    )}

                    {/* Feature Summary */}
                    {plan.feature_summary && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">
                          {plan.feature_summary.feature_density}
                        </p>
                      </div>
                    )}

                    {/* Key Benefits */}
                    {plan.value_proposition?.key_benefits && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Key Benefits:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.value_proposition.key_benefits.slice(0, 4).map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className={`w-full ${
                        plan.plan_type === subscription?.plan?.plan_type 
                          ? 'bg-gray-300 text-gray-600' 
                          : 'bg-gold hover:bg-custom_yellow'
                      }`}
                      disabled={plan.plan_type === subscription?.plan?.plan_type}
                    >
                      {plan.plan_type === subscription?.plan?.plan_type 
                        ? 'Current Plan' 
                        : 'Upgrade Now'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSubscriptionDashboard;
