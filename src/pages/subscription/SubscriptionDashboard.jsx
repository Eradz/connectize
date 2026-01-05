import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown} from 'lucide-react';

// CHANGED: Real API imports instead of mock
import subscriptionsApi from '../../api-services/subscriptions';
import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import { webRoutes } from '../../lib/webRoutes';

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

const SubscriptionDashboard = () => {
  const navigate = useNavigate(); // ADDED
  const [activeTab, setActiveTab] = useState('manage');
  const [billingCycle, setBillingCycle] = useState('Weekly');
  const [dashboardData, setDashboardData] = useState({
    plans: [],
    currentSubscription: null,
    analytics: null,
    features: [],
    usage: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data - CHANGED API calls
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isTestAuthActive()) {
        await loginForTesting();
      }

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

      const featuresData = featuresResult?.data?.features_by_category || {};
      const allFeatures = Object.values(featuresData).flat().map(f => ({
        ...f,
        minimum_plan: f.minimum_plan || f.required_plan || 'trial'
      }));

      const extractedSubscription = currentSubscriptionResult?.data?.subscription || currentSubscriptionResult?.data || null;
      
      setDashboardData({
        plans: plansResult?.data?.results || [],
        features: allFeatures || [],
        featuresCategories: featuresData,
        analytics: analyticsResult?.data,
        currentSubscription: extractedSubscription,
        usage: extractedSubscription?.usage_summary || null
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

  // Get usage data with fallbacks - EXACT SAME
  const getUsageData = () => {
    const usage = dashboardData.usage || {};
    return [
      { 
        label: 'API Calls', 
        current: usage.api_calls?.current || 0, 
        limit: usage.api_calls?.limit || 0, 
        percentage: usage.api_calls?.percentage || 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Posts', 
        current: usage.posts?.current || 0, 
        limit: usage.posts?.limit || 0, 
        percentage: usage.posts?.percentage || 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Storage', 
        current: usage.storage?.current ? `${usage.storage.current}%` : '75%', 
        limit: usage.storage?.limit ? `${usage.storage.limit}%` : '100%', 
        percentage: usage.storage?.percentage || 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Ad Spend', 
        current: usage.ad_spend?.current ? `$${usage.ad_spend.current}` : '$0', 
        limit: usage.ad_spend?.limit || 0, 
        percentage: usage.ad_spend?.percentage || 0, 
        color: 'bg-yellow-400' 
      }
    ];
  };

  const getSummaryItems = () => {
    const usage = dashboardData.usage || {};
    return [
      { 
        label: 'API Calls', 
        value: `${usage.api_calls?.current || 1250} / ${usage.api_calls?.limit || 28000}`, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Posts', 
        value: `${usage.posts?.current || 19} / ${usage.posts?.limit || 200}`, 
        color: 'bg-purple-400' 
      },
      { 
        label: 'Storage', 
        value: `${usage.storage?.current || 2}GB / ${usage.storage?.limit || 100}GB`, 
        color: 'bg-pink-400' 
      },
      { 
        label: 'Ad Spend', 
        value: `${usage.ad_spend?.current || 3} / ${usage.ad_spend?.limit || 1000}`, 
        color: 'bg-blue-400' 
      }
    ];
  };

  // Format plan data - EXACT SAME
  const getFormattedPlans = () => {
    if (dashboardData.plans.length === 0) {
      return [
        {
          name: 'Starter',
          price: '$29.99',
          plan_type: 'starter',
          color: '#212529',
          textColor: 'text-white',
          buttonColor: 'bg-white text-gray-800',
          features: [
            'All sessions access',
            'Summit materials',
            'Tea & lunch breaks',
            'Gala dinner',
            'Visa assistance'
          ]
        },
        {
          name: 'Professional',
          price: '$99.99',
          plan_type: 'professional',
          color: '#FFDB76',
          textColor: 'text-gray-800',
          buttonColor: 'bg-gray-800 text-white',
          features: [
            'Economy flight',
            '5 nights in standard room',
            'All-access summit entry',
            'Meals + Gala',
            'Shuttle transport',
            'Visa assistance'
          ]
        },
        {
          name: 'Enterprise',
          price: '$299.99',
          plan_type: 'enterprise',
          color: '#FFDB76',
          textColor: 'text-gray-800',
          buttonColor: 'bg-gray-800 text-white',
          features: [
            'Full-Scale Solution for Large Enterprises',
            'Admin functions: 2 features',
            'all services: 2 features',
            'analytic: 1 feature',
            'Transport (airport + daily)',
            'Visa assistance'
          ]
        }
      ];
    }

    return dashboardData.plans.map(plan => {
      const planType = plan.plan_type?.toLowerCase();
      let color, textColor, buttonColor;

      if (planType === 'starter' || planType === 'trial') {
        color = '#212529';
        textColor = 'text-white';
        buttonColor = 'bg-white text-gray-800';
      } else if (planType === 'professional') {
        color = '#FFDB76';
        textColor = 'text-gray-800';
        buttonColor = 'bg-gray-800 text-white';
      } else {
        color = '#FFDB76';
        textColor = 'text-gray-800';
        buttonColor = 'bg-gray-800 text-white';
      }

      // Extract features from plan
      const features = [];
      if (plan.max_projects) features.push(`${plan.max_projects} Projects`);
      if (plan.max_storage_gb) features.push(`${plan.max_storage_gb}GB Storage`);
      if (plan.max_team_members) features.push(`${plan.max_team_members} Team Members`);
      if (plan.ai_insights_enabled) features.push('AI Insights');
      if (plan.priority_support) features.push('Priority Support');
      if (plan.api_access_enabled) features.push('API Access');

      return {
        ...plan,
        price: `$${plan.price}`,
        color,
        textColor,
        buttonColor,
        features: features.length > 0 ? features : [
          'Basic features',
          'Standard support',
          'Cloud storage',
          'Team collaboration'
        ]
      };
    });
  };

  // CHANGED: Navigation instead of alert
  const handleChoosePackage = (plan) => {
    console.log('Choosing package:', plan);
    
    if (!plan || !plan.id) {
      console.error('❌ No plan ID available');
      if (plan?.plan_type) {
        const fallbackRoute = webRoutes.subscriptionPlanDetail.replace(':planId', plan.plan_type);
        navigate(fallbackRoute);
      }
      return;
    }
    
    const targetRoute = webRoutes.subscriptionPlanDetail.replace(':planId', plan.id);
    navigate(targetRoute);
  };

  const usageData = getUsageData();
  const summaryItems = getSummaryItems();
  const plans = getFormattedPlans();
  const currentPlan = dashboardData.currentSubscription?.plan;

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your subscription plans and features</p>
          </div>
          <Link
            to={webRoutes.subscriptionManagement}
            className="px-6 py-2 rounded-full font-medium transition-colors text-gray-800 hover:opacity-90"
            style={{ backgroundColor: '#FFE7A4' }}
          >
            Manage Subscription
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('manage')}
            className="px-6 py-2 rounded-full font-medium transition-colors text-gray-800"
            style={{ 
              backgroundColor: activeTab === 'manage' ? '#FFE7A4' : '#ffffff',
              color: activeTab === 'manage' ? '#1f2937' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'manage') e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'manage') e.target.style.backgroundColor = '#ffffff';
            }}
          >
            Manage Subscription
          </button>
          <Link
            to={webRoutes.subscriptionManagement + '?tab=billing'}
            onClick={() => setActiveTab('billing')}
            className="px-6 py-2 rounded-full font-medium transition-colors"
            style={{ 
              backgroundColor: activeTab === 'billing' ? '#FFE7A4' : '#ffffff',
              color: activeTab === 'billing' ? '#1f2937' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'billing') e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'billing') e.target.style.backgroundColor = '#ffffff';
            }}
          >
            View Billing
          </Link>
          <Link
            to={webRoutes.subscriptionManagement + '?tab=dashboard'}
            onClick={() => setActiveTab('analytics')}
            className="px-6 py-2 rounded-full font-medium transition-colors"
            style={{ 
              backgroundColor: activeTab === 'analytics' ? '#FFE7A4' : '#ffffff',
              color: activeTab === 'analytics' ? '#1f2937' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'analytics') e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'analytics') e.target.style.backgroundColor = '#ffffff';
            }}
          >
            Usage Analytics
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan Section */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Current Plan</h2>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="capitalize text-lg font-semibold text-gray-900">
                    {currentPlan ? `${currentPlan.name} ${currentPlan.price}` : 'Not subscribed'} / {currentPlan ? currentPlan.billing_cycle : 'Month' }
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{currentPlan ? currentPlan.description : 'No description available'}</p>
                </div>
              </div>
            </div>

            {/* Usage Bars */}
            <div className="space-y-6">
              {usageData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900 block">{item.label}</span>
                    <p className="text-xs text-gray-400">{item.current} / {item.limit}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 h-3 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 border-r-2 border-black"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: '#FFC107'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-500 w-12 text-right">{Math.round(item.percentage)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary & Billing Info */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Summary</h3>
              <div className="space-y-4">
                {summaryItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: item.color === 'bg-yellow-400' ? '#F1C644' : 
                                                 item.color === 'bg-purple-400' ? '#F1C644' : 
                                                 item.color === 'bg-pink-400' ? '#F1C644' : '#F1C644' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">{item.label}: <span className="font-semibold text-gray-900">{item.value}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Billing Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Amount:</span>
                  <span className="text-sm font-medium text-gray-900">${dashboardData.currentSubscription?.billing_info?.next_billing_amount || '$0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Autorenew:</span>
                  <span className="text-sm font-medium text-gray-900">{dashboardData.currentSubscription?.billing_info?.auto_renew ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan Type</span>
                  <span className="capitalize text-sm font-medium text-gray-900">
                    {currentPlan?.plan_type || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Started:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.current_period_start 
                      ? new Date(dashboardData.currentSubscription.current_period_start).toLocaleDateString('en-GB')
                      : 'No specified date'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Billing:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.current_period_end 
                      ? new Date(dashboardData.currentSubscription.current_period_end).toLocaleDateString('en-GB')
                      : 'No specified date'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.id || index}
                className="rounded-2xl p-6 shadow-md flex flex-col justify-between"
                style={{ backgroundColor: plan.color }}
              >
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-3 ${plan.plan_type === 'starter' ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <div className="mb-2">
                    <span className={`text-3xl font-bold ${plan.plan_type === 'starter' ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.plan_type === 'starter' ? 'text-gray-300' : 'text-gray-700'}`}> / {plan.billing_cycle || 'month'}</span>
                  </div>
                  <div 
                    className="w-20 h-0.5"
                    style={{ 
                      backgroundColor: plan.plan_type === 'starter' ? '#EF4444' : '#343A40'
                    }}
                  />
                  <ul className="space-y-2.5 mt-6">
                    {plan.feature_highlights.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.plan_type === 'starter' ? 'text-white' : 'text-gray-900'}`} strokeWidth={2.5} />
                        <span className={`text-sm ${plan.plan_type === 'starter' ? 'text-white' : 'text-gray-900'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>


                <button
                  onClick={() => handleChoosePackage(plan)}
                  className="w-full py-3 rounded-lg font-semibold transition-all border-2"
                  style={{
                    backgroundColor: plan.plan_type === 'starter' ? 'transparent' : '#FFDB76',
                    color: plan.plan_type === 'starter' ? '#FFFFFF' : '#343A40',
                    borderColor: plan.plan_type === 'starter' ? '#FFFFFF' : '#343A40'
                  }}
                >
                  Choose package
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;