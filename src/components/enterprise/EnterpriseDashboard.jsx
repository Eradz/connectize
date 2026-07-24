/**
 * ENTERPRISE DASHBOARD COMPONENT
 * Fortune 500-Level User Interface
 * Supervised by: Research & Product Development Team
 */

import React, { useEffect, useState } from 'react';
import { 
  useSubscriptionStore, 
  useAdvertisingStore, 
  useEnterpriseStore 
} from '../../stores/enterprise-store';
import { 
  OverviewTab, 
  SubscriptionTab, 
  AdvertisingTab, 
  AnalyticsTab 
} from './DashboardTabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  Settings,
  Bell,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Calendar,
  Filter
} from 'lucide-react';

const EnterpriseDashboard = React.memo(() => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Store hooks
  const {
    currentSubscription,
    subscriptionPlans,
    usageAnalytics,
    fetchMySubscription,
    fetchSubscriptionPlans,
    fetchUsageAnalytics,
    loading: subscriptionLoading
  } = useSubscriptionStore();

  const {
    campaigns,
    dashboardMetrics,
    fetchCampaigns,
    fetchDashboardMetrics,
    loading: advertisingLoading
  } = useAdvertisingStore();

  const {
    dashboardData,
    notifications,
    addNotification,
    loading: enterpriseLoading
  } = useEnterpriseStore();

  // Initialize dashboard data - only once
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (isInitialized) {
        console.log('EnterpriseDashboard: Already initialized, skipping');
        return;
      }
      
      console.log('EnterpriseDashboard: Initializing data...');
      
      try {
        await Promise.all([
          fetchSubscriptionPlans(),
          fetchUsageAnalytics(dateRange),
          fetchCampaigns(),
          fetchDashboardMetrics()
        ]);
        
        if (isMounted) {
          console.log('EnterpriseDashboard: Initialization complete');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize dashboard data:', error);
        if (isMounted) {
          addNotification({
            type: 'error',
            message: 'Failed to load dashboard data. Please refresh the page.',
            duration: 5000
          });
          setIsInitialized(true);
        }
      }
    };

    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Handle date range changes separately
  useEffect(() => {
    if (isInitialized && dateRange) {
      console.log('EnterpriseDashboard: Date range changed, fetching usage analytics');
      fetchUsageAnalytics(dateRange);
    }
  }, [dateRange, isInitialized, fetchUsageAnalytics]);

  // Loading state
  const isLoading = subscriptionLoading || advertisingLoading || enterpriseLoading;

  // Refresh data
  const handleRefresh = async () => {
    addNotification({
      type: 'info',
      message: 'Refreshing dashboard data...',
      duration: 2000
    });
    
    await Promise.all([
      fetchMySubscription(),
      fetchUsageAnalytics(dateRange),
      fetchDashboardMetrics()
    ]);

    addNotification({
      type: 'success',
      message: 'Dashboard refreshed successfully',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <DashboardHeader 
        onRefresh={handleRefresh}
        isLoading={isLoading}
        notifications={notifications}
        currentSubscription={currentSubscription}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <DashboardTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Content Based on Active Tab */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <OverviewTab 
              currentSubscription={currentSubscription}
              usageAnalytics={usageAnalytics}
              dashboardMetrics={dashboardMetrics}
              campaigns={campaigns}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'subscriptions' && (
            <SubscriptionTab 
              currentSubscription={currentSubscription}
              subscriptionPlans={subscriptionPlans}
              usageAnalytics={usageAnalytics}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'advertising' && (
            <AdvertisingTab 
              campaigns={campaigns}
              dashboardMetrics={dashboardMetrics}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsTab 
              usageAnalytics={usageAnalytics}
              dashboardMetrics={dashboardMetrics}
              dateRange={dateRange}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
});

// Add display name for React DevTools
EnterpriseDashboard.displayName = 'EnterpriseDashboard';

// =============================================================================
// DASHBOARD HEADER COMPONENT
// =============================================================================

const DashboardHeader = ({ onRefresh, isLoading, notifications, currentSubscription }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fortune 500-level business analytics and management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Subscription Status */}
            {currentSubscription && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentSubscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {currentSubscription.plan?.name} Plan
                </span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-dark bg-gold hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DASHBOARD TABS COMPONENT
// =============================================================================

const DashboardTabs = ({ activeTab, setActiveTab, dateRange, setDateRange }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'subscriptions', name: 'Subscriptions', icon: DollarSign },
    { id: 'advertising', name: 'Advertising', icon: Target },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  return (
    <div className="flex justify-between items-center">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500/30 focus:border-primary-500 sm:text-sm"
        >
          {dateRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
