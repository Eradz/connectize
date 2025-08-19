import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlag } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { CrownIcon, StarIcon, TrendingUpIcon, ZapIcon } from '../ui/ModernIcon';
import subscriptionsApi from '../../api-services/subscriptions';

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const hasSubscriptions = useFeatureFlag('subscriptions');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    if (hasSubscriptions) {
      fetchPlans();
    }
  }, [hasSubscriptions]);

  const fetchPlans = async () => {
    try {
      const { data } = await subscriptionsApi.getPlans();
      const norm = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price || 0),
        billing_cycle: p.billing_cycle,
        features: [
          `${p.max_posts_per_month ?? 0} Posts per month`,
          `${p.max_products_per_month ?? 0} Products per month`,
          `${p.max_services_per_month ?? 0} Services per month`,
          `${p.max_storage_gb ?? 0}GB Storage`,
          p.priority_support ? 'Priority Support' : 'Basic Support',
          p.analytics_enabled ? 'Analytics' : 'No Analytics',
          p.api_access_enabled ? 'API Access' : 'No API Access',
          p.custom_branding ? 'Custom Branding' : 'No Custom Branding',
        ],
        limitations: [
          ...(p.analytics_enabled ? [] : ['No Analytics']),
          ...(p.api_access_enabled ? [] : ['No API Access']),
          ...(p.custom_branding ? [] : ['No Custom Branding']),
        ],
        popular: p.plan_type === 'standard',
      }));
      setPlans(norm);
      setSelectedPlan(user?.subscription?.plan_type || norm[0]?.id || '');
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId) => {
    if (planId === selectedPlan) return;
    
    try {
      // TODO: Initiate real subscription flow here (payment/checkout)
      // For now, avoid mock changes. Just navigate or open checkout if available.
      console.log(`Select plan ${planId}. Implement payment/checkout flow.`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  if (!hasSubscriptions) {
    return null; // Feature not enabled
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock powerful features to grow your business in the oil & gas industry
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = selectedPlan === plan.id;
          const isPremium = plan.id === 'premium';
          const isPopular = plan.popular;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                isCurrentPlan
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : isPopular
                  ? 'border-yellow-400'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Premium Badge */}
              {isPremium && (
                <div className="absolute top-4 right-4">
                  <CrownIcon className="h-6 w-6 text-yellow-500" />
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">/{plan.billing_cycle}</span>
                  </div>
                  {isCurrentPlan && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Current Plan
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ZapIcon className="h-5 w-5 mr-2 text-green-500" />
                    Features Included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Limitations
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start text-gray-500 text-sm">
                          <div className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0">
                            <div className="w-full h-full rounded-full border border-gray-300"></div>
                          </div>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="text-center">
          {isCurrentPlan ? (
                    <div className="text-gray-600 font-medium">
                      Your Current Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => handlePlanSelect(plan.id)}
                      variant={isPopular ? 'primary' : 'minimal'}
                      className="w-full"
                    >
            {selectedPlan ? 'Switch Plan' : 'Choose Plan'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Feature Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Posts per Month', values: ['5', '50', 'Unlimited'] },
                { name: 'Featured Ads', values: ['✗', '✓', '✓'] },
                { name: 'AI Matchmaking', values: ['✗', 'Basic', 'Advanced'] },
                { name: 'Deal Rooms', values: ['✗', '✓', '✓'] },
                { name: 'Analytics', values: ['Basic', 'Standard', 'Advanced'] },
                { name: 'API Access', values: ['✗', '✗', '✓'] },
                { name: 'Custom Branding', values: ['✗', '✗', '✓'] },
              ].map((feature, index) => (
                <tr key={index}>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    {feature.name}
                  </td>
                  {feature.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="py-4 px-4 text-center">
                      {value === '✓' ? (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      ) : value === '✗' ? (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                      ) : (
                        <span className="text-gray-700">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Need a custom plan for your enterprise?
        </p>
        <Button variant="minimal">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
