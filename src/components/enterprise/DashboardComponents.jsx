/**
 * ENTERPRISE DASHBOARD UI COMPONENTS
 * Fortune 500-Level Reusable Components
 * Supervised by: Research & Product Development Team
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Eye, 
  MousePointer, 
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Edit,
  MoreHorizontal,
  CreditCard,
  Calendar,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// =============================================================================
// LOADING STATE COMPONENT
// =============================================================================

const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">Loading enterprise data...</span>
    </div>
  </div>
);

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

const MetricCard = ({ metric }) => {
  const IconComponent = metric.icon;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg border ${colorClasses[metric.color]}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        {metric.trend && (
          <div className={`flex items-center text-sm ${
            metric.trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            {metric.trendUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {metric.trend}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
        {metric.total && (
          <p className="text-sm text-gray-500 mt-1">of {metric.total} total</p>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// PERFORMANCE CHART COMPONENT
// =============================================================================

const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No performance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="impressions" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="Impressions"
        />
        <Line 
          type="monotone" 
          dataKey="clicks" 
          stroke="#10B981" 
          strokeWidth={2}
          name="Clicks"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// =============================================================================
// USAGE CHART COMPONENT
// =============================================================================

const UsageChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No usage data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="usage" 
          stroke="#8B5CF6" 
          fill="#8B5CF6" 
          fillOpacity={0.6}
          name="Usage"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// =============================================================================
// RECENT ACTIVITIES COMPONENT
// =============================================================================

const RecentActivities = ({ campaigns }) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No recent activities to display
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {campaigns.map((campaign, index) => (
        <div key={campaign.id || index} className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              campaign.status === 'active' ? 'bg-green-100' :
              campaign.status === 'paused' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              <Target className={`h-4 w-4 ${
                campaign.status === 'active' ? 'text-green-600' :
                campaign.status === 'paused' ? 'text-yellow-600' :
                'text-gray-600'
              }`} />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">{campaign.name || 'Untitled Campaign'}</h4>
              <p className="text-sm text-gray-500">
                {campaign.impressions?.toLocaleString() || 0} impressions • 
                {campaign.clicks?.toLocaleString() || 0} clicks
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-sm font-medium capitalize ${
              campaign.status === 'active' ? 'text-green-600' :
              campaign.status === 'paused' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {campaign.status}
            </p>
            <p className="text-sm text-gray-500">
              ${campaign.spent_amount?.toLocaleString() || 0} spent
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// SUBSCRIPTION DETAILS COMPONENT
// =============================================================================

const SubscriptionDetails = ({ subscription }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Current Plan</h4>
          <p className="text-lg font-semibold text-gray-900">{subscription.plan?.name}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Status</h4>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
            {subscription.status}
          </span>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Monthly Cost</h4>
          <p className="text-lg font-semibold text-gray-900">${subscription.plan?.price}/month</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
          <p className="text-sm text-gray-900">
            {new Date(subscription.start_date).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Next Billing</h4>
          <p className="text-sm text-gray-900">
            {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Plan Features</h4>
          <div className="text-sm text-gray-900">
            {subscription.plan?.features ? (
              typeof subscription.plan.features === 'string' ? (
                subscription.plan.features
              ) : (
                <div className="space-y-3">
                  {Object.entries(subscription.plan.features).map(([category, features]) => (
                    <div key={category} className="border-l-2 border-blue-200 pl-3">
                      <h5 className="font-medium text-gray-700 capitalize mb-1">
                        {category.replace(/_/g, ' ')}
                      </h5>
                      <div className="space-y-1 text-xs">
                        {typeof features === 'object' && features !== null ? (
                          Object.entries(features).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="font-medium">
                                {typeof value === 'boolean' ? (
                                  value ? (
                                    <span className="text-green-600">✓ Enabled</span>
                                  ) : (
                                    <span className="text-gray-400">✗ Disabled</span>
                                  )
                                ) : typeof value === 'number' ? (
                                  value === 0 ? (
                                    <span className="text-gray-400">Not included</span>
                                  ) : (
                                    <span className="text-blue-600">{value.toLocaleString()}</span>
                                  )
                                ) : (
                                  <span className="text-gray-800">{String(value)}</span>
                                )}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-600">{String(features)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              'Standard features included'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NO SUBSCRIPTION STATE COMPONENT
// =============================================================================

const NoSubscriptionState = () => (
  <div className="text-center py-12">
    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h4>
    <p className="text-gray-500 mb-6">Choose a plan to get started with enterprise features</p>
    <button className="px-6 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow transition-colors">
      View Plans
    </button>
  </div>
);

// =============================================================================
// PLAN CARD COMPONENT
// =============================================================================

const PlanCard = ({ plan, isCurrentPlan }) => {
  const getPlanIcon = (planType) => {
    const icons = {
      'trial': '🎯',
      'starter': '🚀', 
      'professional': '💼',
      'enterprise': '🏢',
      'custom': '👑'
    };
    return icons[plan.plan_type] || '📦';
  };

  const getKeyFeatures = (plan) => {
    if (!plan.features) return [];
    
    const features = [];
    const technical = plan.features.technical_limits || {};
    const content = plan.features.content_limits || {};
    
    if (technical.api_calls_per_month) {
      features.push(`${(technical.api_calls_per_month / 1000).toLocaleString()}K API calls`);
    }
    if (technical.storage_gb) {
      features.push(`${technical.storage_gb}GB storage`);
    }
    if (content.posts_per_month) {
      features.push(`${content.posts_per_month} posts/month`);
    }
    
    return features.slice(0, 3); // Show top 3 features
  };

  return (
    <div className={`border rounded-lg p-6 transition-all hover:shadow-lg ${
      isCurrentPlan ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white'
    }`}>
      <div className="text-center">
        <div className="text-2xl mb-2">{getPlanIcon(plan.plan_type)}</div>
        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500">/month</span>
        </div>
        
        {/* Key Features */}
        <div className="mt-4 space-y-1 text-sm text-gray-600">
          {getKeyFeatures(plan).map((feature, index) => (
            <div key={index} className="flex items-center justify-center">
              <span>✓ {feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          {isCurrentPlan ? (
            <span className="inline-flex px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg">
              Current Plan
            </span>
          ) : (
            <button className="w-full px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow transition-colors">
              Upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CAMPAIGNS LIST COMPONENT
// =============================================================================

const CampaignsList = ({ campaigns }) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-8 text-center">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h4>
        <p className="text-gray-500">Create your first advertising campaign to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Campaign
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Spend
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================================
// CAMPAIGN ROW COMPONENT
// =============================================================================

const CampaignRow = ({ campaign }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const ctr = campaign.impressions > 0 ? 
    ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
          <div className="text-sm text-gray-500">{campaign.description}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(campaign.status)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div>{campaign.impressions?.toLocaleString() || 0} impressions</div>
          <div className="text-gray-500">{campaign.clicks?.toLocaleString() || 0} clicks ({ctr}% CTR)</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div>${campaign.spent_amount?.toLocaleString() || 0}</div>
          <div className="text-gray-500">of ${campaign.budget?.toLocaleString() || 0} budget</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

// =============================================================================
// ANALYTICS CHART COMPONENT
// =============================================================================

const AnalyticsChart = ({ title, data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available for {title.toLowerCase()}
        </div>
      </div>
    );
  }

  const ChartComponent = type === 'bar' ? BarChart : type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : type === 'area' ? Area : Line;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            fill="#3B82F6"
            fillOpacity={type === 'area' ? 0.6 : 1}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

// Export individual components as named exports
export {
  LoadingState,
  MetricCard,
  PerformanceChart,
  UsageChart,
  RecentActivities,
  SubscriptionDetails,
  NoSubscriptionState,
  PlanCard,
  CampaignsList,
  CampaignRow,
  AnalyticsChart
};
