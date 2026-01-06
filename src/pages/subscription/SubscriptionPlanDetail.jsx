import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp,
  AlertCircle,
  Check
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { makeApiRequest } from '../../lib/helpers';
import { useSubscription } from '../../context/SubscriptionContext';

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
    default: "bg-blue-600 text-white hover:bg-blue-700",
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
  const { isCurrentUserPlan, currentSubscription } = useSubscription();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen bg-gray-50 p-6">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-700 mb-2 font-medium">
                      {planData.plan_type?.charAt(0).toUpperCase() + planData.plan_type?.slice(1) || 'Professional'}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 border-b-4 border-red-500 pb-1">
                        ${planData.price || '99.99'}
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
                {isCurrentPlan() ? (
                  <button 
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center text-sm opacity-75 cursor-not-allowed" 
                    disabled
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Current Plan
                  </button>
                ) : (
                  <button 
                    className="w-full text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-sm shadow-sm hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #FFC000, #FF8400)' }}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Upgrade to This Plan
                  </button>
                )}
                
                <button 
                  onClick={() => navigate(webRoutes.subscriptions)}
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
    </div>
  );
};

export default SubscriptionPlanDetail;