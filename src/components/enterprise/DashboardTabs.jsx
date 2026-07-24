/**
 * ENTERPRISE DASHBOARD TAB COMPONENTS
 * Fortune 500-Level Interface Components
 * Supervised by: Research & Product Development Team
 */

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Eye, 
  MousePointer, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Shield,
  Database,
  Globe,
  Headphones,
  Crown,
  Star,
  Award
} from 'lucide-react';
import { 
  LoadingState,
  MetricCard,
  PerformanceChart,
  UsageChart,
  RecentActivities,
  SubscriptionDetails,
  NoSubscriptionState,
  PlanCard,
  CampaignsList,
  AnalyticsChart
} from './DashboardComponents';
import { 
  UpgradeModal,
  CreateCampaignModal,
  UsageBreakdown,
  AdMetricCard,
  AnalyticsTable
} from './DashboardModals';

// =============================================================================
// OVERVIEW TAB COMPONENT
// =============================================================================

const OverviewTab = ({ 
  currentSubscription, 
  usageAnalytics, 
  dashboardMetrics, 
  campaigns, 
  isLoading 
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  // Calculate key metrics
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active')?.length || 0;
  const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
  const totalClicks = campaigns?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0;
  const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  const keyMetrics = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      total: totalCampaigns,
      icon: Target,
      color: 'blue',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Impressions',
      value: totalImpressions.toLocaleString(),
      icon: Eye,
      color: 'green',
      trend: '+28%',
      trendUp: true
    },
    {
      title: 'Click-Through Rate',
      value: `${averageCTR}%`,
      icon: MousePointer,
      color: 'purple',
      trend: '+3.2%',
      trendUp: true
    },
    {
      title: 'Subscription Plan',
      value: currentSubscription?.plan?.name || 'None',
      icon: DollarSign,
      color: 'orange',
      trend: currentSubscription?.status || 'inactive',
      trendUp: currentSubscription?.status === 'active'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <PerformanceChart data={dashboardMetrics?.performanceData || []} />
        </div>

        {/* Usage Analytics Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Analytics</h3>
          <UsageChart data={usageAnalytics?.usage_data || []} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <RecentActivities campaigns={campaigns?.slice(0, 5) || []} />
      </div>
    </div>
  );
};

// =============================================================================
// SUBSCRIPTION TAB COMPONENT
// =============================================================================

const SubscriptionTab = ({ 
  currentSubscription, 
  subscriptionPlans, 
  usageAnalytics, 
  isLoading 
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Current Subscription</h3>
            <p className="text-gray-600">Manage your subscription and billing</p>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow transition-colors"
          >
            Upgrade Plan
          </button>
        </div>

        {currentSubscription ? (
          <SubscriptionDetails subscription={currentSubscription} />
        ) : (
          <NoSubscriptionState />
        )}
      </div>

      {/* Usage Analytics */}
      {usageAnalytics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Usage Analytics</h3>
          <UsageBreakdown analytics={usageAnalytics} currentSubscription={currentSubscription} />
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isCurrentPlan={plan.id === currentSubscription?.plan?.id}
            />
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          plans={subscriptionPlans}
          currentPlan={currentSubscription?.plan}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

// =============================================================================
// ADVERTISING TAB COMPONENT
// =============================================================================

const AdvertisingTab = ({ campaigns, dashboardMetrics, isLoading }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  );

  return (
    <div className="space-y-8">
      {/* Advertising Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdMetricCard 
          title="Total Campaigns"
          value={campaigns.length}
          icon={Target}
          color="blue"
        />
        <AdMetricCard 
          title="Active Campaigns"
          value={campaigns.filter(c => c.status === 'active').length}
          icon={Activity}
          color="green"
        />
        <AdMetricCard 
          title="Total Spend"
          value={`$${campaigns.reduce((sum, c) => sum + (c.spent_amount || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Campaign Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow transition-colors"
        >
          Create Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CampaignsList campaigns={filteredCampaigns} />
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// =============================================================================
// ANALYTICS TAB COMPONENT
// =============================================================================

const AnalyticsTab = ({ usageAnalytics, dashboardMetrics, dateRange, isLoading }) => {
  const [chartType, setChartType] = useState('line');

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      {/* Analytics Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Advanced Analytics</h3>
        <div className="flex items-center space-x-4">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalyticsChart 
          title="Performance Trends"
          data={dashboardMetrics?.trends || []}
          type={chartType}
        />
        <AnalyticsChart 
          title="Usage Patterns"
          data={usageAnalytics?.patterns || []}
          type={chartType}
        />
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Detailed Analytics</h4>
        </div>
        <AnalyticsTable data={dashboardMetrics?.detailed || []} />
      </div>
    </div>
  );
};

// Export individual components as named exports
export {
  OverviewTab,
  SubscriptionTab,
  AdvertisingTab,
  AnalyticsTab
};
