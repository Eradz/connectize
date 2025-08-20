/**
 * ADVANCED USAGE ANALYTICS COMPONENT
 * Comprehensive analytics dashboard with usage trends, feature utilization, and optimization recommendations
 * Part of the Enhanced Subscription Dashboard Implementation Plan
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  BarChart3, PieChart as PieChartIcon, Activity, Target,
  Zap, Shield, Users, Clock
} from 'lucide-react';

const AdvancedUsageAnalytics = ({ analytics, subscription }) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  
  // Show demo content when no real data is available
  if (!analytics && !subscription) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Loading</h3>
          <p className="text-gray-500">Your usage analytics will appear here once available.</p>
        </div>
      </div>
    );
  }

  // Demo data for when analytics is not available but we have subscription
  const getDemoAnalytics = () => ({
    usage_trends: [
      { month: 'Jan', posts: 45, storage: 3.2, api_calls: 1200 },
      { month: 'Feb', posts: 52, storage: 3.8, api_calls: 1450 },
      { month: 'Mar', posts: 48, storage: 4.1, api_calls: 1320 },
      { month: 'Apr', posts: 65, storage: 4.7, api_calls: 1680 },
      { month: 'May', posts: 71, storage: 5.2, api_calls: 1890 },
      { month: 'Jun', posts: 68, storage: 5.8, api_calls: 1750 }
    ],
    feature_utilization: [
      { feature: 'Analytics', usage: 85, color: '#3B82F6' },
      { feature: 'API Access', usage: 72, color: '#10B981' },
      { feature: 'Storage', usage: 68, color: '#F59E0B' },
      { feature: 'Featured Ads', usage: 45, color: '#EF4444' }
    ],
    health_score: {
      overall: 82,
      trends: {
        usage_efficiency: 85,
        feature_adoption: 78,
        engagement: 84,
        growth_potential: 79
      }
    },
    recommendations: [
      {
        type: 'optimization',
        title: 'Optimize Storage Usage',
        description: 'You\'re using 68% of your storage. Consider archiving older content.',
        priority: 'medium'
      },
      {
        type: 'feature',
        title: 'Explore Featured Ads',
        description: 'Featured Ads usage is low. This could boost your content visibility.',
        priority: 'low'
      }
    ]
  });

  const analyticsData = analytics || getDemoAnalytics();

  const usageData = analyticsData.current_usage?.usage || {};
  const trends = analyticsData.current_usage?.trends || {};
  
  // Transform usage data for charts
  const chartData = Object.keys(usageData).map(key => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    current: usageData[key]?.current || 0,
    limit: usageData[key]?.limit || 100,
    percentage: usageData[key]?.percentage || 0
  }));

  // Use demo data for charts if no real usage data
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: 'Posts', current: 68, limit: 100, percentage: 68 },
    { name: 'Storage', current: 5.8, limit: 10, percentage: 58 },
    { name: 'API Calls', current: 1750, limit: 2500, percentage: 70 }
  ];

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4" />;
    if (percentage >= 75) return <TrendingUp className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Usage Overview Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
        {displayChartData.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.percentage)}
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
              </div>
              {getTrendIcon(trends[Object.keys(usageData)[index] + '_trend'])}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{item.current}</span>
                <span className="text-sm text-gray-500">/ {item.limit}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.percentage >= 90 ? 'bg-red-500' : 
                    item.percentage >= 75 ? 'bg-orange-500' : 
                    item.percentage >= 50 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.percentage)}`}>
                  {item.percentage.toFixed(1)}% used
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Usage Trends
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('overview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === 'overview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedMetric('detailed')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === 'detailed' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'current' ? `${value} used` : `${value} limit`,
                  name === 'current' ? 'Current Usage' : 'Plan Limit'
                ]}
              />
              <Bar dataKey="current" fill="#3B82F6" name="current" />
              <Bar dataKey="limit" fill="#E5E7EB" name="limit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Utilization */}
      {analytics.feature_utilization && (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Feature Utilization
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Features */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Core Features</h4>
              <div className="space-y-3">
                {Object.entries(analytics.feature_utilization.core_features || {}).map(([key, feature]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {feature.used}/{feature.available}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.utilization_rate)}`}>
                        {feature.utilization_rate?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Premium Features */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Premium Features</h4>
              <div className="space-y-3">
                {Object.entries(analytics.feature_utilization.premium_features || {}).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="flex items-center space-x-2">
                      {enabled ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Enabled</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                          <span className="text-xs text-gray-500">Not Available</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Health Score */}
      {analytics.subscription_health_score !== undefined && (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Subscription Health Score
          </h3>
          
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - analytics.subscription_health_score / 100)}`}
                  className={`transition-all duration-1000 ${
                    analytics.subscription_health_score >= 80 ? 'text-green-500' :
                    analytics.subscription_health_score >= 60 ? 'text-blue-500' :
                    analytics.subscription_health_score >= 40 ? 'text-orange-500' : 'text-red-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analytics.subscription_health_score}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Health Analysis</h4>
              <div className="space-y-2">
                {analytics.subscription_health_score >= 80 && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Excellent subscription health</span>
                  </div>
                )}
                {analytics.subscription_health_score >= 60 && analytics.subscription_health_score < 80 && (
                  <div className="flex items-center text-blue-600">
                    <Activity className="w-4 h-4 mr-2" />
                    <span className="text-sm">Good subscription health</span>
                  </div>
                )}
                {analytics.subscription_health_score < 60 && (
                  <div className="flex items-center text-orange-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Needs attention</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUsageAnalytics;
