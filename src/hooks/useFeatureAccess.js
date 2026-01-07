/**
 * Feature Access Hook
 * Provides easy access to check if the user's subscription plan includes specific features
 */
import { useCallback, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';

/**
 * Hook to check feature access based on subscription plan
 * @returns {Object} Feature access utilities
 */
export const useFeatureAccess = () => {
  const { currentSubscription, features, enhancedFeatures, loading } = useSubscription();

  /**
   * Get all features available to the current user
   */
  const availableFeatures = useMemo(() => {
    const featureList = [];
    
    // From features (by category)
    if (features && typeof features === 'object') {
      Object.values(features).forEach(categoryFeatures => {
        if (Array.isArray(categoryFeatures)) {
          categoryFeatures.forEach(f => {
            featureList.push({
              code: f.feature_code || f.code,
              name: f.feature_name || f.name,
              category: f.feature_category || f.category,
            });
          });
        }
      });
    }

    // From enhanced features
    if (enhancedFeatures?.features && typeof enhancedFeatures.features === 'object') {
      Object.values(enhancedFeatures.features).forEach(categoryFeatures => {
        if (Array.isArray(categoryFeatures)) {
          categoryFeatures.forEach(f => {
            if (!featureList.some(ef => ef.code === (f.feature_code || f.code))) {
              featureList.push({
                code: f.feature_code || f.code,
                name: f.feature_name || f.name,
                category: f.feature_category || f.category,
              });
            }
          });
        }
      });
    }

    return featureList;
  }, [features, enhancedFeatures]);

  /**
   * Check if user has access to a specific feature by code
   * @param {string} featureCode - The feature code to check
   * @returns {boolean} Whether the user has access
   */
  const hasFeature = useCallback((featureCode) => {
    if (!featureCode) return false;
    if (loading) return false; // Don't grant access while loading
    
    const normalizedCode = featureCode.toLowerCase();
    
    // Check in available features list
    return availableFeatures.some(f => 
      f.code?.toLowerCase() === normalizedCode ||
      f.name?.toLowerCase().replace(/\s+/g, '_') === normalizedCode
    );
  }, [availableFeatures, loading]);

  /**
   * Check if user has access to multiple features (ALL must be present)
   * @param {string[]} featureCodes - Array of feature codes
   * @returns {boolean} Whether the user has access to all features
   */
  const hasAllFeatures = useCallback((featureCodes) => {
    if (!Array.isArray(featureCodes) || featureCodes.length === 0) return true;
    return featureCodes.every(code => hasFeature(code));
  }, [hasFeature]);

  /**
   * Check if user has access to any of the features (at least one)
   * @param {string[]} featureCodes - Array of feature codes
   * @returns {boolean} Whether the user has access to at least one feature
   */
  const hasAnyFeature = useCallback((featureCodes) => {
    if (!Array.isArray(featureCodes) || featureCodes.length === 0) return false;
    return featureCodes.some(code => hasFeature(code));
  }, [hasFeature]);

  /**
   * Get the current plan type
   */
  const planType = useMemo(() => {
    return currentSubscription?.plan?.plan_type || 'free';
  }, [currentSubscription]);

  /**
   * Check if user has at least a specific plan tier
   */
  const hasMinPlan = useCallback((minPlan) => {
    const planHierarchy = {
      'free': 0, 'trial': 0, 'starter': 1, 'basic': 1,
      'professional': 2, 'pro': 2, 'business': 3,
      'enterprise': 4, 'custom': 5
    };
    
    const currentLevel = planHierarchy[planType.toLowerCase()] ?? 0;
    const requiredLevel = planHierarchy[minPlan.toLowerCase()] ?? 0;
    
    return currentLevel >= requiredLevel;
  }, [planType]);

  /**
   * Check if subscription is active
   */
  const isSubscriptionActive = useMemo(() => {
    return currentSubscription?.status === 'active' || 
           currentSubscription?.status === 'trialing';
  }, [currentSubscription]);

  return {
    // State
    loading,
    planType,
    isSubscriptionActive,
    availableFeatures,
    
    // Methods
    hasFeature,
    hasAllFeatures,
    hasAnyFeature,
    hasMinPlan,
  };
};

/**
 * Simple hook to check a single feature
 * @param {string} featureCode - The feature code to check
 * @returns {boolean} Whether the user has access
 */
export const useHasFeature = (featureCode) => {
  const { hasFeature, loading } = useFeatureAccess();
  return { hasAccess: hasFeature(featureCode), loading };
};

/**
 * Hook to check minimum plan requirement
 * @param {string} minPlan - The minimum plan required
 * @returns {boolean} Whether the user meets the requirement
 */
export const useHasMinPlan = (minPlan) => {
  const { hasMinPlan, loading } = useFeatureAccess();
  return { hasAccess: hasMinPlan(minPlan), loading };
};

export default useFeatureAccess;
