import React, { useState, useEffect } from 'react';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '../..//components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert, { AlertDescription } from '../../components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  DollarSign,
  Loader2
} from 'lucide-react';
import { stripePromise } from '../../lib/stripeUtils';
import subscriptionsApi from '../../api-services/subscriptions';

// Stripe Elements configuration for development
const elementsOptions = {
  // Development-friendly options
  ...(import.meta.env.DEV && {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto'
      }
    ]
  })
};

// Stripe Card Form Component
export const CardForm = ({ onSuccess, onError, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !cardholderName.trim()) {
      return;
    }

    setLoading(true);

    try {
      // Create setup intent
      console.log('Creating setup intent...');
      const { data: setupIntentData } = await subscriptionsApi.createSetupIntent();
      console.log('Setup intent created:', setupIntentData);
      
      // Expect only real Stripe setup intent data now (no mock branch)
      if (!setupIntentData.client_secret) {
        throw new Error('Setup intent did not return a client_secret');
      }
      
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        console.error('Stripe CardNumberElement not mounted (CSP or mounting issue)');
        onError('Payment field failed to load. If content blockers are enabled, disable them and refresh.');
        setLoading(false);
        return;
      }

      // Confirm setup intent with proper error handling
      console.log('Confirming setup intent with client secret:', setupIntentData.client_secret);
      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupIntentData.client_secret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardholderName,
            },
          }
        }
      );

      if (error) {
        console.error('SetupIntent confirmation error:', error);
        
        // Handle specific error types
        if (error.type === 'authentication_required') {
          onError('Your card requires authentication. Please try again with a different card or contact your bank.');
        } else if (error.type === 'card_error') {
          onError(`Card error: ${error.message}`);
        } else if (error.code === 'setup_intent_authentication_failure') {
          onError('Card authentication failed. Please try again or use a different payment method.');
        } else {
          onError(error.message || 'Failed to add payment method');
        }
        return;
      }

      // Check setup intent status
      if (setupIntent.status !== 'succeeded') {
        console.error('SetupIntent status:', setupIntent.status);
        onError('Payment method setup was not completed. Please try again.');
        return;
      }

      console.log('Setup intent succeeded:', setupIntent);

      // Add payment method via API
      const { data } = await subscriptionsApi.addPaymentMethod({
        payment_method_id: setupIntent.payment_method,
        set_as_default: true
      });

      onSuccess(data);
    } catch (error) {
      console.error('Error adding payment method:', error);
      onError(error.response?.data?.error || error.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name on Card and Expiry Date */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name on your Card
          </label>
          <input
            type="text"
            placeholder="Barry White"
            value={cardholderName}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onChange={(e) => setCardholderName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Number and CVV */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardNumberElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardCvcElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Button 
          type="submit"
          disabled={!stripe || loading || !cardholderName.trim()}
          className="w-full ml-auto bg-gradient-to-br from-[#FFC000] to-[#FF8400] hover:bg-gold hover: to-[#FFC000]  hover:from-[#FF8400] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Card'
          )}
        </Button>
      </div>
    </form>
  );
};

