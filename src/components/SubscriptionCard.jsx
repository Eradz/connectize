import React, { useState, useEffect } from 'react';
import subscriptionsApi from '../../api-services/subscriptions';
import { 
  CreditCard, TrendingUp, TrendingDown, Calendar, 
  CheckCircle, AlertTriangle, Star, Crown, Zap, 
  Briefcase, Building, BarChart, Users 
} from 'lucide-react';

const SubscriptionCard = ({ 
  currentSubscription, 
  onUpgrade, 
  onDowngrade, 
  onCancel,
  className = "" 
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (showPlans && plans.length === 0) {
      loadPlans();
    }
  }, [showPlans]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsApi.getPlans();
      setPlans(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'trial': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'starter': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'professional': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'enterprise': return <Building className="w-4 h-4 text-green-500" />;
      default: return <Crown className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'trialing': return 'text-yellow-700 bg-yellow-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      case 'past_due': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const daysLeft = () => {
    if (!currentSubscription?.current_period_end) return null;
    const end = new Date(currentSubscription.current_period_end);
    const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!currentSubscription) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">Choose a plan to get started with premium features.</p>
          <button
            onClick={() => setShowPlans(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Current Subscription Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPlanIcon(currentSubscription.plan?.plan_type)}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {currentSubscription.plan?.name}
              </h3>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSubscription.status)}`}>
                {currentSubscription.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentSubscription.plan?.currency} {Number(currentSubscription.plan?.price || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              per {currentSubscription.plan?.billing_cycle === 'yearly' ? 'year' : 'month'}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Next billing:</span>
            <div className="font-medium">
              {currentSubscription.next_payment_date 
                ? new Date(currentSubscription.next_payment_date).toLocaleDateString()
                : 'N/A'}
              {daysLeft() !== null && (
                <span className="text-gray-500 ml-1">({daysLeft()} days)</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Auto-renew:</span>
            <div className="font-medium">
              {currentSubscription.auto_renew ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {currentSubscription.cancel_at_period_end && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-700">
                Subscription will be cancelled on {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPlans(true)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Change Plan
          </button>
          {currentSubscription.status === 'cancelled' ? (
            <button
              onClick={() => onCancel?.(false)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Reactivate
            </button>
          ) : (
            <button
              onClick={() => onCancel?.(true)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                <button 
                  onClick={() => setShowPlans(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg animate-pulse">
                      <div className="h-6 w-1/2 bg-gray-100 rounded mb-4" />
                      <div className="h-8 w-1/3 bg-gray-100 rounded mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-3/4 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => {
                    const isCurrent = currentSubscription?.plan?.id === plan.id;
                    const isUpgrade = currentSubscription && parseFloat(plan.price) > parseFloat(currentSubscription.plan?.price || 0);
                    const isDowngrade = currentSubscription && parseFloat(plan.price) < parseFloat(currentSubscription.plan?.price || 0);
                    
                    return (
                      <div key={plan.id} className={`relative p-6 border-2 rounded-xl transition-all ${
                        isCurrent ? 'border-blue-500 bg-blue-50' : 
                        plan.plan_type === 'professional' ? 'border-purple-200 hover:border-purple-300' :
                        'border-gray-200 hover:border-gray-300'
                      }`}>
                        {plan.plan_type === 'professional' && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className="flex justify-center mb-3">
                            {getPlanIcon(plan.plan_type)}
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                          
                          <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-900">
                              {plan.currency} {Number(plan.price || 0).toFixed(0)}
                            </span>
                            <span className="text-gray-500">
                              /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                            </span>
                          </div>
                          
                          {/* Key features */}
                          <div className="space-y-2 text-sm text-left mb-6">
                            <div className="flex items-center text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {plan.max_posts_per_month === -1 ? 'Unlimited' : plan.max_posts_per_month} posts/month
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {plan.max_storage_gb === -1 ? 'Unlimited' : plan.max_storage_gb + 'GB'} storage
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members} team members
                            </div>
                            {plan.ai_insights_enabled && (
                              <div className="flex items-center text-gray-600">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                AI Insights
                              </div>
                            )}
                          </div>
                          
                          <button
                            disabled={isCurrent}
                            onClick={() => {
                              if (isUpgrade) {
                                onUpgrade?.(plan);
                              } else if (isDowngrade) {
                                onDowngrade?.(plan);
                              }
                              setShowPlans(false);
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              isCurrent 
                                ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                                : isUpgrade
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : isDowngrade
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-blue-600 text-white hover:bg-custom_yellow'
                            }`}
                          >
                            {isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Select Plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
