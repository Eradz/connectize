import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Progress from '@/components/ui/Progress';
// import subscriptionsAPI from '@/api-services/subscriptions';
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
import { subscriptionsAPI } from '../../api-services/subscriptions';
import Scroll from '../Scroll';  

  // State management
const SubscriptionManagementSystem = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [features, setFeatures] = useState({});
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState(null);

    const navigate = useNavigate();
  const location = useLocation();

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
      if (!isTestAuthActive()) {
        try {
          await loginForTesting();
        } catch (error) {
          console.warn('❌ Failed to enable test authentication:', error);
        }
      }
      fetchAllData();
    };
    initializeAuth();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        subscriptionResult,
        plansResult,
        featuresResult,
        usageResult,
        analyticsResult,
        billingResult
      ] = await Promise.allSettled([
        subscriptionsAPI.getCurrentSubscription(),
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getAvailableFeatures(),
        subscriptionsAPI.getUsage(),
        subscriptionsAPI.getSubscriptionAnalytics(),
        subscriptionsAPI.getBillingHistory()
      ]);

      const safeExtract = (result, defaultValue = null) => {
        if (result.status === 'fulfilled' && (result.value?.data || result.value)) {
          return result.value.data || result.value;
          
        }
        return defaultValue;
      };

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

      const response = await subscriptionsAPI.upgradeSubscription(currentSubscription.id, {
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

  // Calculate total features count
  const totalFeatures = Object.values(features).reduce((total, categoryFeatures) => 
    total + (Array.isArray(categoryFeatures) ? categoryFeatures.length : 0), 0
  );

  // Calculate categories count
  const categoriesCount = Object.keys(features).length;
  console.log('Current Subscription :', currentSubscription);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAllData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'plans', label: 'Plans', icon: Crown },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  const statsCards =[
    {icon: TrendingUp, title: 'Monthly Cost', value: `$${currentSubscription?.plan?.price || '0.00'}`},
    {icon: Star, title: 'Features ', value: totalFeatures || 0},
    {icon: BarChart3, title: 'Categories', value: categoriesCount || 0},
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-start mb-8 gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Management
            </h1>
            <p className="text-gray-600">
              Manage your plan, monitor usage, and optimize your investment
            </p>
          </div>
          <button 
            className="w-fit md:w-auto px-6 py-1 md:py-2 rounded-lg font-medium border-2 transition-colors hover:bg-orange-50"
            style={{ 
              borderColor: '#F59E0B',
              color: '#F59E0B',
              backgroundColor: 'transparent'
            }}
          >
            {currentSubscription?.plan?.name || 'No Plan'}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
            <Scroll>
          <div className="flex gap-8 border-b-2 border-gray-200 min-w-min">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center gap-2 pb-4 relative transition-colors"
                  style={{
                    color: activeTab === tab.id ? '#000000' : '#6B7280'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: '#F59E0B' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
            </Scroll>
        </div>
{/* Stats Cards - Only show on Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">            
            {statsCards.map((card, index) => (
              <div key={index} className={`${index === 2 ? "col-span-2 md:col-span-1" : ""} bg-white rounded-lg p-6 shadow-sm border border-gray-100`}>
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    {/* {card.icon}  */}
                  <card.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-gray-600">
                  {card.title}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Plan Overview & Usage */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Overview */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSubscription?.plan?.name.replace("Plan", '') || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium border"
                      style={{ 
                        borderColor: '#F59E0B',
                        color: '#F59E0B',
                        backgroundColor: '#FFFBEB'
                      }}
                    >
                      {currentSubscription?.is_active || currentSubscription?.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSubscription?.current_period_end 
                        ? new Date(currentSubscription.current_period_end).toLocaleDateString('en-GB')
                        : '23/09/2026'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Period Usage */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Period Usage</h2>
                <div className="space-y-6">
                  {/* API Calls */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">API Calls</p>
                    <p className="text-xs text-gray-400 mb-2">{`${usage.api_calls_used || 0} / ${usage.api_calls_limit || 0}`}</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(usage.api_calls_used / usage.api_calls_limit) * 100}%`,
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: `${(usage.api_calls_used / usage.api_calls_limit) * 100}%`,
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">{`${Math.round((usage.api_calls_used / usage.api_calls_limit) * 100) || 0}%`}</span>
                    </div>
                  </div>

                  {/* Posts */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Posts</p>
                    <p className="text-xs text-gray-400 mb-2">{`${usage.posts_used || 0} / ${usage.posts_limit || 0}`}</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(usage.posts_used / usage.posts_limit) * 100}%`,
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: `${(usage.posts_used / usage.posts_limit) * 100}%`,
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">{`${Math.round((usage.posts_used / usage.posts_limit) * 100) || 0}%`}</span>
                    </div>
                  </div>

                  {/* Ad Spend */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Ad Spend</p>
                    <p className="text-xs text-gray-400 mb-2">{`${usage.ad_spend_used || 0} / ${usage.ad_spend_limit || 0}`}</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(usage.ad_spend_used / usage.ad_spend_limit) * 100}%`,
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: `${(usage.ad_spend_used / usage.ad_spend_limit) * 100}%`,
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">{`${Math.round((usage.ad_spend_used / usage.ad_spend_limit) * 100) || 0}%`}</span>
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Storage</p>
                    <p className="text-xs text-gray-400 mb-2">{`${usage.storage_used || 0}GB / ${usage.storage_limit || 0}GB`}</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(usage.storage_used / usage.storage_limit) * 100}%`,
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: `${(usage.storage_used / usage.storage_limit) * 100}%`,
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">{`${Math.round((usage.storage_used / usage.storage_limit) * 100) || 0}%`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="grid grid-cols-2 gap-2 h-max">
              {/* Total Usage */}
              <div className="max-h-max bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {Math.round(analytics?.cost_optimization?.current_plan_utilization || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Usage
                  </div>
                </div>
              </div>

              {/* Usage Trend */}
              <div className="max-h-max bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {`Optimal`}
                  </div>
                  <div className="text-sm text-gray-600">
                    Usage Trend
                  </div>
                </div>
              </div>

              {/* Efficiency Score */}
              <div className="max-h-max bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                   {(() => {
                      const usageValues = Object.values(currentSubscription?.usage_percentage);
                      const avgUsage = usageValues.reduce((sum, val) => sum + val, 0) / usageValues.length;
                      // Simple efficiency: higher usage = higher efficiency (up to 80%)
                      const efficiency = Math.min(avgUsage * 1.2, 100);
                      return `${Math.round(efficiency)}/100`;
                   })()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Efficiency Score
                  </div>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="max-h-max bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                   {(() => {
                    // Calculate days remaining from current_period_end
                    if (currentSubscription?.current_period_end) {
                      const endDate = new Date(currentSubscription.current_period_end);
                      const now = new Date();
                      const diffTime = endDate - now;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays > 0 ? diffDays.toString() : '0';
                    }
                    if (currentSubscription?.days_remaining !== undefined) {
                      return currentSubscription.days_remaining.toString();
                    }
                    if (analytics?.billing_period?.days_remaining !== undefined) {
                      return analytics.billing_period.days_remaining.toString();
                    }
                    if (usage?.days_remaining !== undefined) {
                      return usage.days_remaining.toString();
                    }
                    return 'N/A';
                  })()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Days Remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="mt-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">Select The Perfect Plan For Your Business Needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: '#212529' }}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-white">Starter</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">$29.99</span>
                    <span className="text-sm text-gray-300"> / month</span>
                  </div>
                  <div className="w-20 h-0.5 bg-red-500" />
                </div>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                    <span className="text-sm text-white">All sessions access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                    <span className="text-sm text-white">Summit materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                    <span className="text-sm text-white">Tea & lunch breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                    <span className="text-sm text-white">Gala dinner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                    <span className="text-sm text-white">Visa assistance</span>
                  </li>
                </ul>

                <button className="w-full py-3 rounded-lg font-semibold transition-all border-2 bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
                  Choose package
                </button>
              </div>

              {/* Professional Plan */}
              <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: '#FFDB76' }}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Professional</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">$99.99</span>
                    <span className="text-sm text-gray-700"> / month</span>
                  </div>
                  <div className="w-20 h-0.5" style={{ backgroundColor: '#343A40' }} />
                </div>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Economy flight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">5 nights in standard room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">All-access summit entry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Meals + Gala</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Shuttle transport</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Visa assistance</span>
                  </li>
                </ul>

                <button className="w-full py-3 rounded-lg font-semibold transition-all border-2 text-gray-900 border-gray-900" style={{ backgroundColor: '#FFDB76' }}>
                  Choose package
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: '#FFDB76' }}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Enterprise</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">$299.99</span>
                    <span className="text-sm text-gray-700"> / month</span>
                  </div>
                  <div className="w-20 h-0.5" style={{ backgroundColor: '#343A40' }} />
                </div>

                <p className="text-sm text-gray-700 mb-4">Full-Scale Solution For Large Enterprises</p>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Admin functions: 2 features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">al services: 2 features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">analytic: 1 feature</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Transport (airport + daily)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-sm text-gray-900">Visa assistance</span>
                  </li>
                </ul>

                <button className="w-full py-3 rounded-lg font-semibold transition-all border-2 text-gray-900 border-gray-900" style={{ backgroundColor: '#FFDB76' }}>
                  Choose package
                </button>
              </div>
            </div>
          </div>
        )}




       {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="mt-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Categories</h2>
              <p className="text-gray-600">Explore All The Capabilities Included In Your Plan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Usage */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• user management</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• admin dashboard</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* AI Services */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Services</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• ai insights</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• ai matchmaking</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Analytics */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• advance analytics</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Communication */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• basic messaging</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• unlimited messaging</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Deal Management */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Management</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• create deal room</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• deal analytics</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• unlimited deal rooms</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Enterprise Tool */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Tool</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• custom branding</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• priority support</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• white label solution</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* API */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• basic API access</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• enterprise API access</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Marketplace */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• create products</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• create services</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Workforce */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workforce</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• post jobs</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• unlimited job posts</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>

              {/* Logistics */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• advanced logistics</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">• basic logistics</span>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L5 11L15 1" stroke="#343A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="mt-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing & Payments</h2>
              <p className="text-gray-600">Manage Your Subscription Billing And Payment Methods</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    $99.99
                  </div>
                  <div className="text-sm text-gray-600">
                    Current Plan Cost
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1335_7827)">
                        <path d="M19 2H18V1C18 0.734784 17.8946 0.48043 17.7071 0.292893C17.5196 0.105357 17.2652 0 17 0C16.7348 0 16.4804 0.105357 16.2929 0.292893C16.1054 0.48043 16 0.734784 16 1V2H8V1C8 0.734784 7.89464 0.48043 7.70711 0.292893C7.51957 0.105357 7.26522 0 7 0C6.73478 0 6.48043 0.105357 6.29289 0.292893C6.10536 0.48043 6 0.734784 6 1V2H5C3.67441 2.00159 2.40356 2.52888 1.46622 3.46622C0.528882 4.40356 0.00158786 5.67441 0 7L0 19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19V7C23.9984 5.67441 23.4711 4.40356 22.5338 3.46622C21.5964 2.52888 20.3256 2.00159 19 2ZM2 7C2 6.20435 2.31607 5.44129 2.87868 4.87868C3.44129 4.31607 4.20435 4 5 4H19C19.7956 4 20.5587 4.31607 21.1213 4.87868C21.6839 5.44129 22 6.20435 22 7V8H2V7ZM19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V10H22V19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22Z" fill="#374957"/>
                        <path d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z" fill="#374957"/>
                        <path d="M7 16.5C7.82843 16.5 8.5 15.8284 8.5 15C8.5 14.1716 7.82843 13.5 7 13.5C6.17157 13.5 5.5 14.1716 5.5 15C5.5 15.8284 6.17157 16.5 7 16.5Z" fill="#374957"/>
                        <path d="M17 16.5C17.8284 16.5 18.5 15.8284 18.5 15C18.5 14.1716 17.8284 13.5 17 13.5C16.1716 13.5 15.5 14.1716 15.5 15C15.5 15.8284 16.1716 16.5 17 16.5Z" fill="#374957"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1335_7827">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    Sep 23, 2025
                  </div>
                  <div className="text-sm text-gray-600">
                    Next Billing Date
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1335_7833)">
                        <path d="M21.9621 12.875C21.7692 15.1548 20.8028 17.3002 19.223 18.9552C17.6432 20.6102 15.545 21.6754 13.2766 21.9739C11.0082 22.2725 8.70594 21.7866 6.7517 20.5967C4.79746 19.4069 3.30875 17.5846 2.53257 15.4324C1.75638 13.2801 1.73937 10.9271 2.48435 8.76383C3.22933 6.60055 4.69153 4.75699 6.62836 3.53901C8.56519 2.32103 10.8602 1.80184 13.1327 2.06758C15.4052 2.33332 17.5185 3.36801 19.1221 5H16.0001C15.7349 5 15.4805 5.10536 15.293 5.29289C15.1054 5.48043 15.0001 5.73478 15.0001 6C15.0001 6.26522 15.1054 6.51957 15.293 6.70711C15.4805 6.89464 15.7349 7 16.0001 7H20.1431C20.6355 6.99974 21.1077 6.804 21.4559 6.45581C21.8041 6.10761 21.9998 5.63543 22.0001 5.143V1C22.0001 0.734784 21.8947 0.48043 21.7072 0.292893C21.5196 0.105357 21.2653 0 21.0001 0V0C20.7349 0 20.4805 0.105357 20.293 0.292893C20.1054 0.48043 20.0001 0.734784 20.0001 1V3.078C17.9887 1.28073 15.43 0.214484 12.7375 0.0517113C10.0451 -0.111061 7.37652 0.639157 5.16332 2.18103C2.95013 3.72291 1.32176 5.96628 0.541583 8.54832C-0.238597 11.1304 -0.124969 13.9001 0.86409 16.4095C1.85315 18.919 3.6598 21.0214 5.99186 22.3768C8.32392 23.7322 11.045 24.2614 13.715 23.8786C16.3851 23.4958 18.8479 22.2236 20.7053 20.2676C22.5626 18.3116 23.7059 15.7863 23.9501 13.1C23.963 12.9607 23.9468 12.8203 23.9024 12.6877C23.8581 12.555 23.7866 12.4331 23.6925 12.3296C23.5984 12.2261 23.4838 12.1434 23.356 12.0866C23.2282 12.0299 23.0899 12.0004 22.9501 12C22.7061 11.9971 22.4698 12.085 22.2872 12.2468C22.1045 12.4085 21.9886 12.6325 21.9621 12.875Z" fill="#374957"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1335_7833">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    Monthly
                  </div>
                  <div className="text-sm text-gray-600">
                    Billing Cycle
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    Enabled
                  </div>
                  <div className="text-sm text-gray-600">
                    Auto Renewal
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Current Billing Period */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Billing Period</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Period Start</p>
                      <p className="text-lg font-semibold text-gray-900">Aug 24, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Period End</p>
                      <p className="text-lg font-semibold text-gray-900">Sep 23, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Days Remaining</p>
                      <p className="text-lg font-semibold text-gray-900">0 Days</p>
                    </div>
                  </div>
                </div>

                {/* Billing Insights */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Billing Insights</h3>
                    <button 
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: '#F1C644', color: '#000000' }}
                    >
                      Upgrade Plan
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 mb-2">$0.00</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 mb-2">2</p>
                      <p className="text-sm text-gray-600">Successful Payments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Billing History */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Billing History</h3>
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Export CSV
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Payment Entry 1 */}
                  <div className="flex items-start justify-between py-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FFF9E6' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Monthly Subscription Payment</p>
                        <p className="text-xs text-gray-500">23/09/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 mb-1">$99.99</p>
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#009A05' }}
                      >
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Payment Entry 2 */}
                  <div className="flex items-start justify-between py-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FFF9E6' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Monthly Subscription Payment</p>
                        <p className="text-xs text-gray-500">23/09/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 mb-1">$99.99</p>
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                      >
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Payment Entry 3 */}
                  <div className="flex items-start justify-between py-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FFF9E6' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Monthly Subscription Payment</p>
                        <p className="text-xs text-gray-500">23/09/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 mb-1">$99.99</p>
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                      >
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Payment Entry 4 */}
                  <div className="flex items-start justify-between py-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FFF9E6' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Monthly Subscription Payment</p>
                        <p className="text-xs text-gray-500">23/09/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 mb-1">$99.99</p>
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                      >
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Payments Tab */}
{activeTab === 'payments' && (
  <div className="mt-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payments Methods</h2>
      <p className="text-gray-600">Manage Payment Methods And Billing Preferences</p>
    </div>

    {!showPaymentForm ? (
      /* Empty State */
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Current Billing Period</h3>
          <button 
            onClick={() => setShowPaymentForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Add Payment Method
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mb-6 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="16" width="48" height="32" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
              <rect x="8" y="24" width="48" height="8" fill="#E5E7EB"/>
              <rect x="12" y="36" width="16" height="4" rx="2" fill="#D1D5DB"/>
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Payment Method Found
          </h4>
          <p className="text-sm text-gray-600 mb-6">
            Add payment to ensure uninterrupted service
          </p>
          <button 
            onClick={() => setShowPaymentForm(true)}
            className="px-6 py-3 rounded-lg font-medium text-black"
            style={{ backgroundColor: '#F59E0B' }}
          >
            Add Payment Method
          </button>
        </div>
      </div>
    ) : (
      /* Payment Form */
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Current Billing Period</h3>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            + Add Payment Method
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Saved Cards */}
          <div className="space-y-4">
            {/* Card 1 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <svg width="40" height="24" viewBox="0 0 65 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1335_8445)">
                      <path d="M41.288 4.27734H23.7129V35.7218H41.288V4.27734Z" fill="#FF5F00"/>
                      <path d="M24.8291 19.9997C24.8291 13.8886 27.6746 8.0553 32.4728 4.27752C23.769 -2.55581 11.1595 -1.05581 4.29688 7.66641C-2.56579 16.3331 -1.05935 28.8886 7.70031 35.722C15.0093 41.4442 25.2196 41.4442 32.5286 35.722C27.6746 31.9442 24.8291 26.1109 24.8291 19.9997Z" fill="#EB001B"/>
                      <path d="M65.0014 19.9997C65.0014 31.0553 56.0186 39.9997 44.9156 39.9997C40.3962 39.9997 36.0443 38.4997 32.5293 35.722C41.2332 28.8886 42.7396 16.3331 35.8769 7.61085C34.8726 6.38863 33.7568 5.22196 32.5293 4.27752C41.2332 -2.55581 53.8984 -1.05581 60.7053 7.66641C63.495 11.1664 65.0014 15.4997 65.0014 19.9997Z" fill="#F79E1B"/>
                      <path d="M63.1034 32.3891V31.7224H63.3824V31.6113H62.7129V31.7224H62.9919V32.3891H63.1034ZM64.3867 32.3891V31.6113H64.1635L63.9404 32.1669L63.7172 31.6113H63.494V32.3891H63.6614V31.778L63.8846 32.278H64.0519L64.2751 31.778V32.3891H64.3867Z" fill="#F79E1B"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_1335_8445">
                        <rect width="65" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Masters card</p>
                  <p className="text-xs text-gray-500">2234************234</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5H4.16667H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66699 5.00033V3.33366C6.66699 2.89163 6.84259 2.46771 7.15515 2.15515C7.46771 1.84259 7.89163 1.66699 8.33366 1.66699H11.667C12.109 1.66699 12.5329 1.84259 12.8455 2.15515C13.1581 2.46771 13.3337 2.89163 13.3337 3.33366V5.00033M15.8337 5.00033V16.667C15.8337 17.109 15.6581 17.5329 15.3455 17.8455C15.0329 18.1581 14.609 18.3337 14.167 18.3337H5.83366C5.39163 18.3337 4.96771 18.1581 4.65515 17.8455C4.34259 17.5329 4.16699 17.109 4.16699 16.667V5.00033H15.8337Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Card 2 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <svg width="40" height="24" viewBox="0 0 65 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_card2)">
                      <path d="M41.288 4.27734H23.7129V35.7218H41.288V4.27734Z" fill="#FF5F00"/>
                      <path d="M24.8291 19.9997C24.8291 13.8886 27.6746 8.0553 32.4728 4.27752C23.769 -2.55581 11.1595 -1.05581 4.29688 7.66641C-2.56579 16.3331 -1.05935 28.8886 7.70031 35.722C15.0093 41.4442 25.2196 41.4442 32.5286 35.722C27.6746 31.9442 24.8291 26.1109 24.8291 19.9997Z" fill="#EB001B"/>
                      <path d="M65.0014 19.9997C65.0014 31.0553 56.0186 39.9997 44.9156 39.9997C40.3962 39.9997 36.0443 38.4997 32.5293 35.722C41.2332 28.8886 42.7396 16.3331 35.8769 7.61085C34.8726 6.38863 33.7568 5.22196 32.5293 4.27752C41.2332 -2.55581 53.8984 -1.05581 60.7053 7.66641C63.495 11.1664 65.0014 15.4997 65.0014 19.9997Z" fill="#F79E1B"/>
                      <path d="M63.1034 32.3891V31.7224H63.3824V31.6113H62.7129V31.7224H62.9919V32.3891H63.1034ZM64.3867 32.3891V31.6113H64.1635L63.9404 32.1669L63.7172 31.6113H63.494V32.3891H63.6614V31.778L63.8846 32.278H64.0519L64.2751 31.778V32.3891H64.3867Z" fill="#F79E1B"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_card2">
                        <rect width="65" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Masters card</p>
                  <p className="text-xs text-gray-500">2234************234</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5H4.16667H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66699 5.00033V3.33366C6.66699 2.89163 6.84259 2.46771 7.15515 2.15515C7.46771 1.84259 7.89163 1.66699 8.33366 1.66699H11.667C12.109 1.66699 12.5329 1.84259 12.8455 2.15515C13.1581 2.46771 13.3337 2.89163 13.3337 3.33366V5.00033M15.8337 5.00033V16.667C15.8337 17.109 15.6581 17.5329 15.3455 17.8455C15.0329 18.1581 14.609 18.3337 14.167 18.3337H5.83366C5.39163 18.3337 4.96771 18.1581 4.65515 17.8455C4.34259 17.5329 4.16699 17.109 4.16699 16.667V5.00033H15.8337Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Card 3 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <svg width="40" height="24" viewBox="0 0 65 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_card3)">
                      <path d="M41.288 4.27734H23.7129V35.7218H41.288V4.27734Z" fill="#FF5F00"/>
                      <path d="M24.8291 19.9997C24.8291 13.8886 27.6746 8.0553 32.4728 4.27752C23.769 -2.55581 11.1595 -1.05581 4.29688 7.66641C-2.56579 16.3331 -1.05935 28.8886 7.70031 35.722C15.0093 41.4442 25.2196 41.4442 32.5286 35.722C27.6746 31.9442 24.8291 26.1109 24.8291 19.9997Z" fill="#EB001B"/>
                      <path d="M65.0014 19.9997C65.0014 31.0553 56.0186 39.9997 44.9156 39.9997C40.3962 39.9997 36.0443 38.4997 32.5293 35.722C41.2332 28.8886 42.7396 16.3331 35.8769 7.61085C34.8726 6.38863 33.7568 5.22196 32.5293 4.27752C41.2332 -2.55581 53.8984 -1.05581 60.7053 7.66641C63.495 11.1664 65.0014 15.4997 65.0014 19.9997Z" fill="#F79E1B"/>
                      <path d="M63.1034 32.3891V31.7224H63.3824V31.6113H62.7129V31.7224H62.9919V32.3891H63.1034ZM64.3867 32.3891V31.6113H64.1635L63.9404 32.1669L63.7172 31.6113H63.494V32.3891H63.6614V31.778L63.8846 32.278H64.0519L64.2751 31.778V32.3891H64.3867Z" fill="#F79E1B"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_card3">
                        <rect width="65" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Masters card</p>
                  <p className="text-xs text-gray-500">2234************234</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5H4.16667H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66699 5.00033V3.33366C6.66699 2.89163 6.84259 2.46771 7.15515 2.15515C7.46771 1.84259 7.89163 1.66699 8.33366 1.66699H11.667C12.109 1.66699 12.5329 1.84259 12.8455 2.15515C13.1581 2.46771 13.3337 2.89163 13.3337 3.33366V5.00033M15.8337 5.00033V16.667C15.8337 17.109 15.6581 17.5329 15.3455 17.8455C15.0329 18.1581 14.609 18.3337 14.167 18.3337H5.83366C5.39163 18.3337 4.96771 18.1581 4.65515 17.8455C4.34259 17.5329 4.16699 17.109 4.16699 16.667V5.00033H15.8337Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Card Details Form */}
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">Card Details</h4>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  + Add card
                </button>
              </div>
              <p className="text-sm text-gray-600">Set default payment methods</p>
            </div>

            <div className="space-y-4">
              {/* Name on Card and Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on your Card
                  </label>
                  <input
                    type="text"
                    value="Barry White"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value="02 / 2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Card Number and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="9226 9885 8877 2233"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="32" height="20" viewBox="0 0 65 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_input)">
                          <path d="M41.288 4.27734H23.7129V35.7218H41.288V4.27734Z" fill="#FF5F00"/>
                          <path d="M24.8291 19.9997C24.8291 13.8886 27.6746 8.0553 32.4728 4.27752C23.769 -2.55581 11.1595 -1.05581 4.29688 7.66641C-2.56579 16.3331 -1.05935 28.8886 7.70031 35.722C15.0093 41.4442 25.2196 41.4442 32.5286 35.722C27.6746 31.9442 24.8291 26.1109 24.8291 19.9997Z" fill="#EB001B"/>
                          <path d="M65.0014 19.9997C65.0014 31.0553 56.0186 39.9997 44.9156 39.9997C40.3962 39.9997 36.0443 38.4997 32.5293 35.722C41.2332 28.8886 42.7396 16.3331 35.8769 7.61085C34.8726 6.38863 33.7568 5.22196 32.5293 4.27752C41.2332 -2.55581 53.8984 -1.05581 60.7053 7.66641C63.495 11.1664 65.0014 15.4997 65.0014 19.9997Z" fill="#F79E1B"/>
                          <path d="M63.1034 32.3891V31.7224H63.3824V31.6113H62.7129V31.7224H62.9919V32.3891H63.1034ZM64.3867 32.3891V31.6113H64.1635L63.9404 32.1669L63.7172 31.6113H63.494V32.3891H63.6614V31.778L63.8846 32.278H64.0519L64.2751 31.778V32.3891H64.3867Z" fill="#F79E1B"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_input">
                            <rect width="65" height="40" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value="***"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="#6B7280"/>
          </svg>
          <p className="text-xs text-gray-600">
            <strong>Secure Processing:</strong> All Payment Information Is Encrypted And Processed Securely. We Will Never Store Your Complete Card Details On Our Servers.
          </p>
        </div>
      </div>
    )}
  </div>
)}

        

      </div>
    </div>
  );
};

export default SubscriptionManagementSystem;