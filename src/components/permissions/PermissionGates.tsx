import React, { ReactNode } from 'react';
import { usePermissions, useFeatureAccess, useSubscriptionAccess } from '../../context/PermissionContext';
import { getSession } from '../../lib/session';

const getAuthHeaders = (): Record<string, string> => {
  const session = getSession();
  const token = session?.tokens?.access;

  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

interface FeatureGateProps extends PermissionGateProps {
  feature: string;
  trackUsage?: boolean;
  usageMetadata?: any;
}

interface MultiFeatureGateProps extends PermissionGateProps {
  features: string[];
  requireAll?: boolean;
}

interface SubscriptionGateProps extends PermissionGateProps {
  minimumPlan?: string;
}

interface AdminGateProps extends PermissionGateProps {}

// Basic Permission Gate - protects content based on feature access
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
  loading = null,
  trackUsage = true,
  usageMetadata = {},
}) => {
  const { isLoading } = usePermissions();
  const { hasAccess, useFeature } = useFeatureAccess(feature);

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // Track feature usage when component renders
  if (trackUsage) {
    useFeature({
      component: 'FeatureGate',
      feature,
      ...usageMetadata,
    });
  }

  return <>{children}</>;
};

// Multi-Feature Gate - requires access to multiple features
export const MultiFeatureGate: React.FC<MultiFeatureGateProps> = ({
  features,
  requireAll = true,
  children,
  fallback = null,
  loading = null,
}) => {
  const { hasAnyFeatureAccess, isLoading, permissions } = usePermissions();

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (!permissions) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? features.every(feature => permissions.permissions[feature]?.has_access)
    : hasAnyFeatureAccess(features);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Subscription Gate - protects content based on subscription level
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  minimumPlan = 'basic',
  children,
  fallback = null,
  loading = null,
}) => {
  const { isLoading } = usePermissions();
  const { hasMinimumPlan } = useSubscriptionAccess();

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (!hasMinimumPlan(minimumPlan)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Admin Gate - protects admin-only content
export const AdminGate: React.FC<AdminGateProps> = ({
  children,
  fallback = null,
  loading = null,
}) => {
  const { permissions, isLoading } = usePermissions();

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (!permissions?.has_admin_access) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Combined Gate - supports multiple permission types
interface CombinedGateProps extends PermissionGateProps {
  feature?: string;
  features?: string[];
  requireAllFeatures?: boolean;
  minimumPlan?: string;
  adminOnly?: boolean;
  requireAll?: boolean; // If true, all conditions must be met
}

export const PermissionGate: React.FC<CombinedGateProps> = ({
  feature,
  features,
  requireAllFeatures = true,
  minimumPlan,
  adminOnly = false,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}) => {
  const { permissions, isLoading, hasAnyFeatureAccess } = usePermissions();
  const { hasMinimumPlan } = useSubscriptionAccess();

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (!permissions) {
    return <>{fallback}</>;
  }

  const checks: boolean[] = [];

  // Check single feature
  if (feature) {
    checks.push(permissions.permissions[feature]?.has_access || false);
  }

  // Check multiple features
  if (features && features.length > 0) {
    if (requireAllFeatures) {
      checks.push(features.every(f => permissions.permissions[f]?.has_access));
    } else {
      checks.push(hasAnyFeatureAccess(features));
    }
  }

  // Check subscription
  if (minimumPlan) {
    checks.push(hasMinimumPlan(minimumPlan));
  }

  // Check admin access
  if (adminOnly) {
    checks.push(permissions.has_admin_access);
  }

  // No checks defined, allow access
  if (checks.length === 0) {
    return <>{children}</>;
  }

  // Evaluate checks
  const hasAccess = requireAll ? checks.every(Boolean) : checks.some(Boolean);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage Limit Gate - shows content based on usage limits
interface UsageLimitGateProps extends PermissionGateProps {
  feature: string;
  showLimitInfo?: boolean;
}

export const UsageLimitGate: React.FC<UsageLimitGateProps> = ({
  feature,
  children,
  fallback = null,
  loading = null,
  showLimitInfo = false,
}) => {
  const { permissions, isLoading } = usePermissions();
  const [limitInfo, setLimitInfo] = React.useState<any>(null);
  const [isCheckingLimits, setIsCheckingLimits] = React.useState(false);

  React.useEffect(() => {
    const checkLimits = async () => {
      if (!permissions) return;

      setIsCheckingLimits(true);
      try {
        const response = await fetch('/api/permissions/user/usage-stats/', {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setLimitInfo(data.usage_stats[feature] || null);
        }
      } catch (err) {
        console.error('Failed to check usage limits:', err);
      } finally {
        setIsCheckingLimits(false);
      }
    };

    if (permissions) {
      checkLimits();
    }
  }, [permissions, feature]);

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (isCheckingLimits && loading) {
    return <>{loading}</>;
  }

  // If we have limit info and user has exceeded limits
  if (limitInfo && limitInfo.limit_exceeded) {
    if (showLimitInfo) {
      return (
        <div className="permission-limit-exceeded">
          <div className="text-orange-600 text-sm">
            Daily limit reached ({limitInfo.daily_usage}/{limitInfo.daily_limit})
          </div>
          {fallback}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Permission Button - button that's enabled/disabled based on permissions
interface PermissionButtonProps {
  feature?: string;
  features?: string[];
  minimumPlan?: string;
  adminOnly?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  disabledTooltip?: string;
  trackUsage?: boolean;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  feature,
  features,
  minimumPlan,
  adminOnly = false,
  onClick,
  disabled = false,
  children,
  className = '',
  disabledTooltip = 'You do not have permission to perform this action',
  trackUsage = true,
}) => {
  const { permissions, hasAnyFeatureAccess } = usePermissions();
  const { hasMinimumPlan } = useSubscriptionAccess();
  const { useFeature } = useFeatureAccess(feature || '');

  const hasPermission = React.useMemo(() => {
    if (!permissions) return false;

    let hasAccess = true;

    if (feature) {
      hasAccess = hasAccess && (permissions.permissions[feature]?.has_access || false);
    }

    if (features && features.length > 0) {
      hasAccess = hasAccess && hasAnyFeatureAccess(features);
    }

    if (minimumPlan) {
      hasAccess = hasAccess && hasMinimumPlan(minimumPlan);
    }

    if (adminOnly) {
      hasAccess = hasAccess && permissions.has_admin_access;
    }

    return hasAccess;
  }, [permissions, feature, features, minimumPlan, adminOnly, hasAnyFeatureAccess, hasMinimumPlan]);

  const isDisabled = disabled || !hasPermission;

  const handleClick = () => {
    if (isDisabled) return;

    if (trackUsage && feature) {
      useFeature({
        component: 'PermissionButton',
        action: 'click',
      });
    }

    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isDisabled ? disabledTooltip : undefined}
    >
      {children}
    </button>
  );
};

export default {
  FeatureGate,
  MultiFeatureGate,
  SubscriptionGate,
  AdminGate,
  PermissionGate,
  UsageLimitGate,
  PermissionButton,
};
