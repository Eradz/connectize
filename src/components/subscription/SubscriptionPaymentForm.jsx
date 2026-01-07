import { useElements, useStripe } from "@stripe/react-stripe-js";

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