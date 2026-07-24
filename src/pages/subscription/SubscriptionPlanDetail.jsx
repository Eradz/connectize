import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { makeApiRequest } from '../../lib/helpers';
import { useSubscription } from '../../context/SubscriptionContext';
import subscriptionsApi from '../../api-services/subscriptions';

// Card components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, className = "", variant = "default", disabled = false, onClick, ...props }) => {
  const variants = {
    default: "bg-gold text-dark hover:bg-custom_yellow",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  };
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const SubscriptionPlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { isCurrentUserPlan, currentSubscription, refreshSubscription } = useSubscription();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Plan hierarchy for determining upgrade vs downgrade
  const planHierarchy = {
    'trial': 0, 'free': 0, 'starter': 1, 'basic': 1, 
    'professional': 2, 'pro': 2, 'business': 3, 
    'enterprise': 4, 'custom': 5
  };

  // Determine if this is an upgrade or downgrade
  const isUpgrade = () => {
    if (!currentSubscription?.plan?.plan_type || !planData?.plan_type) return true; // Default to upgrade
    const currentTier = planHierarchy[currentSubscription.plan.plan_type.toLowerCase()] ?? 0;
    const newTier = planHierarchy[planData.plan_type.toLowerCase()] ?? 0;
    return newTier > currentTier;
  };

  const isDowngrade = () => {
    if (!currentSubscription?.plan?.plan_type || !planData?.plan_type) return false;
    const currentTier = planHierarchy[currentSubscription.plan.plan_type.toLowerCase()] ?? 0;
    const newTier = planHierarchy[planData.plan_type.toLowerCase()] ?? 0;
    return newTier < currentTier;
  };

  // Calculate price difference for upgrade
  const getPriceDifference = () => {
    if (!currentSubscription?.plan?.price || !planData?.price) return null;
    const currentPrice = parseFloat(currentSubscription.plan.price) || 0;
    const newPrice = parseFloat(planData.price) || 0;
    return (newPrice - currentPrice).toFixed(2);
  };

  const handlePlanChangeClick = () => {
    if (!planData) return;
    
    if (!currentSubscription) {
      // No subscription - redirect to start subscription flow
      navigate(webRoutes.subscriptions);
      return;
    }
    
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmPlanChange = async () => {
    setShowConfirmModal(false);

    try {
      setUpgrading(true);
      setUpgradeError(null);

      // Use different API based on upgrade vs downgrade
      let result;
      if (isUpgrade()) {
        result = await subscriptionsApi.upgradeSubscription(currentSubscription.id, planData.id);
      } else {
        result = await subscriptionsApi.downgradeSubscription(currentSubscription.id, planData.id);
      }
      
      setUpgradeSuccess(true);
      
      // Refresh subscription context
      if (refreshSubscription) {
        await refreshSubscription();
      }

      // Show success briefly then redirect
      setTimeout(() => {
        navigate(webRoutes.subscriptionManagement);
      }, 2000);

    } catch (err) {
      console.error('Plan change error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to change subscription';
      setUpgradeError(errorMessage);
      
      // If it's a payment method issue, suggest adding one
      if (errorMessage.toLowerCase().includes('payment') || errorMessage.toLowerCase().includes('card')) {
        setUpgradeError(`${errorMessage}. Please add a payment method first.`);
      }
    } finally {
      setUpgrading(false);
    }
  };

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get plan-specific features using the enhanced plans API
      const result = await makeApiRequest({
        url: `api/permissions/api/v2/enhanced-plans/${planId}/`,
        method: 'GET'
      });

      // Validate that we have features
      if (!result?.features || Object.keys(result.features).length === 0) {
        throw new Error('No features found for this plan');
      }

      console.log("API Result:", result);
      setPlanData(result);

    } catch (error) {
      console.error('❌ Failed to load plan details:', error);
      setError(error.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    }
  }, [planId]);

  // Check if this plan is the current subscription using context method
  const isCurrentPlan = () => {
    if (!planData) return false;
    return isCurrentUserPlan(planData);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !planData) {
    return (
      <div className="min-h-screen  p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {error ? 'Error loading plan details' : 'Plan not found'}
                </span>
              </div>
              <p className="text-red-600 mt-2">
                {error || `Plan with ID ${planId} could not be found.`}
              </p>
              <div className="flex space-x-4 mt-4">
                <Button 
                  onClick={() => navigate(webRoutes.subscriptions)} 
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
                <Button onClick={loadPlanDetails}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate totals
  const featuresArray = Object.values(planData.features || {}).flat();
  const totalFeatures = featuresArray.length;
  const totalCategories = Object.keys(planData.features || {}).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => navigate(webRoutes.subscriptions)}
              className="flex items-center justify-center h-12 w-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-gray-900">
                  {planData.name || 'Subscription Plan'}
                </h1>
                {isCurrentPlan() && (
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-lg ml-16">
            {planData.description || `${planData.plan_type || 'Professional'} subscription plan`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 justify-between">
                  <div>
                    <div className="text-sm text-gray-700 mb-2 font-medium">
                      {planData.plan_type?.charAt(0).toUpperCase() + planData.plan_type?.slice(1) || 'Unavailable'}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 border-b-4 border-red-500 pb-1">
                        ${planData.price || 'Unavailable'}
                      </span>
                      <span className="text-gray-600 ml-2 text-lg">
                        / {planData.billing_cycle || 'month'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Features Included: {totalFeatures}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Categories: {totalCategories}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Capabilities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Features & Capabilities
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(planData.features || {}).map(([categoryName, features], index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <h3 className="capitalize font-semibold text-gray-900 text-base">
                          {categoryName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {features.length} Feature{features.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <ul className="space-y-2.5">
                        {features.map((feature, featureIndex) => (
                          <li key={feature.id || featureIndex} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              • {feature.feature_name}
                            </span>
                            <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Subscription Details */}
            <Card className={isCurrentPlan() ? 'border-2 border-green-500' : ''}>
              <CardHeader className="pb-3 relative">
                {isCurrentPlan() && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-base pr-24">Subscription Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {planData.tagline || planData.description || 'Perfect for businesses getting started'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-0">
                {upgradeSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Successfully upgraded! Redirecting...
                  </div>
                )}
                
                {upgradeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{upgradeError}</span>
                    </div>
                    {upgradeError.toLowerCase().includes('payment') && (
                      <button
                        onClick={() => navigate(webRoutes.subscriptionManagement + '?tab=payment')}
                        className="mt-2 text-xs text-red-700 underline hover:text-red-800"
                      >
                        Add Payment Method →
                      </button>
                    )}
                  </div>
                )}

                {isCurrentPlan() ? (
                  <button 
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center text-sm opacity-75 cursor-not-allowed" 
                    disabled
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Current Plan
                  </button>
                ) : isUpgrade() ? (
                  <button 
                    onClick={handlePlanChangeClick}
                    disabled={upgrading || upgradeSuccess}
                    className="flex w-full items-center justify-center rounded-lg bg-gold py-3 text-sm font-medium text-dark transition-colors hover:bg-custom_yellow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Upgrade to This Plan
                      </>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={handlePlanChangeClick}
                    disabled={upgrading || upgradeSuccess}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-sm shadow-sm hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Switch to This Plan
                      </>
                    )}
                  </button>
                )}
                
                {/* Show price info */}
                {!isCurrentPlan() && currentSubscription && getPriceDifference() && (
                  <p className="text-xs text-center text-gray-500">
                    {parseFloat(getPriceDifference()) > 0 
                      ? `+$${getPriceDifference()}/${planData.billing_cycle || 'month'} from your current plan`
                      : `Save $${Math.abs(parseFloat(getPriceDifference()))}/${planData.billing_cycle || 'month'}`
                    }
                  </p>
                )}
                
                <button 
                  onClick={() => navigate(webRoutes.subscriptionManagement + `?tab=plans`)}
                  className="w-full border-2 border-orange-200 bg-orange-50 text-orange-600 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-orange-100 transition-colors text-sm"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Compare Plans
                </button>
              </CardContent>
            </Card>

            {/* Why Choose This Plan */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-900 text-base">Why Choose This Plan?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {planData.tagline || 'Perfect for businesses getting started'}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Access to {totalFeatures} powerful features
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Coverage across {totalCategories} feature categories
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • 24/7 customer support
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  <li className="flex items-start justify-between">
                    <span className="text-sm text-gray-700">
                      • Regular feature updates
                    </span>
                    <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                  </li>
                  {planData.plan_type !== 'trial' && (
                    <li className="flex items-start justify-between">
                      <span className="text-sm text-gray-700">
                        • Priority technical assistance
                      </span>
                      <Check className="h-4 w-4 text-gray-900 flex-shrink-0 ml-2" />
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Plan Change Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isUpgrade() ? 'bg-orange-100' : 'bg-gray-100'}`}>
                {isUpgrade() ? (
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                ) : (
                  <ArrowLeft className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isUpgrade() ? 'Confirm Upgrade' : 'Confirm Plan Change'}
              </h3>
              <p className="text-gray-600 mt-2">
                You're {isUpgrade() ? 'upgrading' : 'switching'} to <span className="font-semibold">{planData.name}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-medium">{currentSubscription?.plan?.name || 'None'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Plan:</span>
                <span className="font-medium">{planData.name}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-medium">${currentSubscription?.plan?.price || '0'}/{currentSubscription?.plan?.billing_cycle || 'month'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Price:</span>
                <span className={`font-semibold ${isUpgrade() ? 'text-orange-600' : 'text-green-600'}`}>${planData.price}/{planData.billing_cycle || 'month'}</span>
              </div>
              {isUpgrade() && getPriceDifference() && parseFloat(getPriceDifference()) > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount to charge now:</span>
                    <span className="font-bold text-green-600">${getPriceDifference()}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Prorated amount for the remainder of your billing period
                  </p>
                </>
              )}
              {isDowngrade() && getPriceDifference() && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">You'll save:</span>
                    <span className="font-bold text-green-600">${Math.abs(parseFloat(getPriceDifference()))}/{planData.billing_cycle || 'month'}</span>
                  </div>
                </>
              )}
            </div>

            <div className={`border rounded-lg p-3 ${isUpgrade() ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-xs ${isUpgrade() ? 'text-blue-700' : 'text-yellow-700'}`}>
                {isUpgrade() ? (
                  <>
                    <strong>Note:</strong> Your default payment method will be charged. 
                    The upgrade takes effect immediately and you'll have access to all {planData.name} features right away.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> The plan change takes effect at the end of your current billing period. 
                    You'll continue to have access to your current features until then.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlanChange}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-colors ${isUpgrade() ? 'bg-gold text-dark hover:bg-custom_yellow' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
              >
                {isUpgrade() ? 'Confirm & Pay' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlanDetail;
