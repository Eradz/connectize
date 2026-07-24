import React, { useState, useEffect } from 'react';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import {
  Crown,
  Star,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Zap,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  Loader2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { stripePromise } from '@/lib/stripeUtils';
import subscriptionsApi from '@/api-services/subscriptions';

// Payment Form Component for Plan Selection
const PlanPaymentForm = ({ plan, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [useExistingPayment, setUseExistingPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    // Load existing payment methods
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data } = await subscriptionsApi.getPaymentMethods();
      setPaymentMethods(data.payment_methods || []);
      if (data.payment_methods?.length > 0) {
        setSelectedPaymentMethod(data.payment_methods[0].id);
        setUseExistingPayment(true);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || (!elements && !useExistingPayment)) {
      return;
    }

    setLoading(true);

    try {
      let paymentMethodId = selectedPaymentMethod;

      // If using new payment method, create it first
      if (!useExistingPayment) {
        if (!cardholderName.trim()) {
          onError('Please enter cardholder name');
          return;
        }

        const cardElement = elements.getElement(CardElement);
        
        // Create setup intent for new payment method
        const { data: setupIntentData } = await subscriptionsApi.createSetupIntent();
        
        // Confirm setup intent
        const { error, setupIntent } = await stripe.confirmCardSetup(
          setupIntentData.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: cardholderName,
              },
            }
          }
        );

        if (error) {
          onError(error.message);
          return;
        }

        paymentMethodId = setupIntent.payment_method;
      }

      // Create subscription with payment method
      const subscriptionData = {
        plan_id: plan.id,
        payment_method_id: paymentMethodId,
        trial_days: plan.trial_period_days || 0
      };

      const { data } = await subscriptionsApi.createSubscriptionPayment(subscriptionData);
      onSuccess(data);

    } catch (error) {
      console.error('Error creating subscription:', error);
      onError(error.response?.data?.error || error.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">{plan.name}</h4>
        <p className="text-blue-700">
          ${plan.price}/{plan.billing_cycle} • {plan.currency}
        </p>
        {plan.trial_period_days > 0 && (
          <p className="text-sm text-blue-600 mt-1">
            Includes {plan.trial_period_days} day free trial
          </p>
        )}
      </div>

      {/* Payment Method Selection */}
      {paymentMethods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-existing"
              checked={useExistingPayment}
              onCheckedChange={setUseExistingPayment}
            />
            <Label htmlFor="use-existing">Use existing payment method</Label>
          </div>

          {useExistingPayment && (
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-gray-600">
                          {method.brand.toUpperCase()} • Expires {method.exp_month}/{method.exp_year}
                        </p>
                      </div>
                    </div>
                    {method.is_default && (
                      <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Payment Method Form */}
      {(!useExistingPayment || paymentMethods.length === 0) && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label>Card Information</Label>
            <div className="p-3 border border-gray-300 rounded-md bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit"
          disabled={
            loading || 
            (!useExistingPayment && (!stripe || !cardholderName.trim())) ||
            (useExistingPayment && !selectedPaymentMethod)
          }
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Subscribe to {plan.name}
            </>
          )}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Plan Card Component
const PlanCard = ({ plan, currentPlan, onSelectPlan, isPopular = false }) => {
  const isCurrentPlan = currentPlan?.plan?.id === plan.id;
  const isUpgrade = currentPlan && plan.price > currentPlan.plan.price;
  const isDowngrade = currentPlan && plan.price < currentPlan.plan.price;

  // Enhanced feature processing to handle different data structures
  const getFeatures = () => {
    if (Array.isArray(plan.features)) {
      return plan.features;
    }
    
    if (plan.features && typeof plan.features === 'object') {
      // Handle nested features object
      const featureList = [];
      Object.entries(plan.features).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          featureList.push(...value);
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              featureList.push(subValue);
            } else if (Array.isArray(subValue)) {
              featureList.push(...subValue);
            }
          });
        } else if (typeof value === 'string') {
          featureList.push(value);
        }
      });
      return featureList;
    }

    // Fallback to plan properties for features
    const fallbackFeatures = [];
    if (plan.max_posts_per_month > 0) fallbackFeatures.push(`${plan.max_posts_per_month} posts per month`);
    if (plan.max_storage_gb > 0) fallbackFeatures.push(`${plan.max_storage_gb}GB storage`);
    if (plan.max_team_members > 0) fallbackFeatures.push(`${plan.max_team_members} team members`);
    if (plan.analytics_enabled) fallbackFeatures.push('Advanced analytics');
    if (plan.ai_insights_enabled) fallbackFeatures.push('AI insights');
    if (plan.priority_support) fallbackFeatures.push('Priority support');

    return fallbackFeatures.length > 0 ? fallbackFeatures : ['Basic features included'];
  };

  const features = getFeatures();

  return (
    <Card className={`relative h-full ${isPopular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gold text-dark px-4 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-4 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}

      <CardContent className="p-6 h-full flex flex-col">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-gray-600">/{plan.billing_cycle}</span>
          </div>
          {plan.tagline && (
            <p className="text-sm text-gray-600">{plan.tagline}</p>
          )}
        </div>

        <div className="flex-1 mb-6">
          <h4 className="font-semibold mb-3">Features included:</h4>
          <ul className="space-y-2">
            {features.slice(0, 6).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
            {features.length > 6 && (
              <li className="text-sm text-gray-500 font-medium">
                +{features.length - 6} more features
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          {plan.trial_period_days > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                {plan.trial_period_days} day free trial
              </p>
            </div>
          )}

          {isCurrentPlan ? (
            <Button disabled className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Current Plan
            </Button>
          ) : (
            <Button 
              onClick={() => onSelectPlan(plan)}
              className={`w-full ${isUpgrade ? 'bg-gold hover:bg-custom_yellow' : ''}`}
              variant={isDowngrade ? 'outline' : 'default'}
            >
              {isUpgrade && <ArrowRight className="h-4 w-4 mr-2" />}
              {isDowngrade && <ArrowRight className="h-4 w-4 mr-2 rotate-180" />}
              {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Choose Plan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Plan Selector Component
const PlanSelector = ({ currentSubscription, onPlanSelected }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await subscriptionsApi.getPlans();
      // Handle paginated response format: { count, next, previous, results }
      const plansArray = data?.results || data || [];
      setPlans(Array.isArray(plansArray) ? plansArray : []);
    } catch (error) {
      console.error('Error loading plans:', error);
      setError('Failed to load subscription plans');
      setPlans([]); // Ensure plans is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
    setError('');
  };

  const handlePaymentSuccess = (subscriptionData) => {
    setShowPaymentDialog(false);
    setSuccess(`Successfully subscribed to ${selectedPlan.name}!`);
    if (onPlanSelected) onPlanSelected(subscriptionData);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your business needs</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading subscription plans...</span>
        </div>
      ) : Array.isArray(plans) && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentSubscription}
              onSelectPlan={handleSelectPlan}
              isPopular={plan.popular || index === 1} // Mark second plan as popular by default
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans available</h3>
          <p className="text-gray-500">Please check back later or contact support.</p>
        </div>
      )}

      {/* Payment Dialog */}
      {selectedPlan && (
        <Elements stripe={stripePromise}>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subscribe to {selectedPlan.name}</DialogTitle>
              </DialogHeader>
              
              <PlanPaymentForm
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => setShowPaymentDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </Elements>
      )}
    </div>
  );
};

export default PlanSelector;
