import React, { useState, useEffect } from 'react';
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

// Mock API - replace with your actual API
const subscriptionsApi = {
  getPlans: async () => ({ data: { results: [] } }),
  getCurrentSubscription: async () => ({ 
    data: { 
      subscription: {
        plan: { name: 'Professional', price: 99.99 },
        status: 'active',
        is_active: true
      }
    } 
  }),
  getUsage: async () => ({ data: null }),
  getAvailableFeatures: async () => ({ 
    data: { 
      features_by_category: {
        'Social Media': [{}, {}, {}, {}, {}],
        'Analytics': [{}, {}, {}],
        'AI Services': [{}, {}, {}, {}],
        'Enterprise Tools': [{}, {}, {}],
        'Team Management': [{}, {}, {}, {}, {}],
        'Admin & Support': [{}, {}, {}, {}]
      }
    }
  }),
  getSubscriptionAnalytics: async () => ({ data: null }),
  getBillingHistory: async () => ({ data: { results: [] } })
};

const loginForTesting = async () => {};
const isTestAuthActive = () => true;

const SubscriptionManagementSystem = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [features, setFeatures] = useState({});
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);

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
        subscriptionsApi.getCurrentSubscription(),
        subscriptionsApi.getPlans(),
        subscriptionsApi.getAvailableFeatures(),
        subscriptionsApi.getUsage(),
        subscriptionsApi.getSubscriptionAnalytics(),
        subscriptionsApi.getBillingHistory()
      ]);

      const safeExtract = (result, defaultValue = null) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          return result.value.data;
        }
        return defaultValue;
      };

      const subscriptionData = safeExtract(subscriptionResult, {});
      const plansData = safeExtract(plansResult, { results: [] });
      const featuresData = safeExtract(featuresResult, { features_by_category: {} });
      const usageData = safeExtract(usageResult, {});
      const analyticsData = safeExtract(analyticsResult, {});
      const billingData = safeExtract(billingResult, { results: [] });

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

  // Calculate total features count
  const totalFeatures = Object.values(features).reduce((total, categoryFeatures) => 
    total + (Array.isArray(categoryFeatures) ? categoryFeatures.length : 0), 0
  );

  // Calculate categories count
  const categoriesCount = Object.keys(features).length;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Management
            </h1>
            <p className="text-gray-600">
              Manage your plan, monitor usage, and optimize your investment
            </p>
          </div>
          <button 
            className="px-6 py-2 rounded-lg font-medium border-2 transition-colors hover:bg-orange-50"
            style={{ 
              borderColor: '#F59E0B',
              color: '#F59E0B',
              backgroundColor: 'transparent'
            }}
          >
            {currentSubscription?.plan?.name || 'Professional'} Plan
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-8 border-b-2 border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: '#FFF9E6' }}
              >
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${currentSubscription?.plan?.price || '99.99'}
              </div>
              <div className="text-sm text-gray-600">
                Monthly Cost
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: '#FFF9E6' }}
              >
                <Star className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalFeatures}
              </div>
              <div className="text-sm text-gray-600">
                Features
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: '#FFF9E6' }}
              >
                <BarChart3 className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categoriesCount}
              </div>
              <div className="text-sm text-gray-600">
                Categories
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Plan Overview & Usage */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Overview */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Overview</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSubscription?.plan?.name || 'Professional'}
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
                        : '23/09/2025'}
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
                    <p className="text-xs text-gray-400 mb-2">1,250 / 25,000</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: '80%',
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: '80%',
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">80%</span>
                    </div>
                  </div>

                  {/* Posts */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Posts</p>
                    <p className="text-xs text-gray-400 mb-2">15 / 200</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: '40%',
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: '40%',
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">40%</span>
                    </div>
                  </div>

                  {/* Ad Spend */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Ad Spend</p>
                    <p className="text-xs text-gray-400 mb-2">230 / 1,000</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: '75%',
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: '75%',
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">75%</span>
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Storage</p>
                    <p className="text-xs text-gray-400 mb-2">75mb / 100GB</p>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 relative h-5 bg-gray-200 overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: '60%',
                            backgroundColor: '#FCD34D'
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
                          style={{ 
                            left: '60%',
                            backgroundColor: '#000000'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[45px] text-right">60%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Total Usage */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    8.8%
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Usage
                  </div>
                </div>
              </div>

              {/* Usage Trend */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    Optimal
                  </div>
                  <div className="text-sm text-gray-600">
                    Usage Trend
                  </div>
                </div>
              </div>

              {/* Efficiency Score */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    11/100
                  </div>
                  <div className="text-sm text-gray-600">
                    Efficiency Score
                  </div>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    0
                  </div>
                  <div className="text-sm text-gray-600">
                    Days Remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tab Content Placeholder */}
        {activeTab !== 'dashboard' && (
          <div className="mt-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tabs.find(t => t.id === activeTab)?.label} Content
              </h3>
              <p className="text-gray-600">
                This section will display the {activeTab} content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagementSystem;