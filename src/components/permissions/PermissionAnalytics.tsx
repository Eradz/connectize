import React, { useState, useEffect } from 'react';
import { getSession } from '../../lib/session';

const getAuthHeaders = (): Record<string, string> => {
  const session = getSession();
  const token = session?.tokens?.access;

  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface PermissionStats {
  total_users: number;
  total_features: number;
  total_overrides: number;
  active_subscriptions: number;
  permission_usage: {
    feature_code: string;
    feature_name: string;
    total_users: number;
    users_with_access: number;
    usage_percentage: number;
  }[];
  subscription_breakdown: {
    plan_type: string;
    user_count: number;
    percentage: number;
  }[];
  recent_overrides: {
    id: string;
    user: {
      email: string;
      first_name: string;
      last_name: string;
    };
    feature: {
      feature_code: string;
      feature_name: string;
    };
    permission_type: 'grant' | 'deny';
    granted_by: {
      email: string;
      first_name: string;
      last_name: string;
    };
    granted_at: string;
    reason: string;
  }[];
  feature_categories: {
    category: string;
    feature_count: number;
    active_features: number;
  }[];
}

interface UsageMetrics {
  daily_usage: {
    date: string;
    feature_code: string;
    usage_count: number;
  }[];
  top_features: {
    feature_code: string;
    feature_name: string;
    usage_count: number;
    unique_users: number;
  }[];
  user_activity: {
    date: string;
    active_users: number;
    new_users: number;
  }[];
}

// Permission Analytics Dashboard
export const PermissionAnalytics: React.FC = () => {
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, metricsResponse] = await Promise.all([
        fetch('/api/permissions/admin/analytics/stats/', {
          headers: getAuthHeaders(),
        }),
        fetch(`/api/permissions/admin/analytics/usage/?timeframe=${timeframe}`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (statsResponse.ok && metricsResponse.ok) {
        const [statsData, metricsData] = await Promise.all([
          statsResponse.json(),
          metricsResponse.json(),
        ]);
        
        setStats(statsData);
        setMetrics(metricsData);
        setError(null);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={fetchAnalyticsData}
          className="text-red-600 hover:text-red-800 text-sm mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="permission-analytics space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Permission Analytics</h2>
        <div className="flex space-x-2">
          {['1d', '7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === period
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === '1d' ? '24h' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Features"
            value={stats.total_features}
            icon="⚡"
            color="green"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.active_subscriptions}
            icon="💳"
            color="purple"
          />
          <StatCard
            title="Permission Overrides"
            value={stats.total_overrides}
            icon="🔒"
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage Chart */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Usage</h3>
            <div className="space-y-3">
              {stats.permission_usage.slice(0, 10).map((usage) => (
                <div key={usage.feature_code} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{usage.feature_name}</span>
                      <span className="text-gray-600">
                        {usage.users_with_access}/{usage.total_users} ({usage.usage_percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${usage.usage_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Breakdown */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Plans</h3>
            <div className="space-y-3">
              {stats.subscription_breakdown.map((sub) => (
                <div key={sub.plan_type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <span className="font-medium text-gray-900 capitalize">
                      {sub.plan_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{sub.user_count}</div>
                    <div className="text-sm text-gray-600">{sub.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Features */}
        {metrics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Most Used Features ({timeframe})
            </h3>
            <div className="space-y-3">
              {metrics.top_features.slice(0, 10).map((feature, index) => (
                <div key={feature.feature_code} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{feature.feature_name}</div>
                      <div className="text-sm text-gray-600">{feature.unique_users} unique users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{feature.usage_count}</div>
                    <div className="text-sm text-gray-600">uses</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Categories */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Categories</h3>
            <div className="space-y-3">
              {stats.feature_categories.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {category.category.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {category.active_features} active / {category.feature_count} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {((category.active_features / category.feature_count) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Permission Overrides */}
      {stats && stats.recent_overrides.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Permission Changes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_overrides.map((override) => (
                  <tr key={override.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {override.user.first_name} {override.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{override.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{override.feature.feature_name}</div>
                      <div className="text-sm text-gray-500">{override.feature.feature_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        override.permission_type === 'grant'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {override.permission_type === 'grant' ? 'Granted' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {override.granted_by.first_name} {override.granted_by.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(override.granted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {override.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Activity Chart */}
      {metrics && metrics.user_activity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Activity ({timeframe})
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Daily Active Users</span>
              <span>New Users</span>
            </div>
            <div className="space-y-2">
              {metrics.user_activity.map((activity) => (
                <div key={activity.date} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.active_users}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.new_users}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PermissionAnalytics;
