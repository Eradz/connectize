import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlags } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  CogIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BellIcon
} from '../ui/ModernIcon';

const ComprehensiveAdminDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { flags, isEnabled } = useFeatureFlags();
  const [analytics, setAnalytics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPermission('admin')) {
      fetchDashboardData();
    }
  }, [hasPermission]);

  const fetchDashboardData = async () => {
    try {
      // Mock comprehensive dashboard data
      setAnalytics({
        users: {
          total: 12485,
          active_monthly: 8942,
          new_signups: 234,
          churn_rate: 2.3,
          growth_rate: 18.5
        },
        revenue: {
          monthly_recurring: 45782.50,
          total_this_month: 52340.80,
          average_revenue_per_user: 89.45,
          conversion_rate: 12.8,
          growth_rate: 24.2
        },
        content: {
          posts_published: 1823,
          products_listed: 456,
          services_offered: 289,
          featured_ads_active: 42,
          moderation_queue: 18
        },
        engagement: {
          daily_active_users: 2845,
          average_session_duration: '8m 32s',
          page_views_monthly: 248950,
          api_calls_monthly: 89450,
          feature_adoption_rate: 68.5
        },
        ai_features: {
          matches_generated: 15689,
          opportunities_discovered: 892,
          accuracy_rate: 94.2,
          processing_time_avg: '2.3s',
          user_satisfaction: 4.7
        }
      });

      setAlerts([
        {
          id: 1,
          type: 'warning',
          title: 'High API Usage',
          message: 'API usage is at 85% of monthly limit',
          timestamp: '2 hours ago',
          action: 'Monitor usage'
        },
        {
          id: 2,
          type: 'info',
          title: 'Feature Flag Update',
          message: 'AI Matchmaking enabled for Premium users',
          timestamp: '4 hours ago',
          action: 'View details'
        },
        {
          id: 3,
          type: 'success',
          title: 'System Backup Complete',
          message: 'Daily backup completed successfully',
          timestamp: '6 hours ago',
          action: 'View logs'
        },
        {
          id: 4,
          type: 'warning',
          title: 'Moderation Queue',
          message: '18 items pending moderation',
          timestamp: '8 hours ago',
          action: 'Review queue'
        }
      ]);

      setSystemStatus({
        api_health: 'healthy',
        database_health: 'healthy',
        redis_health: 'healthy',
        celery_health: 'healthy',
        storage_health: 'healthy',
        uptime: '99.97%',
        response_time: '245ms',
        error_rate: '0.02%'
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view the admin dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive platform management and analytics
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button variant="minimal" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            System Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.users?.total.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.users?.growth_rate}%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.revenue?.monthly_recurring.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.revenue?.growth_rate}%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Features</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(flags).filter(Boolean).length}
              </p>
              <div className="flex items-center mt-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">
                  {Math.round((Object.values(flags).filter(Boolean).length / Object.keys(flags).length) * 100)}% enabled
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{systemStatus.uptime}</p>
              <div className="flex items-center mt-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">All systems operational</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Usage Analytics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'AI Matchmaking', usage: 94, enabled: isEnabled('ai_matchmaking') },
                { name: 'Featured Ads', usage: 78, enabled: isEnabled('featured_ads') },
                { name: 'Knowledge Hub', usage: 89, enabled: isEnabled('knowledge_hub') },
                { name: 'Deal Rooms', usage: 65, enabled: isEnabled('virtual_deal_rooms') },
                { name: 'Analytics', usage: 72, enabled: isEnabled('predictive_analytics') },
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${feature.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-700">{feature.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${feature.usage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{feature.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Feature</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Subscription Plans', revenue: 45782, growth: 24.2 },
                { name: 'Featured Ads', revenue: 8945, growth: 45.8 },
                { name: 'Premium API Access', revenue: 3420, growth: 67.3 },
                { name: 'Data Licensing', revenue: 1890, growth: 89.5 },
                { name: 'Professional Services', revenue: 2340, growth: 12.4 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <div className="flex items-center mt-1">
                      <TrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+{item.growth}%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 font-bold">
                    ${item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'API Health', status: systemStatus.api_health },
                { name: 'Database', status: systemStatus.database_health },
                { name: 'Redis Cache', status: systemStatus.redis_health },
                { name: 'Background Jobs', status: systemStatus.celery_health },
                { name: 'File Storage', status: systemStatus.storage_health },
                { name: 'Response Time', status: systemStatus.response_time, type: 'metric' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className={`text-sm font-medium ${
                    item.type === 'metric' 
                      ? 'text-gray-900' 
                      : getStatusColor(item.status)
                  }`}>
                    {item.type === 'metric' ? item.status : item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <Button variant="minimal" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Features Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {analytics.ai_features?.matches_generated.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">Matches Generated</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {analytics.ai_features?.opportunities_discovered.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">Opportunities Found</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {analytics.ai_features?.accuracy_rate}%
              </div>
              <p className="text-gray-600 text-sm">AI Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {analytics.ai_features?.processing_time_avg}
              </div>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {analytics.ai_features?.user_satisfaction}/5.0
              </div>
              <p className="text-gray-600 text-sm">User Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Admin Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
            Feature Flags
          </Button>
          <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
            User Management
          </Button>
          <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
            System Settings
          </Button>
          <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
            Analytics Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
