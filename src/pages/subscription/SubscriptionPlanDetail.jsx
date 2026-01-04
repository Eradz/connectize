import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Settings, 
  ArrowLeft, 
  CheckCircle, 
  Users, 
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
// RESTORED: Real API imports
import subscriptionsApi from '../../api-services/subscriptions';
import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import { webRoutes } from '../../lib/webRoutes';
import { makeApiRequest } from '../../lib/helpers';

// Card components (kept your new design)
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 bg-white text-gray-700"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, className = "", variant = "default", disabled = false, onClick, ...props }) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  };
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const SubscriptionPlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState({
    plan: null,
    features: [],
    analytics: null,
    currentSubscription: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // RESTORED: Load plan details with real API calls
  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if test auth is active
      if (!isTestAuthActive()) {
        loginForTesting();
      }

      // Load plan details and related data using the correct API endpoints
      const [planResult, currentSubscriptionResult, actualFeaturesResult] = await Promise.all([
        // Get specific plan details using the existing subscription API
        subscriptionsApi.getPlanDetails(planId).catch(err => {
          return subscriptionsApi.getPlan(planId).catch(planErr => {
            console.error('❌ Plan fetch error:', planErr);
            // Create fallback plan data if the API fails
            return { 
              data: {
                id: planId,
                name: 'Professional Plan',
                plan_type: 'professional',
                description: 'Comprehensive features for growing businesses',
                price: 99.99,
                billing_cycle: 'monthly'
              }
            };
          });
        }),
        // Get current subscription using enhanced API
        makeApiRequest({
          url: 'api/permissions/user/permissions/',
          method: 'GET'
        }).catch(err => {
          console.error('Current subscription fetch error:', err);
          return { subscription_plan: null };
        }),
        // Get plan-specific features using the enhanced plans API
        makeApiRequest({
          url: `api/permissions/api/v2/enhanced-plans/${planId}/`,
          method: 'GET'
        }).catch(err => {
          console.error('Failed to load plan-specific features:', err);
          return { features: { features_by_category: {} } };
        })
      ]);

      // Initialize features data structure early to avoid reference errors
      let featuresData = {};
      let allPlanFeatures = [];

      // RESTORED: Extract features directly from the plan data
      let planFeaturesResult = { features_by_category: {} };
      if (planResult?.data?.features || planResult?.data?.plan?.features) {
        const planFeatures = planResult.data.features || planResult.data.plan.features;
        
        // Content Limits Features
        if (planFeatures.content_limits) {
          featuresData['Content Limits'] = [];
          
          const limits = planFeatures.content_limits;
          if (limits.posts_per_month) {
            featuresData['Content Limits'].push({
              id: 'posts_limit',
              feature_name: 'Posts per Month',
              feature_code: 'posts_per_month',
              description: `Create up to ${limits.posts_per_month.toLocaleString()} posts monthly`,
              value: limits.posts_per_month,
              enabled: true
            });
          }
          
          if (limits.products_per_month) {
            featuresData['Content Limits'].push({
              id: 'products_limit',
              feature_name: 'Products per Month', 
              feature_code: 'products_per_month',
              description: `List up to ${limits.products_per_month.toLocaleString()} products monthly`,
              value: limits.products_per_month,
              enabled: true
            });
          }
          
          if (limits.services_per_month) {
            featuresData['Content Limits'].push({
              id: 'services_limit',
              feature_name: 'Services per Month',
              feature_code: 'services_per_month', 
              description: `Offer up to ${limits.services_per_month.toLocaleString()} services monthly`,
              value: limits.services_per_month,
              enabled: true
            });
          }
        }
        
        // Technical Features
        if (planFeatures.technical_limits) {
          featuresData['Technical Features'] = [];
          
          const tech = planFeatures.technical_limits;
          if (tech.storage_gb) {
            featuresData['Technical Features'].push({
              id: 'storage_limit',
              feature_name: 'Cloud Storage',
              feature_code: 'storage_gb',
              description: `${tech.storage_gb}GB of secure cloud storage`,
              value: `${tech.storage_gb}GB`,
              enabled: true
            });
          }
          
          if (tech.team_members) {
            featuresData['Technical Features'].push({
              id: 'team_limit',
              feature_name: 'Team Members',
              feature_code: 'team_members',
              description: `Add up to ${tech.team_members} team members`,
              value: tech.team_members,
              enabled: true
            });
          }
          
          if (tech.api_calls_per_month) {
            featuresData['Technical Features'].push({
              id: 'api_limit',
              feature_name: 'API Calls',
              feature_code: 'api_calls_per_month',
              description: `${tech.api_calls_per_month.toLocaleString()} API calls monthly`,
              value: tech.api_calls_per_month.toLocaleString(),
              enabled: true
            });
          }
        }
        
        // Analytics Features
        if (planFeatures.analytics_features) {
          featuresData['Analytics Features'] = [];
          
          const analytics = planFeatures.analytics_features;
          if (analytics.basic_analytics) {
            featuresData['Analytics Features'].push({
              id: 'basic_analytics',
              feature_name: 'Basic Analytics',
              feature_code: 'basic_analytics',
              description: 'Essential performance insights and metrics',
              enabled: true
            });
          }
          
          if (analytics.advanced_analytics) {
            featuresData['Analytics Features'].push({
              id: 'advanced_analytics',
              feature_name: 'Advanced Analytics',
              feature_code: 'advanced_analytics',
              description: 'Detailed reporting and business intelligence',
              enabled: true
            });
          }
          
          if (analytics.api_access) {
            featuresData['Analytics Features'].push({
              id: 'analytics_api',
              feature_name: 'Analytics API Access',
              feature_code: 'analytics_api_access',
              description: 'Export and integrate analytics data via API',
              enabled: true
            });
          }
        }
        
        // AI Features
        if (planFeatures.ai_features) {
          featuresData['AI Features'] = [];
          
          const ai = planFeatures.ai_features;
          if (ai.ai_insights) {
            featuresData['AI Features'].push({
              id: 'ai_insights',
              feature_name: 'AI Insights',
              feature_code: 'ai_insights',
              description: 'AI-powered business insights and recommendations',
              enabled: true
            });
          }
          
          if (ai.ai_matchmaking) {
            featuresData['AI Features'].push({
              id: 'ai_matchmaking',
              feature_name: 'AI Matchmaking',
              feature_code: 'ai_matchmaking',
              description: 'Smart connections and networking suggestions',
              enabled: true
            });
          }
          
          if (ai.ai_predictions) {
            featuresData['AI Features'].push({
              id: 'ai_predictions',
              feature_name: 'AI Predictions',
              feature_code: 'ai_predictions',
              description: 'Predictive analytics for business planning',
              enabled: true
            });
          }
          
          if (ai.compliance_monitoring) {
            featuresData['AI Features'].push({
              id: 'compliance_monitoring',
              feature_name: 'Compliance Monitoring',
              feature_code: 'ai_compliance_monitoring',
              description: 'Automated compliance and risk monitoring',
              enabled: true
            });
          }
          
          if (ai.custom_models) {
            featuresData['AI Features'].push({
              id: 'custom_ai_models',
              feature_name: 'Custom AI Models',
              feature_code: 'custom_ai_models',
              description: 'Deploy and train custom AI models',
              enabled: true
            });
          }
        }
        
        // Advertising Features
        if (planFeatures.advertising_features) {
          featuresData['Advertising Features'] = [];
          
          const ads = planFeatures.advertising_features;
          if (ads.featured_ads) {
            featuresData['Advertising Features'].push({
              id: 'featured_ads',
              feature_name: 'Featured Ads',
              feature_code: 'featured_ads',
              description: 'Promote your content with featured advertising',
              enabled: true
            });
          }
          
          if (ads.max_ad_spend && ads.max_ad_spend > 0) {
            featuresData['Advertising Features'].push({
              id: 'ad_spend_limit',
              feature_name: 'Monthly Ad Budget',
              feature_code: 'max_ad_spend',
              description: `Up to $${ads.max_ad_spend.toLocaleString()} monthly ad spend`,
              value: `$${ads.max_ad_spend.toLocaleString()}`,
              enabled: true
            });
          }
          
          if (ads.video_ads) {
            featuresData['Advertising Features'].push({
              id: 'video_ads',
              feature_name: 'Video Advertising',
              feature_code: 'video_ads',
              description: 'Create and run engaging video advertisements',
              enabled: true
            });
          }
          
          if (ads.real_time_bidding) {
            featuresData['Advertising Features'].push({
              id: 'rtb',
              feature_name: 'Real-Time Bidding',
              feature_code: 'real_time_bidding',
              description: 'Access to real-time bidding advertising',
              enabled: true
            });
          }
        }
        
        // Support Features
        if (planFeatures.support_features) {
          featuresData['Support Features'] = [];
          
          const support = planFeatures.support_features;
          if (support.support_level) {
            featuresData['Support Features'].push({
              id: 'support_level',
              feature_name: 'Support Level',
              feature_code: 'support_level',
              description: `${support.support_level.charAt(0).toUpperCase() + support.support_level.slice(1)} support access`,
              value: support.support_level,
              enabled: true
            });
          }
          
          if (support.sla_hours) {
            featuresData['Support Features'].push({
              id: 'sla_response',
              feature_name: 'SLA Response Time',
              feature_code: 'sla_response_hours',
              description: `${support.sla_hours} hour response time guarantee`,
              value: `${support.sla_hours}h`,
              enabled: true
            });
          }
          
          if (support.priority_support) {
            featuresData['Support Features'].push({
              id: 'priority_support',
              feature_name: 'Priority Support',
              feature_code: 'priority_support',
              description: 'Fast-track support with priority handling',
              enabled: true
            });
          }
          
          if (support.dedicated_manager) {
            featuresData['Support Features'].push({
              id: 'dedicated_manager',
              feature_name: 'Dedicated Account Manager',
              feature_code: 'dedicated_account_manager',
              description: 'Personal account manager for premium support',
              enabled: true
            });
          }
        }
        
        // Branding Features
        if (planFeatures.branding_features) {
          featuresData['Branding Features'] = [];
          
          const branding = planFeatures.branding_features;
          if (branding.custom_branding) {
            featuresData['Branding Features'].push({
              id: 'custom_branding',
              feature_name: 'Custom Branding',
              feature_code: 'custom_branding',
              description: 'Customize the platform with your brand colors and logo',
              enabled: true
            });
          }
          
          if (branding.white_label) {
            featuresData['Branding Features'].push({
              id: 'white_label',
              feature_name: 'White Label Solution',
              feature_code: 'white_label',
              description: 'Complete white-label platform customization',
              enabled: true
            });
          }
        }
        
        // Clean up empty categories
        Object.keys(featuresData).forEach(category => {
          if (featuresData[category].length === 0) {
            delete featuresData[category];
          }
        });
        
        planFeaturesResult = { features_by_category: featuresData };
      }

      // Extract features data - prioritize plan-specific features from enhanced plans API
      // Reset the variables for processing
      featuresData = {};
      allPlanFeatures = [];

      // First, try to use plan-specific features from enhanced plans API
      if (actualFeaturesResult?.features) {
        featuresData = actualFeaturesResult.features;
        allPlanFeatures = Object.values(featuresData).flat();
      }
      // Fallback to manual features from plan data if API features not available
      else if (planFeaturesResult?.features_by_category) {
        featuresData = planFeaturesResult.features_by_category;
        allPlanFeatures = Object.values(featuresData).flat();
      }

      // Create final plan data structure
      const finalPlanData = {
        plan: planResult?.data?.plan || planResult?.data || {
          id: planId,
          name: 'Professional Plan',
          plan_type: 'professional',
          description: 'Comprehensive features for growing businesses',
          price: 99.99,
          billing_cycle: 'monthly'
        },
        features: allPlanFeatures,
        featuresCategories: featuresData,
        currentSubscription: currentSubscriptionResult?.subscription_plan || planResult?.data?.current_subscription
      };

      setPlanData(finalPlanData);

    } catch (error) {
      console.error('❌ Failed to load plan details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    }
  }, [planId]);

  // Check if this plan is the current subscription
  const isCurrentPlan = () => {
    if (!planData.currentSubscription || !planData.plan) return false;
    return planData.currentSubscription.plan?.id === planData.plan.id ||
           planData.currentSubscription.plan_type === planData.plan.plan_type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !planData.plan) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {error ? 'Error loading plan details' : 'Plan not found'}
                </span>
              </div>
              <p className="text-red-600 mt-2">
                {error || `Plan with ID ${planId} could not be found.`}
              </p>
              <div className="flex space-x-4 mt-4">
                <Button 
                  onClick={() => navigate(webRoutes.subscriptions)} 
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
                <Button onClick={loadPlanDetails}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { plan } = planData;
  const categorizedFeatures = planData.featuresCategories || {};
  const totalFeatures = planData.features.length;
  const totalCategories = Object.keys(categorizedFeatures).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - KEPT YOUR NEW DESIGN */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => navigate(webRoutes.subscriptions)}
              className="flex items-center justify-center h-12 w-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {plan?.name || 'Subscription Plan'}
              </h1>
            </div>
          </div>
          <p className="text-gray-500 text-lg ml-16">
            {plan?.description || `${plan?.plan_type || 'Professional'} subscription plan`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - KEPT YOUR NEW DESIGN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card - KEPT YOUR NEW DESIGN */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-700 mb-2 font-medium">
                      {plan?.plan_type?.charAt(0).toUpperCase() + plan?.plan_type?.slice(1) || 'Professional'}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 border-b-4 border-red-500 pb-1">
                        ${plan?.price || '99.99'}
                      </span>
                      <span className="text-gray-600 ml-2 text-lg">/ {plan?.billing_cycle || 'month'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Features Included: {totalFeatures}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Categories: {totalCategories}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Capabilities - KEPT YOUR NEW DESIGN */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Features & Capabilities
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(categorizedFeatures).map(([category, features]) => (
                  <Card key={category} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {category}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {features.length} Feature{features.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <ul className="space-y-2.5">
                        {features.map((feature, index) => (
                          <li key={feature.id || index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              • {feature.feature_name}
                            </span>
                            <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - KEPT YOUR NEW DESIGN */}
          <div className="space-y-6">
            {/* Subscription Details - KEPT YOUR NEW DESIGN */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-900 text-base">Subscription Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {plan?.description || 'Perfect for businesses getting started'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-0">
                {isCurrentPlan() ? (
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center text-sm" disabled>
                    <Check className="h-5 w-5 mr-2" />
                    Current Plan
                  </button>
                ) : (
                  <button 
                    className="w-full text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-sm shadow-sm"
                    style={{ background: 'linear-gradient(to right, #FFC000, #FF8400)' }}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Upgrade to This Plan
                  </button>
                )}
                
                <button 
                  onClick={() => navigate(webRoutes.subscriptions)}
                  className="w-full border-2 border-orange-200 bg-orange-50 text-orange-600 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-orange-100 transition-colors text-sm"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Compare Plans
                </button>
              </CardContent>
            </Card>

            {/* Why Choose This Plan - KEPT YOUR NEW DESIGN */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-900 text-base">Why Choose This Plan?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {plan?.description || 'Perfect for businesses getting started'}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Access to {totalFeatures} powerful features
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Coverage across {totalCategories} feature categories
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • 24/7 customer support
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Regular feature updates
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  {plan?.plan_type !== 'trial' && (
                    <li className="flex items-start justify-between">
                      <span className="text-sm text-gray-700">
                        • Priority technical assistance
                      </span>
                      <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanDetail;