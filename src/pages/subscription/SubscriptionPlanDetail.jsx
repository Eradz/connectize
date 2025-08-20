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
  Info
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import subscriptionsApi from '../../api-services/subscriptions';
import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import { webRoutes } from '../../lib/webRoutes';
import { getSession } from '../../lib/session';
import { makeApiRequest } from '../../lib/helpers';

// Card components
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

  // Load plan details
  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if test auth is active
      if (!isTestAuthActive()) {
        console.log('🔑 Setting up test authentication...');
        loginForTesting();
      }

      console.log('📊 Loading plan details for ID:', planId);

      // Load plan details and related data using the correct API endpoints
      const [planResult, currentSubscriptionResult, actualFeaturesResult] = await Promise.all([
        // Get specific plan details using the existing subscription API
        subscriptionsApi.getPlanDetails(planId).catch(err => {
          console.log('⚠️ Plan details not available, trying regular plan endpoint:', err);
          return subscriptionsApi.getPlan(planId).catch(planErr => {
            console.error('❌ Plan fetch error:', planErr);
            // Create fallback plan data if the API fails
            console.log('🔧 Using fallback plan data for ID:', planId);
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
        // Get actual features count from permissions API (same as dashboard)
        subscriptionsApi.getAvailableFeatures().catch(err => {
          console.error('Failed to load actual features count:', err);
          return { data: { features_by_category: {} } };
        })
      ]);

      // Extract features directly from the plan data
      let planFeaturesResult = { features_by_category: {} };
      if (planResult?.data?.features || planResult?.data?.plan?.features) {
        const planFeatures = planResult.data.features || planResult.data.plan.features;
        console.log('📋 Using actual plan features from database:', planFeatures);
        
        const featuresData = {};
        
        console.log('🔍 Processing plan features:', planFeatures);
        
        // Content Limits Features
        if (planFeatures.content_limits) {
          console.log('✅ Processing content_limits:', planFeatures.content_limits);
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
          console.log('✅ Processing technical_limits:', planFeatures.technical_limits);
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
          console.log('✅ Processing analytics_features:', planFeatures.analytics_features);
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
          console.log('✅ Processing ai_features:', planFeatures.ai_features);
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
          console.log('✅ Processing advertising_features:', planFeatures.advertising_features);
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
          console.log('✅ Processing support_features:', planFeatures.support_features);
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
          console.log('✅ Processing branding_features:', planFeatures.branding_features);
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
        console.log('🔧 Features before cleanup:', featuresData);
        Object.keys(featuresData).forEach(category => {
          if (featuresData[category].length === 0) {
            console.log(`❌ Removing empty category: ${category}`);
            delete featuresData[category];
          } else {
            console.log(`✅ Keeping category "${category}" with ${featuresData[category].length} features`);
          }
        });
        
        planFeaturesResult = { features_by_category: featuresData };
        console.log('✅ Successfully converted plan features:', featuresData);
      } else {
        console.log('❌ No features found in plan data - checking structure:');
        console.log('planResult.data:', planResult?.data);
      }

      console.log('📊 Plan detail API responses:', {
        planResponse: planResult,
        featuresResponse: planFeaturesResult,
        currentSubscriptionResponse: currentSubscriptionResult
      });

      console.log('🔍 Detailed features response:', JSON.stringify(planFeaturesResult, null, 2));
      console.log('🔍 Plan data:', JSON.stringify(planResult?.data, null, 2));

      // Extract features data - prioritize actual features from permissions API
      let featuresData = {};
      let allPlanFeatures = [];

      // First, try to use actual features from permissions API (same as dashboard)
      if (actualFeaturesResult?.data?.features_by_category) {
        featuresData = actualFeaturesResult.data.features_by_category;
        allPlanFeatures = Object.values(featuresData).flat();
        console.log('✅ Using actual features from permissions API:', {
          totalFeatures: allPlanFeatures.length,
          categories: Object.keys(featuresData).length
        });
      }
      // Fallback to manual features from plan data if API features not available
      else if (planFeaturesResult?.features_by_category) {
        featuresData = planFeaturesResult.features_by_category;
        allPlanFeatures = Object.values(featuresData).flat();
        console.log('⚠️ Using fallback manual features from plan data');
      }

      console.log('� Final features processing:', {
        featuresDataKeys: Object.keys(featuresData),
        totalFeatures: allPlanFeatures.length,
        featuresByCategory: Object.entries(featuresData).map(([cat, features]) => 
          ({ category: cat, count: features.length })
        )
      });

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
      
      console.log('✅ Setting final plan data:', {
        plan: finalPlanData.plan,
        featuresCount: finalPlanData.features.length,
        categoriesCount: Object.keys(finalPlanData.featuresCategories).length,
        hasName: !!finalPlanData.plan?.name,
        planName: finalPlanData.plan?.name,
        planType: finalPlanData.plan?.plan_type
      });

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

  // Get plan icon
  const getPlanIcon = (planType) => {
    const icons = {
      'trial': Star,
      'starter': Zap,
      'professional': Crown,
      'enterprise': Shield,
      'custom': Settings
    };
    const IconComponent = icons[planType?.toLowerCase()] || Star;
    return IconComponent;
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

  // Get plan features for this specific plan (only included features)
  const getPlanFeatures = (planType) => {
    if (!planData.features.length) return [];
    
    const planHierarchy = {
      'trial': ['trial'],
      'starter': ['trial', 'starter'],
      'professional': ['trial', 'starter', 'professional'],
      'enterprise': ['trial', 'starter', 'professional', 'enterprise'],
      'custom': ['trial', 'starter', 'professional', 'enterprise', 'custom']
    };

    const availablePlans = planHierarchy[planType?.toLowerCase()] || ['trial'];
    
    return planData.features.filter(feature => 
      availablePlans.includes(feature.minimum_plan?.toLowerCase())
    );
  };

  // Categorize features by their category
  const categorizeFeatures = (features) => {
    // Always categorize the filtered features passed as parameter
    const categories = {};
    features.forEach(feature => {
      const category = feature.feature_category || feature.category || 'General Features';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(feature);
    });
    return categories;
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
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
              <div className="mt-4">
                <p className="text-sm text-gray-600">Debug info:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify({
                    planId,
                    planData,
                    error,
                    loading
                  }, null, 2)}
                </pre>
              </div>
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
  const PlanIcon = getPlanIcon(plan.plan_type);
  const planFeatures = getPlanFeatures(plan.plan_type);
  const categorizedFeatures = categorizeFeatures(planFeatures);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(webRoutes.subscriptions)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {plan?.name || 'Subscription Plan'}
              </h1>
              <p className="text-gray-600 mt-1">
                {plan?.description || `${plan?.plan_type || 'Professional'} subscription plan`}
              </p>
            </div>
          </div>
          
          {isCurrentPlan() && (
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              Current Plan
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plan Overview */}
            <Card className={`${getPlanColor(plan.plan_type)} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-12 w-12 bg-white rounded-full">
                      <PlanIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{plan?.name || 'Subscription Plan'}</h2>
                      <p className="text-sm opacity-80">{plan?.plan_type || 'Professional'} Plan</p>
                    </div>
                  </div>
                  
                  {plan?.price && (
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        ${plan.price}
                      </div>
                      {plan?.billing_cycle && (
                        <div className="text-sm opacity-80">
                          per {plan.billing_cycle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {plan.description && (
                  <p className="text-lg mb-6">{plan.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Features Included</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {planFeatures.length}
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Categories</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {Object.keys(categorizedFeatures).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features by Category */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Features & Capabilities
              </h2>
              
              <div className="space-y-6">
                {Object.entries(categorizedFeatures).map(([category, features]) => (
                  <Card key={category} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold capitalize">
                          {category.replace('_', ' ')}
                        </h3>
                        <Badge variant="secondary">
                          {features.length} feature{features.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                          <div key={feature.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 mt-0.5">
                              {/* Show green tick for features included in this plan */}
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{feature.feature_name}</h4>
                              {feature.description && (
                                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  ✓ Included
                                </Badge>
                                {feature.value && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    {typeof feature.value === 'number' ? feature.value.toLocaleString() : feature.value}
                                  </Badge>
                                )}
                                {feature.enabled === true && (
                                  <Badge className="text-xs bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Subscription Details</h3>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {plan.price && (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                    </div>
                    {plan.billing_cycle && (
                      <div className="text-sm text-gray-600">
                        per {plan.billing_cycle}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plan Type</span>
                    <Badge variant="outline">{plan.plan_type}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Features</span>
                    <span className="font-medium">{planFeatures.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium">{Object.keys(categorizedFeatures).length}</span>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  {isCurrentPlan() ? (
                    <div className="space-y-2">
                      <Button className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(webRoutes.subscriptionManagement)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Subscription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade to This Plan
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Compare Plans
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Benefits */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Why Choose This Plan?</h3>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Access to {planFeatures.length} powerful features</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Coverage across {Object.keys(categorizedFeatures).length} feature categories</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>24/7 customer support</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Regular feature updates</span>
                  </div>
                  
                  {plan.plan_type !== 'trial' && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Priority technical assistance</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanDetail;
