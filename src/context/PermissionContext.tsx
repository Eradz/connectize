import React, { createContext, useContext, useEffect, useState } from 'react';
import { permissionApi, authApi, apiUtils } from '../lib/api';

interface Permission {
  feature_code: string;
  feature_name: string;
  description: string;
  access_level: string;
  has_access: boolean;
}

interface UserPermissions {
  user_id: string;
  permissions: Record<string, Permission>;
  has_admin_access: boolean;
  subscription_plan: {
    plan_type: string;
    plan_name: string;
    expires_at: string | null;
  } | null;
  company_id: string | null;
}

interface PermissionContextType {
  permissions: UserPermissions | null;
  isLoading: boolean;
  error: string | null;
  hasFeatureAccess: (featureCode: string) => boolean;
  hasAnyFeatureAccess: (featureCodes: string[]) => boolean;
  checkFeatureAccess: (featureCode: string) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
  trackFeatureUsage: (featureCode: string, metadata?: any) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await permissionApi.getUserPermissions();
      
      if (apiUtils.isSuccess(response)) {
        setPermissions(response.data);
      } else {
        throw new Error(apiUtils.getErrorMessage(response));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeatureAccess = (featureCode: string): boolean => {
    if (!permissions) return false;
    return permissions.permissions[featureCode]?.has_access || false;
  };

  const hasAnyFeatureAccess = (featureCodes: string[]): boolean => {
    if (!permissions) return false;
    return featureCodes.some(code => hasFeatureAccess(code));
  };

  const checkFeatureAccess = async (featureCode: string): Promise<boolean> => {
    try {
      const response = await permissionApi.checkFeatureAccess(featureCode);

      if (apiUtils.isSuccess(response)) {
        return response.data.has_access;
      } else {
        console.error('Failed to check feature access:', apiUtils.getErrorMessage(response));
        return false;
      }
    } catch (err) {
      console.error('Error checking feature access:', err);
      return false;
    }
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  const trackFeatureUsage = async (featureCode: string, metadata: any = {}) => {
    try {
      const response = await permissionApi.getUserFeatureUsage();
      // Note: This is a placeholder - you might want to implement 
      // a specific endpoint for tracking usage
      console.log('Feature usage tracked:', featureCode, metadata);
    } catch (err) {
      // Silently fail for usage tracking to not disrupt user experience
      console.warn('Failed to track feature usage:', err);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const contextValue: PermissionContextType = {
    permissions,
    isLoading,
    error,
    hasFeatureAccess,
    hasAnyFeatureAccess,
    checkFeatureAccess,
    refreshPermissions,
    trackFeatureUsage,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook for component-level permission checking
export const useFeatureAccess = (featureCode: string) => {
  const { hasFeatureAccess, checkFeatureAccess, trackFeatureUsage } = usePermissions();
  const [isChecking, setIsChecking] = useState(false);

  const hasAccess = hasFeatureAccess(featureCode);

  const checkAccess = async () => {
    setIsChecking(true);
    try {
      const result = await checkFeatureAccess(featureCode);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  const useFeature = (metadata?: any) => {
    if (hasAccess) {
      trackFeatureUsage(featureCode, metadata);
    }
  };

  return {
    hasAccess,
    checkAccess,
    useFeature,
    isChecking,
  };
};

// Hook for subscription-based features
export const useSubscriptionAccess = () => {
  const { permissions } = usePermissions();

  const hasSubscription = permissions?.subscription_plan !== null;
  const subscriptionPlan = permissions?.subscription_plan?.plan_type || 'none';
  const isSubscriptionActive = permissions?.subscription_plan !== null;

  const hasMinimumPlan = (minimumPlan: string): boolean => {
    if (!hasSubscription) return false;

    const planHierarchy = {
      'free': 0,
      'basic': 1,
      'pro': 2,
      'business': 3,
      'enterprise': 4,
    };

    const currentLevel = planHierarchy[subscriptionPlan as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[minimumPlan as keyof typeof planHierarchy] || 1;

    return currentLevel >= requiredLevel;
  };

  return {
    hasSubscription,
    subscriptionPlan,
    isSubscriptionActive,
    hasMinimumPlan,
    expiresAt: permissions?.subscription_plan?.expires_at,
  };
};

export default PermissionContext;
