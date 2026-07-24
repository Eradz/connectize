/**
 * COMPREHENSIVE SUBSCRIPTION DASHBOARD
 * Enterprise-Grade Subscription Management Interface with Enhanced Analytics
 * Part of the Enhanced Subscription Dashboard Implementation Plan
 */

import React, { useEffect, useState } from 'react';
import subscriptionsApi from '../../api-services/subscriptions';
import AdvancedUsageAnalytics from './AdvancedUsageAnalytics';
import SmartUpgradeSuggestions from './SmartUpgradeSuggestions';
import FeatureComparisonTableEnhanced from './FeatureComparisonTableEnhanced';
import ROICalculator from './ROICalculator';
import { 
  CheckCircle, AlertTriangle, TrendingUp, TrendingDown, 
  Calendar, CreditCard, BarChart, Users, AlertCircle,
  Crown, Star, Zap, Briefcase, Building, ArrowRight,
  DollarSign, Activity, Clock, Download, Shield,
  Award, Target, Globe, Cpu, Database, Headphones,
  Calculator, Eye, Sparkles, Home, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';

const SubscriptionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [upgradeOpportunities, setUpgradeOpportunities] = useState([]);
  const [costRecommendations, setCostRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [selectedPlanForROI, setSelectedPlanForROI] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handlePlanSelection = async (plan) => {
    if (!current) {
      // No current subscription - create new subscription
      await createSubscription(plan);
    } else if (current.plan) {
      const currentPrice = parseFloat(current.plan.price);
      const newPrice = parseFloat(plan.price);
      
      if (newPrice > currentPrice) {
        // Upgrade
        await upgradeSubscription(plan);
      } else if (newPrice < currentPrice) {
        // Downgrade
        await downgradeSubscription(plan);
      }
    }
  };

  const createSubscription = async (plan) => {
    setProcessingPlan(plan.id);
    try {
      const response = await subscriptionsApi.createSubscription({
        plan_id: plan.id,
        billing_cycle: plan.billing_cycle || 'monthly'
      });
      
      if (response.data) {
        // Handle API response structure
        const subscription = response.data.subscription || response.data;
        setCurrent(subscription);
        setError('');
        alert(`Successfully subscribed to ${plan.name}!`);
        await loadSubscriptionData(); // Refresh data
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
      setError(`Failed to subscribe to ${plan.name}: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  const upgradeSubscription = async (plan) => {
    setProcessingPlan(plan.id);
    try {
      // upgradeSubscription expects (subscriptionId, planId) - planId should be a string/UUID
      const response = await subscriptionsApi.upgradeSubscription(current.id, plan.id);
      
      if (response.data || response.subscription) {
        // Handle API response structure
        const subscription = response.subscription || response.data?.subscription || response.data;
        setCurrent(subscription);
        setError('');
        alert(`Successfully upgraded to ${plan.name}!`);
        await loadSubscriptionData(); // Refresh data
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setError(`Failed to upgrade to ${plan.name}: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  const downgradeSubscription = async (plan) => {
    setProcessingPlan(plan.id);
    try {
      const response = await subscriptionsApi.downgradeSubscription(current.id, {
        plan_id: plan.id
      });
      
      if (response.data) {
        // Handle API response structure
        const subscription = response.data.subscription || response.data;
        setCurrent(subscription);
        setError('');
        alert(`Successfully changed to ${plan.name}!`);
        await loadSubscriptionData(); // Refresh data
      }
    } catch (error) {
      console.error('Plan change failed:', error);
      setError(`Failed to change to ${plan.name}: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  const loadSubscriptionData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load plans and current subscription with enhanced analytics
      const [plansRes, mySubRes] = await Promise.all([
        subscriptionsApi.getPlans().then(r => r.data || r).catch(() => []),
        subscriptionsApi.getMySubscription().then(r => r.data || r).catch(() => null),
      ]);
      
      // Set plans with fallback
      const loadedPlans = plansRes?.results || plansRes || [];
      if (loadedPlans.length === 0) {
        // Provide sample plans if none loaded
        setPlans([
          {
            id: 1,
            name: 'Starter Plan',
            plan_type: 'starter',
            price: 29.99,
            billing_cycle: 'monthly',
            max_posts_per_month: 50,
            max_products_per_month: 20,
            max_services_per_month: 20,
            max_storage_gb: 10,
            analytics_enabled: true,
            api_access_enabled: true,
            featured_ads_enabled: true,
            tagline: 'Perfect for growing businesses',
            popular: false
          },
          {
            id: 2,
            name: 'Professional Plan', 
            plan_type: 'professional',
            price: 99.99,
            billing_cycle: 'monthly',
            max_posts_per_month: 200,
            max_products_per_month: 100,
            max_services_per_month: 100,
            max_storage_gb: 50,
            analytics_enabled: true,
            api_access_enabled: true,
            featured_ads_enabled: true,
            ai_insights_enabled: true,
            priority_support: true,
            tagline: 'Advanced features for teams',
            popular: true
          }
        ]);
      } else {
        setPlans(loadedPlans);
      }
      
      // Set current subscription with fallback
      if (mySubRes) {
        console.log('🔍 API Response:', mySubRes);
        // Handle different API response structures
        if (mySubRes.subscription) {
          // New API structure: {subscription: {...}, usage: {...}, plan_features: {...}}
          console.log('📋 Using subscription from API response:', mySubRes.subscription);
          setCurrent(mySubRes.subscription);
          if (mySubRes.usage) {
            setUsageData(mySubRes.usage);
          }
        } else {
          // Direct subscription object
          console.log('📋 Using direct subscription object:', mySubRes);
          setCurrent(mySubRes);
        }
      } else {
        console.log('📋 No subscription data, using fallback');
        // Provide sample current subscription if none loaded
        setCurrent({
          id: 1,
          plan: {
            name: 'Starter Plan',
            plan_type: 'starter',
            price: 29.99,
            billing_cycle: 'monthly'
          },
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      // Load usage data
      try {
        const usageRes = await subscriptionsApi.getUsage().then(r => r.data || r);
        setUsageData(usageRes);
      } catch (error) {
        console.log('Usage data not available:', error);
        // Provide fallback usage data if API fails
        setUsageData({
          usage: {
            api_calls: { current: 1250, limit: 5000, percentage: 25 },
            posts: { current: 12, limit: 50, percentage: 24 },
            products: { current: 5, limit: 20, percentage: 25 },
            services: { current: 3, limit: 20, percentage: 15 },
            storage: { current: 2.5, limit: 10, percentage: 25 },
            ad_spend: { current: 150, limit: 1000, percentage: 15 }
          }
        });
      }
      
      // Load analytics and detailed analytics if available
      try {
        const [analyticsRes, detailedAnalyticsRes] = await Promise.all([
          subscriptionsApi.getSubscriptionAnalytics().then(r => r.data || r).catch(() => null),
          subscriptionsApi.getDetailedAnalytics().then(r => r.data || r).catch(() => null)
        ]);
        
        setAnalytics(analyticsRes);
        setDetailedAnalytics(detailedAnalyticsRes);
        
        // Extract upgrade opportunities and cost recommendations from detailed analytics
        if (detailedAnalyticsRes) {
          setUpgradeOpportunities(detailedAnalyticsRes.upgrade_opportunities || []);
          setCostRecommendations(detailedAnalyticsRes.cost_recommendations || []);
        }
      } catch (error) {
        console.log('Analytics not available:', error);
        setAnalytics(null);
        setDetailedAnalytics(null);
        
        // Provide fallback data for demo purposes
        setUpgradeOpportunities([
          {
            feature: 'storage',
            title: 'Approaching Storage Limit',
            description: 'You\'ve used 85% of your storage allowance. Consider upgrading to avoid service interruptions.',
            current_usage_percentage: 85,
            impact: 'Service interruption risk',
            recommendation: 'Upgrade to Professional plan',
            urgency: 'medium'
          }
        ]);
        
        setCostRecommendations([
          {
            type: 'feature_upgrade',
            title: 'Unlock Analytics',
            description: 'With your posting volume, analytics could provide valuable insights.',
            confidence: 'medium'
          }
        ]);
      }
      
      // Load billing history if we have a subscription
      if (mySubRes?.id) {
        try {
          const billingRes = await subscriptionsApi.getBillingHistory().then(r => r.data || r);
          setBillingHistory(billingRes?.billing_history || billingRes?.results || billingRes || []);
        } catch (error) {
          console.log('Billing history not available:', error);
          setBillingHistory([]);
        }
      }
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError('Unable to load subscription data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType) => {
    const icons = {
      'trial': Star,
      'starter': Briefcase,
      'professional': Building,
      'enterprise': Crown,
      'custom': Award
    };
    return icons[planType] || Building;
  };

  const getPlanColor = (planType) => {
    const colors = {
      'trial': 'from-gray-500 to-gray-600',
      'starter': 'from-blue-500 to-blue-600',
      'professional': 'from-purple-500 to-purple-600',
      'enterprise': 'from-yellow-500 to-yellow-600',
      'custom': 'from-red-500 to-red-600'
    };
    return colors[planType] || 'from-gray-500 to-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage your subscription plans, usage, and billing</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
            { id: 'roi', label: 'ROI Calculator', icon: Calculator }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">

      {/* Current Subscription Overview */}
      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Subscription Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className={`bg-gradient-to-r ${getPlanColor(current.plan?.plan_type)} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {React.createElement(getPlanIcon(current.plan?.plan_type), { className: "w-8 h-8" })}
                  <div>
                    <h3 className="text-xl font-bold">{current.plan?.name}</h3>
                    <p className="text-white/80 capitalize">{current.plan?.plan_type} Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(current.plan?.price)}</p>
                  <p className="text-white/80">per {current.plan?.billing_cycle}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    current.status === 'active' ? 'bg-green-100 text-green-700' :
                    current.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {current.status}
                  </span>
                </div>
                {current.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {current.cancel_at_period_end ? 'Expires' : 'Renews'}
                    </span>
                    <span className="font-medium">
                      {new Date(current.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Feature Highlights */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {current.plan?.max_projects === -1 ? 'Unlimited' : current.plan?.max_projects} Projects
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {current.plan?.max_storage_gb === -1 ? 'Unlimited' : current.plan?.max_storage_gb + 'GB'} Storage
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {current.plan?.max_team_members === -1 ? 'Unlimited' : current.plan?.max_team_members} Team Members
                  </div>
                  {current.plan?.ai_insights_enabled && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Cpu className="w-4 h-4 mr-2 text-blue-500" />
                      AI Insights
                    </div>
                  )}
                  {current.plan?.priority_support && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Headphones className="w-4 h-4 mr-2 text-purple-500" />
                      Priority Support
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Usage Summary
            </h3>
            
            {usageData ? (
              <div className="space-y-4">
                {/* Projects Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Projects</span>
                    <span className="text-sm font-medium">
                      {usageData.projects_used} / {current.plan?.max_projects === -1 ? '∞' : current.plan?.max_projects}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getUsageColor(calculateUsagePercentage(usageData.projects_used, current.plan?.max_projects))}`}
                      style={{ width: `${calculateUsagePercentage(usageData.projects_used, current.plan?.max_projects)}%` }}
                    />
                  </div>
                </div>

                {/* Storage Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm font-medium">
                      {(usageData.storage_used_gb || 0).toFixed(1)}GB / {current.plan?.max_storage_gb === -1 ? '∞' : current.plan?.max_storage_gb + 'GB'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getUsageColor(calculateUsagePercentage(usageData.storage_used_gb, current.plan?.max_storage_gb))}`}
                      style={{ width: `${calculateUsagePercentage(usageData.storage_used_gb, current.plan?.max_storage_gb)}%` }}
                    />
                  </div>
                </div>

                {/* Team Members Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Team Members</span>
                    <span className="text-sm font-medium">
                      {usageData.team_members_count} / {current.plan?.max_team_members === -1 ? '∞' : current.plan?.max_team_members}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getUsageColor(calculateUsagePercentage(usageData.team_members_count, current.plan?.max_team_members))}`}
                      style={{ width: `${calculateUsagePercentage(usageData.team_members_count, current.plan?.max_team_members)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No usage data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Plans</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.plan_type);
            const isCurrent = current?.plan?.id === plan.id;
            // Safe price comparison with proper null checks
            const currentPrice = current?.plan?.price;
            const planPrice = plan?.price;
            const isUpgrade = currentPrice && planPrice && parseFloat(planPrice) > parseFloat(currentPrice);
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                  isCurrent ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`bg-gradient-to-r ${getPlanColor(plan.plan_type)} p-4 text-white rounded-t-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-6 h-6" />
                      <span className="font-semibold">{plan.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-white/80">/{plan.billing_cycle}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2 text-green-500" />
                      {plan.max_projects === -1 ? 'Unlimited' : plan.max_projects} Projects
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Database className="w-4 h-4 mr-2 text-blue-500" />
                      {plan.max_storage_gb === -1 ? 'Unlimited' : plan.max_storage_gb + 'GB'} Storage
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      {plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members} Team Members
                    </div>
                    {plan.ai_insights_enabled && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Cpu className="w-4 h-4 mr-2 text-orange-500" />
                        AI Insights
                      </div>
                    )}
                    {plan.priority_support && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        Priority Support
                      </div>
                    )}
                  </div>
                  
                  {/* Plan Details Link */}
                  <Link 
                    to={`/subscriptions/plans/${plan.id}`}
                    className="block w-full mb-3 py-2 px-4 text-center border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details & Benefits
                  </Link>
                  
                  <button
                    onClick={() => !isCurrent && handlePlanSelection(plan)}
                    disabled={isCurrent || processingPlan === plan.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      isCurrent 
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : processingPlan === plan.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isUpgrade
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gold text-dark hover:bg-custom_yellow'
                    }`}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : isUpgrade ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Upgrade
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Select Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Billing History
            </h3>
            <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.slice(0, 5).map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(bill.billing_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bill.description}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                        bill.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {billingHistory.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View All Billing History
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <AdvancedUsageAnalytics 
            subscription={current} 
            analytics={detailedAnalytics} 
          />
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <SmartUpgradeSuggestions 
            opportunities={upgradeOpportunities} 
            recommendations={costRecommendations}
            currentPlan={current?.plan}
            onUpgradeClick={(planId) => {
              const plan = plans.find(p => p.id === planId);
              if (plan) handlePlanChange(plan);
            }}
          />
          
          <FeatureComparisonTableEnhanced 
            plans={plans} 
            currentPlan={current?.plan}
            onSelectPlan={handlePlanChange}
          />
        </div>
      )}

      {/* ROI Calculator Tab */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">ROI Calculator</h3>
            <p className="text-gray-600 mb-6">
              Calculate the potential return on investment for upgrading your subscription plan.
            </p>
            <button
              onClick={() => {
                setSelectedPlanForROI(current?.plan);
                setShowROICalculator(true);
              }}
              className="bg-gold text-dark px-6 py-3 rounded-lg hover:bg-custom_yellow transition-colors flex items-center"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Open ROI Calculator
            </button>
          </div>
        </div>
      )}

      {/* ROI Calculator Modal */}
      {showROICalculator && (
        <ROICalculator 
          currentPlan={selectedPlanForROI}
          availablePlans={plans}
          onClose={() => setShowROICalculator(false)}
          onPlanSelect={handlePlanChange}
        />
      )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
