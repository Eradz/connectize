import React from 'react';
import { usePermissions, useFeatureAccess, useSubscriptionAccess } from '../../context/PermissionContext';

interface PermissionStatusProps {
  className?: string;
}

interface FeatureStatusProps {
  feature: string;
  showDescription?: boolean;
  className?: string;
}

interface SubscriptionStatusProps {
  className?: string;
  showUpgradeLink?: boolean;
}

// Overall Permission Status Display
export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  className = '',
}) => {
  const { permissions, isLoading, error } = usePermissions();
  const { subscriptionPlan, hasSubscription } = useSubscriptionAccess();

  if (isLoading) {
    return (
      <div className={`permission-status loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`permission-status error ${className}`}>
        <div className="text-red-600 text-sm">
          <span className="font-medium">Permission Error:</span> {error}
        </div>
      </div>
    );
  }

  if (!permissions) {
    return (
      <div className={`permission-status no-permissions ${className}`}>
        <div className="text-gray-500 text-sm">No permissions loaded</div>
      </div>
    );
  }

  const featureCount = Object.keys(permissions.permissions).length;
  const activeFeatures = Object.values(permissions.permissions).filter(p => p.has_access).length;

  return (
    <div className={`permission-status ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Permission Status</span>
          <span className="text-xs text-gray-500">
            {activeFeatures}/{featureCount} features
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(activeFeatures / featureCount) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">
            {Math.round((activeFeatures / featureCount) * 100)}%
          </span>
        </div>

        {hasSubscription && (
          <div className="text-xs text-gray-600">
            Plan: <span className="font-medium capitalize">{subscriptionPlan}</span>
          </div>
        )}

        {permissions.has_admin_access && (
          <div className="text-xs text-blue-600 font-medium">
            ✓ Admin Access
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Feature Status
export const FeatureStatus: React.FC<FeatureStatusProps> = ({
  feature,
  showDescription = true,
  className = '',
}) => {
  const { permissions } = usePermissions();

  if (!permissions) {
    return null;
  }

  const permission = permissions.permissions[feature];

  if (!permission) {
    return (
      <div className={`feature-status not-found ${className}`}>
        <span className="text-red-500 text-sm">Feature '{feature}' not found</span>
      </div>
    );
  }

  return (
    <div className={`feature-status ${permission.has_access ? 'granted' : 'denied'} ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${permission.has_access ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm font-medium">{permission.feature_name}</span>
        <span className={`text-xs px-2 py-1 rounded ${permission.has_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {permission.has_access ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      
      {showDescription && permission.description && (
        <div className="text-xs text-gray-600 mt-1 ml-4">
          {permission.description}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1 ml-4">
        Access Level: {permission.access_level}
      </div>
    </div>
  );
};

// Subscription Status Display
export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  className = '',
  showUpgradeLink = true,
}) => {
  const {
    hasSubscription,
    subscriptionPlan,
    isSubscriptionActive,
    expiresAt,
  } = useSubscriptionAccess();

  if (!hasSubscription) {
    return (
      <div className={`subscription-status no-subscription ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Active Subscription</h3>
              <div className="mt-1 text-sm text-yellow-700">
                Subscribe to unlock premium features
              </div>
              {showUpgradeLink && (
                <div className="mt-2">
                  <a
                    href="/subscriptions"
                    className="text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300"
                  >
                    View Plans
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpiringSoon = expiresAt && new Date(expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className={`subscription-status active ${className}`}>
      <div className={`border rounded-lg p-3 ${isExpiringSoon ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isExpiringSoon ? 'text-orange-400' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isExpiringSoon ? 'text-orange-800' : 'text-green-800'}`}>
                {subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan
              </h3>
              <div className={`text-sm ${isExpiringSoon ? 'text-orange-700' : 'text-green-700'}`}>
                {isSubscriptionActive ? 'Active' : 'Inactive'}
                {expiresAt && (
                  <span className="ml-2">
                    • Expires {new Date(expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showUpgradeLink && (
            <div>
              <a
                href="/subscriptions"
                className={`text-sm px-3 py-1 rounded hover:opacity-80 ${
                  isExpiringSoon
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                {isExpiringSoon ? 'Renew' : 'Manage'}
              </a>
            </div>
          )}
        </div>
        
        {isExpiringSoon && (
          <div className="mt-2 text-xs text-orange-700">
            Your subscription expires soon. Renew to maintain access to premium features.
          </div>
        )}
      </div>
    </div>
  );
};

// Feature List Component
interface FeatureListProps {
  category?: string;
  showOnlyGranted?: boolean;
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  category,
  showOnlyGranted = false,
  className = '',
}) => {
  const { permissions } = usePermissions();

  if (!permissions) {
    return (
      <div className={`feature-list loading ${className}`}>
        <div className="text-gray-500 text-sm">Loading features...</div>
      </div>
    );
  }

  let features = Object.values(permissions.permissions);

  // Filter by category if specified
  if (category) {
    features = features.filter(f => f.feature_code.startsWith(category));
  }

  // Filter by access if specified
  if (showOnlyGranted) {
    features = features.filter(f => f.has_access);
  }

  if (features.length === 0) {
    return (
      <div className={`feature-list empty ${className}`}>
        <div className="text-gray-500 text-sm">
          {showOnlyGranted ? 'No accessible features found' : 'No features found'}
        </div>
      </div>
    );
  }

  return (
    <div className={`feature-list ${className}`}>
      <div className="space-y-2">
        {features.map((feature) => (
          <FeatureStatus
            key={feature.feature_code}
            feature={feature.feature_code}
            showDescription={true}
          />
        ))}
      </div>
    </div>
  );
};

// Usage Stats Component
interface UsageStatsProps {
  feature?: string;
  className?: string;
}

export const UsageStats: React.FC<UsageStatsProps> = ({
  feature,
  className = '',
}) => {
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/permissions/user/usage-stats/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.usage_stats);
        }
      } catch (err) {
        console.error('Failed to fetch usage stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={`usage-stats loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`usage-stats error ${className}`}>
        <div className="text-gray-500 text-sm">Usage stats unavailable</div>
      </div>
    );
  }

  const featureStats = feature ? stats[feature] : null;

  if (feature && !featureStats) {
    return (
      <div className={`usage-stats no-data ${className}`}>
        <div className="text-gray-500 text-sm">No usage data for {feature}</div>
      </div>
    );
  }

  if (feature) {
    return (
      <div className={`usage-stats feature ${className}`}>
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">{feature} Usage</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Today:</span>
              <span className="ml-2 font-medium">
                {featureStats.daily_usage || 0}
                {featureStats.daily_limit && `/${featureStats.daily_limit}`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">This Month:</span>
              <span className="ml-2 font-medium">
                {featureStats.monthly_usage || 0}
                {featureStats.monthly_limit && `/${featureStats.monthly_limit}`}
              </span>
            </div>
          </div>
          
          {featureStats.daily_limit && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Daily Limit</span>
                <span>{featureStats.daily_usage}/{featureStats.daily_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full"
                  style={{ width: `${Math.min((featureStats.daily_usage / featureStats.daily_limit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`usage-stats overview ${className}`}>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Usage Overview</h4>
        {Object.entries(stats).map(([featureCode, featureStats]: [string, any]) => (
          <div key={featureCode} className="bg-gray-50 rounded p-2">
            <div className="text-xs font-medium text-gray-700">{featureCode}</div>
            <div className="text-xs text-gray-600">
              Daily: {featureStats.daily_usage || 0}
              {featureStats.daily_limit && `/${featureStats.daily_limit}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  PermissionStatus,
  FeatureStatus,
  SubscriptionStatus,
  FeatureList,
  UsageStats,
};
