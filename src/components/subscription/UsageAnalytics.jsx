import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import subscriptionsApi from '@/api-services/subscriptions';
import { getAuthorizationHeader } from '@/lib/helpers';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  MessageSquare,
  Share2,
  Eye
} from 'lucide-react';

const UsageAnalytics = () => {
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const authHeaders = await getAuthorizationHeader();

      const [
        usageResponse,
        analyticsResponse,
        historyResponse,
        subscriptionResponse
      ] = await Promise.all([
        fetch('/api/v1/subscriptions/usage/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/analytics/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/usage_history/', { headers: { ...authHeaders } }),
        fetch('/api/v1/subscriptions/current/', { headers: { ...authHeaders } })
      ]);

      // Safe JSON parsing
      const safeJsonParse = async (response, defaultValue = null) => {
        if (!response.ok) return defaultValue;
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return defaultValue;
        try {
          return await response.json();
        } catch {
          return defaultValue;
        }
      };

      const usageData = await safeJsonParse(usageResponse, {});
      const analyticsData = await safeJsonParse(analyticsResponse, {});
      const historyData = await safeJsonParse(historyResponse, { results: [] });
      const subscriptionData = await safeJsonParse(subscriptionResponse, {});

      setUsage(usageData);
      setAnalytics(analyticsData);
      setUsageHistory(historyData?.results || historyData || []);
      setSubscription(subscriptionData?.data?.subscription || subscriptionData);

    } catch (error) {
      console.error('Error fetching usage data:', error);
      setError('Failed to load usage analytics');
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  const getUsageIcon = (type) => {
    const iconMap = {
      'posts': MessageSquare,
      'analytics_views': Eye,
      'team_members': Users,
      'api_calls': Activity,
      'storage': Share2,
      'social_accounts': Share2
    };
    return iconMap[type] || Activity;
  };

  const formatUsageValue = (value, type) => {
    if (type === 'storage') {
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usage?.total_usage_percentage ? `${usage.total_usage_percentage.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Usage Trend</p>
                <p className="text-lg font-semibold text-green-600">
                  {analytics?.insights?.usage_efficiency || 'Optimal'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.insights?.value_score ? `${Math.round(analytics.insights.value_score)}/100` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.billing_period?.days_remaining || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Period Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage?.current_usage ? (
            <div className="space-y-6">
              {Object.entries(usage.current_usage).map(([key, usageData]) => {
                const IconComponent = getUsageIcon(key);
                const percentage = usageData.percentage || 0;
                const isNearLimit = percentage >= 80;
                
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        {isNearLimit && (
                          <Badge variant="destructive" className="ml-2">
                            Near Limit
                          </Badge>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                        {formatUsageValue(usageData.used, key)} / {usageData.limit === 0 ? '∞' : formatUsageValue(usageData.limit, key)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={percentage} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>
                          {usageData.limit === 0 ? 'Unlimited' : `${(100 - percentage).toFixed(1)}% remaining`}
                        </span>
                      </div>
                    </div>

                    {isNearLimit && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You're approaching your {key.replace('_', ' ')} limit. Consider upgrading your plan.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Usage Data</h3>
              <p className="text-gray-600">Usage analytics will appear here once you start using the platform</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Insights */}
      {analytics?.insights && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Efficiency</span>
                </div>
                <p className="text-2xl font-bold text-blue-800 capitalize">
                  {analytics.insights.usage_efficiency || 'N/A'}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  How well you're using your plan
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Cost per Action</span>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  ${analytics.insights.cost_per_post?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Average cost per activity
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Value Score</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {analytics.insights.value_score ? Math.round(analytics.insights.value_score) : 'N/A'}/100
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Overall plan value rating
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analytics?.recommendations && analytics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <Alert key={index} className={rec.type === 'usage_warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{rec.message}</strong>
                    {rec.suggestion && (
                      <div className="mt-1 text-sm">
                        {rec.suggestion}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage History */}
      {usageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageHistory.slice(0, 5).map((period, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {period.period_start ? new Date(period.period_start).toLocaleDateString() : 'N/A'} - 
                      {period.period_end ? new Date(period.period_end).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total usage: {period.total_usage_percentage?.toFixed(1) || '0'}%
                    </p>
                  </div>
                  <Badge variant={period.total_usage_percentage > 80 ? 'destructive' : 'secondary'}>
                    {period.total_usage_percentage > 80 ? 'High Usage' : 'Normal Usage'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageAnalytics;
