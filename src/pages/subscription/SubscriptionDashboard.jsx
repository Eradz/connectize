import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, CheckCircle2} from 'lucide-react';

// CHANGED: Real API imports instead of mock
import subscriptionsApi from '../../api-services/subscriptions';
import { useSubscription } from '../../context/SubscriptionContext';
// import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import { webRoutes } from '../../lib/webRoutes';
import TrialBanner from '../../components/TrialBanner';
import { getCurrencySymbol } from '../../utils/currency';

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
  const { currentSubscription, isCurrentUserPlan } = useSubscription();
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

      // if (!isTestAuthActive()) {
      //   await loginForTesting();
      // }

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
    const hasSubscription = !!dashboardData.currentSubscription;
    
    return [
      { 
        label: 'API Calls', 
        current: hasSubscription ? (usage.api_calls?.used || 0) : 0, 
        limit: hasSubscription ? (usage.api_calls?.limit || 0) : 0, 
        percentage: hasSubscription ? (usage.api_calls?.percentage || 0) : 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Posts', 
        current: hasSubscription ? (usage.posts?.used || 0) : 0, 
        limit: hasSubscription ? (usage.posts?.limit || 0) : 0, 
        percentage: hasSubscription ? (usage.posts?.percentage || 0) : 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Storage', 
        current: hasSubscription ? (usage.storage?.used_gb ? `${usage.storage.used_gb}GB` : '0') : '0', 
        limit: hasSubscription ? (usage.storage?.limit_gb ? `${usage.storage.limit_gb}GB` : '100GB') : '0GB', 
        percentage: hasSubscription ? (usage.storage?.percentage || 0) : 0, 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Ad Spend', 
        current: hasSubscription ? (usage.ad_spend?.current ? `${usage.ad_spend.current}` : '0') : '0', 
        limit: hasSubscription ? (usage.ad_spend?.limit || 0) : 0, 
        percentage: hasSubscription ? (usage.ad_spend?.percentage || 0) : 0, 
        color: 'bg-yellow-400' 
      }
    ];
  };

  const getSummaryItems = () => {
    const usage = dashboardData.usage || {};
    const hasSubscription = !!dashboardData.currentSubscription;
    
    return [
      { 
        label: 'API Calls', 
        value: hasSubscription ? `${usage.api_calls?.used || 0} / ${usage.api_calls?.limit || 0}` : '0 / 0', 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'Posts', 
        value: hasSubscription ? `${usage.posts?.used || 0} / ${usage.posts?.limit || 0}` : '0 / 0', 
        color: 'bg-purple-400' 
      },
      { 
        label: 'Storage', 
        value: hasSubscription ? `${usage.storage?.used_gb || 0}GB / ${usage.storage?.limit || 0}GB` : '0GB / 0GB', 
        color: 'bg-pink-400' 
      },
      { 
        label: 'Ad Spend', 
        value: hasSubscription ? `${usage.ad_spend?.current || 0} / ${usage.ad_spend?.limit || 0}` : '0 / 0', 
        color: 'bg-blue-400' 
      }
    ];
  };

  // CHANGED: Navigation instead of alert
  const handleChoosePackage = (plan) => {
    
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
  // const plans = getFormattedPlans();
  const currentPlan = dashboardData.currentSubscription?.plan;
  

  if (loading) {
    return (
      <div className="min-h-screen  p-6">
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
    <div className="min-h-screen  p-6">
      <div className='mb-2'>
      <TrialBanner persistent={true} />

      </div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your subscription plans and features</p>
          </div>
          {
            !!currentPlan && 
              <Link
              to={webRoutes.subscriptionManagement}
              className="px-6 py-2 text-center rounded-full font-medium transition-colors text-gray-800 hover:opacity-90 bg-[#FFE7A4]"
            >
              Manage Subscription
            </Link>
          }
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
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.billing_info?.next_billing_amount ? `$${dashboardData.currentSubscription.billing_info.next_billing_amount}` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Autorenew:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.billing_info?.auto_renew !== undefined ? (dashboardData.currentSubscription.billing_info.auto_renew ? 'Enabled' : 'Disabled') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan Type</span>
                  <span className="capitalize text-sm font-medium text-gray-900">
                    {currentPlan?.plan_type ? currentPlan.plan_type : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Started:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.current_period_start 
                      ? new Date(dashboardData.currentSubscription.current_period_start).toLocaleDateString('en-GB')
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Billing:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.currentSubscription?.current_period_end 
                      ? new Date(dashboardData.currentSubscription.current_period_end).toLocaleDateString('en-GB')
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plan</h2>
          
          {dashboardData.plans && dashboardData.plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.plans.map((plan, index) => {
                const isCurrentPlan = isCurrentUserPlan(plan);
                return (
                <div
                  key={plan.id || index}
                  className={`rounded-2xl p-6 shadow-md flex flex-col justify-between border-2 ${isCurrentPlan ? 'border-green-500' : 'border-transparent'}`}
                  style={{ backgroundColor: isCurrentPlan ? '#212529' : '#FFDB76' }}
                >
                  {isCurrentPlan && (
                    <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-green-100 w-fit rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Current Plan</span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className={`text-lg font-bold mb-3 ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <div className="mb-2">
                      <span className={`text-3xl font-bold ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{`${getCurrencySymbol(plan.currency || '$')}${plan.price}`}</span>
                      <span className={`text-sm ${isCurrentPlan ? 'text-gray-300' : 'text-gray-700'}`}> / {plan.billing_cycle || 'monthly'}</span>
                    </div>
                    <div 
                      className="w-20 h-0.5"
                      style={{ 
                        backgroundColor: isCurrentPlan ? '#EF4444' : '#343A40'
                      }}
                    />
                    <ul className="space-y-2.5 mt-6">
                      {plan?.feature_highlights?.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`} strokeWidth={2.5} />
                          <span className={`text-sm ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleChoosePackage(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all border-2 ${isCurrentPlan ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: isCurrentPlan 
                        ? isCurrentPlan ? 'rgba(255,255,255,0.3)' : '#d4d4d4'
                        : isCurrentPlan ? 'transparent' : '#FFDB76',
                      color: isCurrentPlan ? '#FFFFFF' : '#343A40',
                      borderColor: isCurrentPlan ? '#10b981' : (isCurrentPlan ? '#FFFFFF' : '#343A40')
                    }}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Choose package'}
                  </button>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4-4v6.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 01-.707.293H5a1 1 0 01-1-1v-10.586a1 1 0 01.293-.707l6.414-6.414A1 1 0 008 5.414V4z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-600 text-center max-w-sm mb-6">
                There are currently no subscription plans available.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gold text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;