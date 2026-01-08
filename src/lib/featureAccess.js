/**
 * Feature Access Exports
 * Central export point for all feature access utilities
 */

// Hook for checking feature access
export { 
  useFeatureAccess, 
  useHasFeature, 
  useHasMinPlan,
  default as useFeatureAccessDefault 
} from '../hooks/useFeatureAccess';

// Components for conditional rendering
export {
  FeatureGate,
  FeatureCheck,
  FeatureLocked,
  withFeatureGate,
  default as FeatureGateDefault
} from '../components/common/FeatureGate';
