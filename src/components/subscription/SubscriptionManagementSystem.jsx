import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Progress from '@/components/ui/Progress';
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
  Download,
  Check
} from 'lucide-react';
import { subscriptionsAPI } from '../../api-services/subscriptions';
import Scroll from '../Scroll';  
import { webRoutes } from '../../lib/webRoutes';
import { useSubscription } from '../../context/SubscriptionContext';

  // State management
const SubscriptionManagementSystem = () => {
  // Get subscription data from context
  const {
    currentSubscription,
    availablePlans,
    features,
    usage,
    analytics,
    billingHistory,
    enhancedFeatures,
    paymentMethods,
    loading,
    error,
    isCurrentUserPlan,
    getCurrencySymbol,
    exportBillingHistoryToCSV
  } = useSubscription();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

    // Get plan color based on type
  // const getPlanColor = (planType) => {
  //   const colorMap = {
  //     'trial': 'bg-gray-100 text-gray-800 border-gray-300',
  //     'starter': 'bg-blue-100 text-blue-800 border-blue-300',
  //     'professional': 'bg-purple-100 text-purple-800 border-purple-300',
  //     'enterprise': 'bg-orange-100 text-orange-800 border-orange-300',
  //     'custom': 'bg-red-100 text-red-800 border-red-300'
  //   };
  //   return colorMap[planType?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  // };

  // Format usage percentage color
  // const getUsageColor = (percentage) => {
  //   if (percentage >= 90) return 'text-red-600';
  //   if (percentage >= 75) return 'text-yellow-600';
  //   return 'text-green-600';
  // };

  // Get category icon
  // const getCategoryIcon = (category) => {
  //   const iconMap = {
  //     'Social Media': TrendingUp,
  //     'Analytics': BarChart3,
  //     'AI Services': Sparkles,
  //     'Enterprise Tools': Shield,
  //     'Team Management': Users,
  //     'Admin & Support': Settings
  //   };
  //   return iconMap[category] || CheckCircle;
  // };

  // Handle plan upgrade
  // const handlePlanUpgrade = async (planId) => {
  //   try {
  //     if (!currentSubscription?.id) {
  //       console.error('No current subscription found');
  //       return;
  //     }

  //     const response = await subscriptionsAPI.upgradeSubscription(currentSubscription.id, {
  //       target_plan_id: planId
  //     });

  //     if (response.data) {
  //       // Refresh data after upgrade
  //       await fetchAllData();
  //       alert('Plan upgraded successfully!');
  //     }
  //   } catch (error) {
  //     console.error('Error upgrading plan:', error);
  //     alert('Failed to upgrade plan. Please try again.');
  //   }
  // };

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
          <button onClick={fetchAllData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow">
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
    {icon: TrendingUp, title: 'Monthly Cost', value: currentSubscription?.plan?.price ? `$${currentSubscription.plan.price}` : '--'},
    {icon: Star, title: 'Features ', value: currentSubscription ? (totalFeatures || 0) : 0},
    {icon: BarChart3, title: 'Categories', value: currentSubscription ? (categoriesCount || 0) : 0},
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
            {currentSubscription?.plan?.name || '--'}
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
                      {currentSubscription?.plan?.name ? currentSubscription.plan.name.replace("Plan", '') : '--'}
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
                      {currentSubscription && (currentSubscription.is_active || currentSubscription.status === 'active') ? 'Active' : '--'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSubscription?.current_period_end 
                        ? new Date(currentSubscription.current_period_end).toLocaleDateString('en-GB')
                        : '--'}
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
                      if (!currentSubscription?.usage_percentage) return '0/100';
                      const usageValues = Object.values(currentSubscription.usage_percentage);
                      if (usageValues.length === 0) return '0/100';
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
                    return '--';
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
              {availablePlans.map((plan, index) => {
                const isCurrentPlan = isCurrentUserPlan(plan);
                
                return (
                  <div
                    key={plan.id || index}
                    className={`rounded-2xl p-6 shadow-md flex flex-col justify-between relative ${isCurrentPlan ? 'border-2 border-green-500' : ''}`}
                    style={{
                        backgroundColor: isCurrentPlan ? 'black' : '#FFDB76',
                        color: isCurrentPlan ? '#FFFFFF' : '#343A40',
                        borderColor: isCurrentPlan ? '#FFFFFF' : '#343A40'
                      }}
                  >
                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute top-0 right-4">
                        <Badge 
                          className="bg-green-500 text-white text-xs font-semibold"
                        >
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className={`text-lg font-bold mb-3 ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                      <div className="mb-2">
                        <span className={`text-3xl font-bold ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{getCurrencySymbol(plan.currency || 'USD')}{plan.price}</span>
                        <span className={`text-sm ${isCurrentPlan ? 'text-gray-300' : 'text-gray-700'}`}> / {plan.billing_cycle || 'month'}</span>
                      </div>
                      <div 
                        className="w-20 h-0.5"
                        style={{ 
                          backgroundColor: isCurrentPlan ? '#EF4444' : '#343A40'
                        }}
                      />
                      <ul className="space-y-2.5 mt-6">
                        {plan.feature_highlights && plan.feature_highlights.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`} strokeWidth={2.5} />
                            <span className={`text-sm ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                      <Link
                        to={webRoutes.subscriptionPlanDetail.replace(":planId", `${plan.id}`)}
                        className="w-full py-3 rounded-lg font-semibold transition-all border-2 text-center hover:opacity-80"
                        style={{
                          backgroundColor: isCurrentPlan ? 'transparent' : '#FFDB76',
                          color: isCurrentPlan ? '#FFFFFF' : '#343A40',
                          borderColor: isCurrentPlan ? '#FFFFFF' : '#343A40'
                        }}
                      >
                        {isCurrentPlan ? 'Manage Plan' : 'Choose package'}
                      </Link>
                  </div>
                );
              })}
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
              {Object.entries(enhancedFeatures?.features || {}).length > 0 ? (
                Object.entries(enhancedFeatures?.features || {}).map(([categoryName, features], index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <h3 className="capitalize font-semibold text-gray-900 text-base">
                          {categoryName}
                        </h3>
                      </div>
                      
                      <ul className="space-y-2.5">
                        {features.map((feature, featureIndex) => (
                          <li key={feature.id || featureIndex} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              • {feature.feature_name}
                            </span>
                            <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.5 11H12.5V8C12.5 7.72 12.28 7.5 12 7.5C11.72 7.5 11.5 7.72 11.5 8V11H8.5C8.22 11 8 11.22 8 11.5C8 11.78 8.22 12 8.5 12H11.5V15C11.5 15.28 11.72 15.5 12 15.5C12.28 15.5 12.5 15.28 12.5 15V12H15.5C15.78 12 16 11.78 16 11.5C16 11.22 15.78 11 15.5 11Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Features Available</h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Your current plan doesn't include any enhanced features. Upgrade your plan to unlock more capabilities.
                  </p>
                </div>
              )}
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
              {/* Current Plan Cost */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <DollarSign className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(() => {
                      if (!currentSubscription?.plan?.price) return '--';
                      const currency = currentSubscription.plan.currency || 'USD';
                      const symbol = getCurrencySymbol(currency);
                      const price = currentSubscription.plan.price;
                      return `${symbol}${price}`;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Current Plan Cost
                  </div>
                </div>
              </div>

              {/* Next Billing Date */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <Calendar className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {currentSubscription?.current_period_end
                      ? new Date(currentSubscription.current_period_end).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        })
                      : '--'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Next Billing Date
                  </div>
                </div>
              </div>

              {/* Billing Cycle */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                    {currentSubscription?.billing_info.billing_cycle || '--'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Billing Cycle
                  </div>
                </div>
              </div>

              {/* Auto Renewal Status */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF1C6' }}
                  >
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {!currentSubscription ? '--' : (currentSubscription?.auto_renew !== false ? 'Enabled' : 'Disabled')}
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
                      <p className="text-lg font-semibold text-gray-900">
                        {currentSubscription?.current_period_start 
                          ? new Date(currentSubscription.current_period_start).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Period End</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentSubscription?.current_period_end 
                          ? new Date(currentSubscription.current_period_end).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Days Remaining</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(() => {
                          if (currentSubscription?.current_period_end) {
                            const endDate = new Date(currentSubscription.current_period_end);
                            const now = new Date();
                            const diffTime = endDate - now;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays} Day${diffDays !== 1 ? 's' : ''}` : '0 Days';
                          }
                          return '--';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Billing Insights */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Billing Insights</h3>
                    <Link 
                      to={webRoutes.subscriptionManagement + '?tab=plans'}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: '#F1C644', color: '#000000' }}
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {(() => {
                          // Calculate total spent from billing history
                          const total = billingHistory?.reduce((sum, transaction) => {
                            if (transaction?.display_info?.is_processed && transaction?.amount) {
                              return sum + parseFloat(transaction.amount);
                            }
                            return sum;
                          }, 0) || 0;
                          const currency = billingHistory?.[0]?.currency || 'USD';
                          const symbol = getCurrencySymbol(currency);
                          return `${symbol}${total.toFixed(2)}`;
                        })()}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {(() => {
                          // Count successful payments
                          const successCount = billingHistory?.filter(t => t?.display_info?.is_processed).length || 0;
                          return successCount;
                        })()}
                      </p>
                      <p className="text-sm text-gray-600">Successful Payments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Billing History */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Billing History</h3>
                  <button 
                    onClick={() => exportBillingHistoryToCSV(billingHistory, currentSubscription)}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                <div className="space-y-4">
                  {billingHistory && billingHistory.length > 0 ? (
                    billingHistory.map((transaction, index) => {
                      // Determine status colors
                      const statusColors = {
                        'completed': { bg: '#D1FAE5', text: '#059669' },
                        'pending': { bg: '#FEF3C7', text: '#D97706' },
                        'failed': { bg: '#FEE2E2', text: '#DC2626' }
                      };
                      
                      const status = transaction?.display_info?.is_failed ? 'failed' : 
                                   transaction?.display_info?.is_pending ? 'pending' : 'completed';
                      const colors = statusColors[status] || statusColors.completed;
                      
                      // Format transaction type label
                      const typeLabel = transaction?.transaction_type === 'subscription' ? 'Subscription' : 'Payment';
                      
                      // Get formatted date
                      const transactionDate = transaction?.display_info?.transaction_date || transaction?.processed_at;
                      const formattedDate = transactionDate ? 
                        new Date(transactionDate).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        }) : 'N/A';
                      
                      // Get amount display
                      const amountDisplay = transaction?.display_info?.formatted_amount || 
                                          `${transaction?.currency || 'USD'} ${transaction?.amount || '0.00'}`;
                      
                      // Get description
                      const description = transaction?.plan_info?.name || transaction?.description || `${typeLabel} Payment`;
                      
                      return (
                        <div key={transaction?.id || index} className={`flex items-start justify-between py-4 ${index !== billingHistory.length - 1 ? 'border-b border-gray-100' : ''}`}>
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
                              <p className="text-xs text-gray-500 mb-1">{typeLabel}</p>
                              <p className="text-sm font-semibold text-gray-900 mb-1">{description}</p>
                              <p className="text-xs text-gray-500">{formattedDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 mb-1">{amountDisplay}</p>
                            <span 
                              className="inline-block px-2 py-1 rounded text-xs font-medium capitalize"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500 text-sm">No billing history available</p>
                    </div>
                  )}
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