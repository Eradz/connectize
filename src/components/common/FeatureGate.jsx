/**
 * Feature Gate Component
 * Conditionally renders children based on subscription feature access
 */
import React from 'react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight } from 'lucide-react';

/**
 * FeatureGate - Conditionally render content based on feature access
 * 
 * @param {Object} props
 * @param {string} props.feature - Single feature code to check
 * @param {string[]} props.features - Multiple feature codes (all required)
 * @param {string[]} props.anyFeatures - Multiple feature codes (any one required)
 * @param {string} props.minPlan - Minimum plan tier required
 * @param {React.ReactNode} props.children - Content to show if access granted
 * @param {React.ReactNode} props.fallback - Content to show if access denied (optional)
 * @param {boolean} props.showUpgradePrompt - Show upgrade prompt when access denied
 * @param {string} props.upgradeMessage - Custom upgrade message
 */
export const FeatureGate = ({
  feature,
  features,
  anyFeatures,
  minPlan,
  children,
  fallback = null,
  showUpgradePrompt = false,
  upgradeMessage,
}) => {
  const { hasFeature, hasAllFeatures, hasAnyFeature, hasMinPlan, loading, planType } = useFeatureAccess();

  // Check access based on props
  let hasAccess = true;

  if (feature) {
    hasAccess = hasAccess && hasFeature(feature);
  }

  if (features && features.length > 0) {
    hasAccess = hasAccess && hasAllFeatures(features);
  }

  if (anyFeatures && anyFeatures.length > 0) {
    hasAccess = hasAccess && hasAnyFeature(anyFeatures);
  }

  if (minPlan) {
    hasAccess = hasAccess && hasMinPlan(minPlan);
  }

  // While loading, show nothing or a skeleton
  if (loading) {
    return null;
  }

  // If access granted, show children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If access denied, show fallback or upgrade prompt
  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        message={upgradeMessage} 
        requiredFeature={feature}
        requiredPlan={minPlan}
        currentPlan={planType}
      />
    );
  }

  return fallback;
};

/**
 * Upgrade Prompt Component
 */
const UpgradePrompt = ({ message, requiredFeature, requiredPlan, currentPlan }) => {
  const defaultMessage = requiredPlan 
    ? `This feature requires a ${requiredPlan} plan or higher.`
    : `This feature is not available on your current plan.`;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
        <Lock className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Locked</h3>
      <p className="text-gray-600 mb-4">{message || defaultMessage}</p>
      <Link
        to="/subscriptions/management?tab=plans"
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        Upgrade Plan
        <ArrowUpRight className="ml-2 h-4 w-4" />
      </Link>
      {currentPlan && (
        <p className="mt-3 text-xs text-gray-500">
          Current plan: <span className="font-medium capitalize">{currentPlan}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Higher-Order Component to wrap a component with feature gating
 */
export const withFeatureGate = (WrappedComponent, options = {}) => {
  const {
    feature,
    features,
    anyFeatures,
    minPlan,
    fallback = null,
    showUpgradePrompt = true,
    upgradeMessage,
  } = options;

  return function FeatureGatedComponent(props) {
    return (
      <FeatureGate
        feature={feature}
        features={features}
        anyFeatures={anyFeatures}
        minPlan={minPlan}
        fallback={fallback}
        showUpgradePrompt={showUpgradePrompt}
        upgradeMessage={upgradeMessage}
      >
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
};

/**
 * Inline feature check component (renders nothing or children)
 * Useful for hiding individual buttons/elements
 */
export const FeatureCheck = ({ feature, minPlan, children }) => {
  const { hasFeature, hasMinPlan, loading } = useFeatureAccess();

  if (loading) return null;

  const hasAccess = feature ? hasFeature(feature) : minPlan ? hasMinPlan(minPlan) : true;

  return hasAccess ? <>{children}</> : null;
};

/**
 * Component that shows a disabled state with tooltip for locked features
 */
export const FeatureLocked = ({ feature, minPlan, children, tooltip }) => {
  const { hasFeature, hasMinPlan, loading } = useFeatureAccess();

  if (loading) return <>{children}</>;

  const hasAccess = feature ? hasFeature(feature) : minPlan ? hasMinPlan(minPlan) : true;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded cursor-not-allowed">
        <Lock className="h-4 w-4 text-gray-600" />
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default FeatureGate;
