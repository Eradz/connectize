import React from 'react';
import { AlertTriangle, BarChart, TrendingUp, Info } from 'lucide-react';

const UsageMonitor = ({ 
  usageData, 
  currentPlan, 
  showAlerts = true,
  compact = false,
  className = "" 
}) => {
  if (!usageData || !currentPlan) {
    return null;
  }

  const formatUsagePercentage = (used, limit) => {
    if (!limit || limit === 0 || limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return { text: 'text-red-600', bg: 'bg-red-500', alert: 'bg-red-50 border-red-200' };
    if (percentage >= 75) return { text: 'text-yellow-600', bg: 'bg-yellow-500', alert: 'bg-yellow-50 border-yellow-200' };
    return { text: 'text-green-600', bg: 'bg-green-500', alert: 'bg-green-50 border-green-200' };
  };

  const usageItems = [
    {
      key: 'posts',
      label: 'Posts',
      used: usageData.posts_this_month || 0,
      limit: currentPlan.max_posts_per_month,
      unit: '',
      icon: '📝'
    },
    {
      key: 'products',
      label: 'Products',
      used: usageData.products_this_month || 0,
      limit: currentPlan.max_products_per_month,
      unit: '',
      icon: '📦'
    },
    {
      key: 'services',
      label: 'Services',
      used: usageData.services_this_month || 0,
      limit: currentPlan.max_services_per_month,
      unit: '',
      icon: '🔧'
    },
    {
      key: 'storage',
      label: 'Storage',
      used: parseFloat(usageData.storage_used_gb || 0),
      limit: currentPlan.max_storage_gb,
      unit: 'GB',
      icon: '💾'
    },
    {
      key: 'api_calls',
      label: 'API Calls',
      used: usageData.api_calls_this_month || 0,
      limit: currentPlan.max_api_calls_per_month,
      unit: '',
      icon: '🔌'
    },
    {
      key: 'ad_spend',
      label: 'Ad Spend',
      used: parseFloat(usageData.ad_spend_this_month || 0),
      limit: parseFloat(currentPlan.max_ad_spend_monthly || 0),
      unit: currentPlan.currency || 'USD',
      icon: '💰'
    }
  ];

  const criticalUsage = usageItems.filter(item => {
    if (item.limit === -1) return false; // Unlimited
    const percentage = formatUsagePercentage(item.used, item.limit);
    return percentage >= 90;
  });

  const warningUsage = usageItems.filter(item => {
    if (item.limit === -1) return false; // Unlimited
    const percentage = formatUsagePercentage(item.used, item.limit);
    return percentage >= 75 && percentage < 90;
  });

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            Usage Overview
          </h4>
          {(criticalUsage.length > 0 || warningUsage.length > 0) && (
            <div className="flex items-center text-sm">
              {criticalUsage.length > 0 && (
                <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs mr-2">
                  {criticalUsage.length} Critical
                </span>
              )}
              {warningUsage.length > 0 && (
                <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs">
                  {warningUsage.length} Warning
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {usageItems.slice(0, 6).map(item => {
            if (item.limit === -1) return null; // Skip unlimited items in compact view
            
            const percentage = formatUsagePercentage(item.used, item.limit);
            const colors = getUsageColor(percentage);
            
            return (
              <div key={item.key} className="text-center">
                <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                <div className={`text-sm font-medium ${colors.text}`}>
                  {item.used}{item.unit && ` ${item.unit}`} / {item.limit}{item.unit && ` ${item.unit}`}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${colors.bg}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BarChart className="w-5 h-5 mr-2" />
          Usage Monitoring
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Track your current usage against plan limits
        </p>
      </div>

      {/* Critical Alerts */}
      {showAlerts && criticalUsage.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-700">Usage Limit Exceeded</h4>
              <div className="text-sm text-red-600 mt-1">
                {criticalUsage.map(item => (
                  <div key={item.key}>
                    {item.label}: {item.used}{item.unit && ` ${item.unit}`} / {item.limit}{item.unit && ` ${item.unit}`} 
                    ({formatUsagePercentage(item.used, item.limit).toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {showAlerts && warningUsage.length > 0 && criticalUsage.length === 0 && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-700">Approaching Limit</h4>
              <div className="text-sm text-yellow-600 mt-1">
                {warningUsage.map(item => (
                  <div key={item.key}>
                    {item.label}: {item.used}{item.unit && ` ${item.unit}`} / {item.limit}{item.unit && ` ${item.unit}`} 
                    ({formatUsagePercentage(item.used, item.limit).toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageItems.map(item => {
            const percentage = formatUsagePercentage(item.used, item.limit);
            const colors = getUsageColor(percentage);
            const isUnlimited = item.limit === -1;
            
            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUnlimited ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        Unlimited
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${colors.text.replace('text-', 'text-')} ${colors.alert}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                
                {!isUnlimited && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${colors.bg}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    {item.used.toLocaleString()}{item.unit && ` ${item.unit}`}
                  </span>
                  <span>
                    {isUnlimited ? '∞' : `${item.limit.toLocaleString()}${item.unit && ` ${item.unit}`}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Suggestion */}
      {(criticalUsage.length > 0 || warningUsage.length > 0) && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-700">Need more resources?</h4>
              <p className="text-sm text-blue-600">Upgrade your plan for higher limits and additional features.</p>
            </div>
            <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-custom_yellow transition-colors">
              <TrendingUp className="w-4 h-4 mr-1" />
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageMonitor;
