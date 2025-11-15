import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
import { stripePromise } from '@/lib/stripeUtils';
import subscriptionsApi from '@/api-services/subscriptions';

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
const CardForm = ({ onSuccess, onError, loading, setLoading }) => {
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
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        console.error('Stripe CardElement not mounted (CSP or mounting issue)');
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
            card: cardElement,
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {import.meta.env.DEV && (
          <p className="text-xs text-gray-500 mt-1">
            Test cards: 4242424242424242 (succeeds), 4000002500003155 (requires auth), 4000000000009995 (declined)
          </p>
        )}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit"
          disabled={!stripe || loading || !cardholderName.trim()}
          className="flex-1"
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
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage your payment methods and billing preferences</p>
        </div>
        
        {/* Only show Add button in header if there are existing payment methods */}
        {paymentMethods.length > 0 && (
          <Button 
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        )}
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.is_default ? 'ring-2 ring-blue-200' : ''}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    {getBrandIcon(method.brand)}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="text-sm sm:text-base font-medium truncate">•••• •••• •••• {method.last4}</p>
                        {method.is_default && (
                          <Badge className="bg-blue-100 text-blue-800 w-fit text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {method.brand.toUpperCase()}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Active
                        </Badge>
                        {method.funding && (
                          <Badge variant="outline" className="text-xs">
                            {method.funding}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={loading}
                        className="text-xs sm:text-sm"
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          'Set Default'
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="sm:hidden">Remove</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 sm:p-8 text-center">
            <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Add a payment method to ensure uninterrupted service</p>
            <Button onClick={() => setShowAddCard(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Processing:</strong> All payment information is encrypted and processed securely. 
          We never store your complete card details on our servers.
        </AlertDescription>
      </Alert>

      {/* Billing Information */}
      {subscription && (
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
      )}

      {/* Single Add Payment Method Dialog */}
      <Elements stripe={stripePromise} options={elementsOptions}>
        <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            
            <CardForm
              onSuccess={handleAddSuccess}
              onError={handleAddError}
              loading={loading}
              setLoading={setLoading}
            />
          </DialogContent>
        </Dialog>
      </Elements>
    </div>
  );
};

export default PaymentMethodManager;