const PaymentMethodManager = ({ subscription, onUpdate }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load payment methods on component mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await subscriptionsApi.getPaymentMethods();
      console.log('Payment methods API response:', response);
      
      // Handle different response structures
      if (response?.data?.payment_methods) {
        setPaymentMethods(response.data.payment_methods);
      } else if (response?.payment_methods) {
        setPaymentMethods(response.payment_methods);
      } else if (Array.isArray(response?.data)) {
        setPaymentMethods(response.data);
      } else if (Array.isArray(response)) {
        setPaymentMethods(response);
      } else {
        console.log('No payment methods found or unknown response structure:', response);
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
      setPaymentMethods([]);
    }
  };

  const handleAddSuccess = (newMethod) => {
    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddCard(false);
    setSuccess('Payment method added successfully');
    if (onUpdate) onUpdate();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const handleSetDefault = async (methodId) => {
    try {
      setLoading(true);
      await subscriptionsApi.setDefaultPaymentMethod(methodId);
      
      setPaymentMethods(methods => 
        methods.map(method => ({
          ...method,
          is_default: method.id === methodId
        }))
      );
      
      setSuccess('Default payment method updated');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setError(error.response?.data?.error || 'Failed to set default payment method');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setLoading(true);
      await subscriptionsApi.removePaymentMethod(methodId);
      
      setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
      setSuccess('Payment method removed successfully');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setError(error.response?.data?.error || 'Failed to remove payment method');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getBrandIcon = (brand) => {
    return <CreditCard className="h-6 w-6" />;
  };

  return (
    <div className="space-y-6">
      {/* Error and Success Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* MOBILE VIEW */}
      <div className="lg:hidden">
        {showAddCard ? (
          <div className="space-y-4">
            {/* Back Button */}
            <button 
              onClick={() => setShowAddCard(false)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back
            </button>

            {/* Form Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add or modify payment method</h3>
              <p className="text-sm text-gray-600">Set default payment methods</p>
            </div>

            {/* Form */}
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CardForm
                onSuccess={handleAddSuccess}
                onError={handleAddError}
                loading={loading}
                setLoading={setLoading}
              />
            </Elements>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-600">Manage your payment methods</p>
              </div>
              <button 
                onClick={() => setShowAddCard(true)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>

            {/* Current Billing Period Title */}
            <h4 className="text-base font-semibold text-gray-900">Current Billing Period</h4>

            {/* Payment Methods List or Empty State */}
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className={`p-4 rounded-lg border-2 transition-all ${method.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex gap-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-red-500 to-red-600"></div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-orange-400 to-red-500"></div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{method.brand}</p>
                          <p className="text-xs text-gray-600 truncate">•••• •••• •••• {method.last4}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CreditCard className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">No Payment Methods</h4>
                <p className="text-sm text-gray-600 mb-6">Add a payment method to get started</p>
                <Button 
                  onClick={() => setShowAddCard(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
            <p className="text-sm text-gray-600">Manage your payment methods and billing preferences</p>
          </div>
          {paymentMethods.length > 0 && (
            <Button 
              onClick={() => setShowAddCard(!showAddCard)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          )}
        </div>

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 ${showAddCard ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-6`}>
          {/* Left Column: Payment Methods List */}
          <div className="lg:col-span-1">
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900">Current Billing Period</h4>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${method.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-red-500 to-red-600"></div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-orange-400 to-red-500"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{method.brand}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">•••• •••• •••• {method.last4}</p>
                      <div className="mt-3 flex gap-2">
                        {!method.is_default && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            disabled={loading}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3 inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CreditCard className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">No Payment Method Found</h4>
                <p className="text-sm text-gray-600 mb-6">Add payment to ensure uninterrupted service</p>
                <Button 
                  onClick={() => setShowAddCard(true)}
                  className="w-fit px-4 bg-gradient-to-br from-[#FFC000] to-[#FF8400] hover:bg-gold text-white text-sm"
                >
                  {/* <Plus className="h-4 w-4 mr-2" /> */}
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Card Details Form */}
          {(paymentMethods.length > 0 || showAddCard) && (
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Card Details</h4>
                <p className="text-xs sm:text-sm text-gray-600">Set default payment methods</p>
              </div>

              <Elements stripe={stripePromise} options={elementsOptions}>
                <CardForm
                  onSuccess={handleAddSuccess}
                  onError={handleAddError}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Processing:</strong> All payment information is encrypted and processed securely. 
          We never store your complete card details on our servers.
        </AlertDescription>
      </Alert>

      {/* Billing Information */}
      {/* {subscription && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Next Charge Amount</p>
                <p className="text-base sm:text-lg font-semibold">
                  ${subscription?.plan?.price || subscription?.billing_info?.next_billing_amount || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Next Charge Date</p>
                <p className="text-base sm:text-lg font-semibold">
                  {(() => {
                    // For active subscriptions, current_period_end is the next billing date
                    if (subscription?.status === 'active' && subscription?.current_period_end) {
                      return new Date(subscription.current_period_end).toLocaleDateString();
                    }
                    
                    // Try other possible date fields from API
                    const nextDate = subscription?.next_payment_date || 
                                   subscription?.next_billing_date ||
                                   subscription?.billing_info?.next_payment_date ||
                                   subscription?.billing_info?.next_billing_date;
                    
                    if (nextDate) {
                      return new Date(nextDate).toLocaleDateString();
                    }
                    
                    // For trial subscriptions, also use current_period_end
                    if (subscription?.status === 'trialing' && subscription?.current_period_end) {
                      return new Date(subscription.current_period_end).toLocaleDateString();
                    }
                    
                    // If still no date and we have a trial period, estimate
                    if (subscription?.status === 'trialing' && subscription?.current_period_start) {
                      const startDate = new Date(subscription.current_period_start);
                      const estimatedEnd = new Date(startDate);
                      estimatedEnd.setMonth(estimatedEnd.getMonth() + 1); // Add 1 month
                      return estimatedEnd.toLocaleDateString();
                    }
                    
                    // Fallback to current_period_end regardless of status
                    if (subscription?.current_period_end) {
                      return new Date(subscription.current_period_end).toLocaleDateString();
                    }
                    
                    return 'N/A';
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="text-lg font-semibold capitalize">
                  {subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'Monthly'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto Renewal</p>
                <p className="text-lg font-semibold">
                  {subscription?.auto_renew || subscription?.billing_info?.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}


      {/* <CardForm
              onSuccess={handleAddSuccess}
              onError={handleAddError}
              loading={loading}
              setLoading={setLoading}
      /> */}
    </div>
  );
};

export default PaymentMethodManager;
