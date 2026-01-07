import React, { useState, useEffect } from 'react';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
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
  Loader2,
  Building2,
  Wallet,
  Smartphone,
  Link as LinkIcon,
  RefreshCw,
  Edit3,
  AlertTriangle,
  X
} from 'lucide-react';
import { stripePromise } from '../../lib/stripeUtils';
import subscriptionsApi from '../../api-services/subscriptions';

// Payment method type icons
const PaymentMethodIcons = {
  card: CreditCard,
  us_bank_account: Building2,
  link: LinkIcon,
  apple_pay: Smartphone,
  google_pay: Wallet,
};

// Payment method display names
const PaymentMethodNames = {
  card: 'Credit/Debit Card',
  us_bank_account: 'Bank Account (ACH)',
  link: 'Link by Stripe',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
};

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

// Card Brand Icon Component - Reusable for both form and saved cards list
const CardBrandIcon = ({ brand, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-12 h-8',
    lg: 'w-16 h-10'
  };
  const circleSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-8 h-8';
  const circleOffset = size === 'sm' ? '-ml-2.5' : '-ml-4';

  switch (brand?.toLowerCase()) {
    case 'visa':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#1A1F71"/>
          <path d="M19.5 21H17L18.8 11H21.3L19.5 21Z" fill="white"/>
          <path d="M28.5 11.2C28 11 27.2 10.8 26.2 10.8C23.7 10.8 22 12.1 22 13.9C22 15.3 23.3 16 24.3 16.5C25.3 17 25.7 17.3 25.7 17.8C25.7 18.5 24.8 18.8 24 18.8C22.9 18.8 22.3 18.6 21.4 18.2L21 18L20.6 20.6C21.3 20.9 22.5 21.2 23.7 21.2C26.4 21.2 28 19.9 28 18C28 16.9 27.3 16.1 25.8 15.4C24.9 14.9 24.4 14.6 24.4 14.1C24.4 13.6 25 13.1 26.1 13.1C27 13.1 27.7 13.3 28.2 13.5L28.5 13.6L28.9 11.2H28.5Z" fill="white"/>
          <path d="M33.6 11H31.6C31 11 30.5 11.2 30.2 11.8L26.5 21H29.2L29.7 19.5H33L33.3 21H35.7L33.6 11ZM30.5 17.5L31.8 13.8L32.5 17.5H30.5Z" fill="white"/>
          <path d="M16.3 11L13.8 17.8L13.5 16.2C12.9 14.4 11.2 12.5 9.3 11.5L11.6 21H14.3L19 11H16.3Z" fill="white"/>
          <path d="M12.4 11H8.1L8 11.2C11.2 12 13.4 14 14.2 16.2L13.3 11.8C13.2 11.2 12.7 11 12.4 11Z" fill="#F9A51A"/>
        </svg>
      );
    case 'mastercard':
      return (
        <div className="flex">
          <div className={`${circleSize} rounded-full bg-[#EB001B]`} />
          <div className={`${circleSize} rounded-full bg-[#F79E1B] ${circleOffset}`} />
        </div>
      );
    case 'amex':
    case 'american express':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#006FCF"/>
          <path d="M8 16L10.5 10H14L15 12.5L16 10H19.5L17 16L19.5 22H16L15 19.5L14 22H10.5L8 16Z" fill="white"/>
          <path d="M20 10H26V12H22V14.5H25.5V16.5H22V19H26V22H20V10Z" fill="white"/>
          <path d="M27 10H31L32.5 14L34 10H38L35 16L38 22H34L32.5 18L31 22H27L30 16L27 10Z" fill="white"/>
        </svg>
      );
    case 'discover':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#F8F8F8"/>
          <ellipse cx="30" cy="16" rx="8" ry="7" fill="#F26122"/>
          <path d="M6 13H9C10.5 13 11.5 14 11.5 15.5C11.5 17 10.5 18 9 18H7.5V21H6V13Z" fill="#1A1F71"/>
          <path d="M12 13H13.5V21H12V13Z" fill="#1A1F71"/>
          <path d="M14.5 17C14.5 14.5 16.5 13 19 13C20 13 21 13.3 21.5 13.7L20.8 15C20.3 14.7 19.7 14.5 19 14.5C17.5 14.5 16.5 15.5 16.5 17C16.5 18.5 17.5 19.5 19 19.5C19.7 19.5 20.3 19.3 20.8 19L21.5 20.3C21 20.7 20 21 19 21C16.5 21 14.5 19.5 14.5 17Z" fill="#1A1F71"/>
        </svg>
      );
    case 'diners':
    case 'diners club':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="white" stroke="#E5E7EB"/>
          <circle cx="24" cy="16" r="10" fill="#0079BE"/>
          <path d="M19 16C19 13.2 21.2 11 24 11V21C21.2 21 19 18.8 19 16Z" fill="white"/>
          <path d="M29 16C29 18.8 26.8 21 24 21V11C26.8 11 29 13.2 29 16Z" fill="white"/>
        </svg>
      );
    case 'jcb':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="white" stroke="#E5E7EB"/>
          <rect x="8" y="8" width="10" height="16" rx="2" fill="#0B4EA2"/>
          <rect x="19" y="8" width="10" height="16" rx="2" fill="#E41D2D"/>
          <rect x="30" y="8" width="10" height="16" rx="2" fill="#007940"/>
        </svg>
      );
    case 'unionpay':
      return (
        <svg className={sizeClasses[size]} viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#1A1F71"/>
          <path d="M10 8H20L18 24H8L10 8Z" fill="#E21836"/>
          <path d="M18 8H28L26 24H16L18 8Z" fill="#00447C"/>
          <path d="M26 8H36L34 24H24L26 8Z" fill="#007B84"/>
        </svg>
      );
    default:
      // Default card icon when unknown
      return (
        <div className="flex">
          <div className={`${circleSize} rounded-full bg-gray-300`} />
          <div className={`${circleSize} rounded-full bg-gray-400 ${circleOffset}`} />
        </div>
      );
  }
};

// Compact Stripe Card Form Component - Modern Bank Card Style
export const CompactCardForm = ({ onSuccess, onError, loading, setLoading, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [focused, setFocused] = useState(null);
  const [cardBrand, setCardBrand] = useState('unknown');

  const handleCardChange = (event) => {
    if (event.brand) {
      setCardBrand(event.brand);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !cardholderName.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data: setupIntentData } = await subscriptionsApi.createSetupIntent();
      
      if (!setupIntentData.client_secret) {
        throw new Error('Setup intent did not return a client_secret');
      }
      
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        onError('Payment field failed to load. Please refresh the page.');
        setLoading(false);
        return;
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupIntentData.client_secret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: { name: cardholderName },
          }
        }
      );

      if (error) {
        onError(error.message || 'Failed to add card');
        return;
      }

      if (setupIntent.status !== 'succeeded') {
        onError('Card setup was not completed. Please try again.');
        return;
      }

      const { data } = await subscriptionsApi.addPaymentMethod({
        payment_method_id: setupIntent.payment_method,
        set_as_default: true
      });

      onSuccess(data);
    } catch (error) {
      onError(error.response?.data?.error || error.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const elementStyle = {
    base: {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      letterSpacing: '0.025em',
      '::placeholder': { color: 'rgba(255,255,255,0.5)' },
    },
    invalid: { color: '#fca5a5' },
  };

  const elementStyleDark = {
    base: {
      fontSize: '14px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Modern Bank Card Design */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Card Front */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-5 shadow-2xl overflow-hidden aspect-[1.586/1]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFC000]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FF8400]/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
          
          {/* Chip */}
          <div className="absolute top-5 left-5 w-10 h-7 rounded-md bg-gradient-to-br from-[#d4af37] via-[#f0d060] to-[#d4af37] shadow-sm">
            <div className="absolute inset-0.5 rounded bg-gradient-to-br from-[#c5a028] to-[#e6c84a] opacity-80" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#b8960f]" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#b8960f]" />
          </div>
          
          {/* Contactless Icon */}
          <div className="absolute top-6 left-16 text-white/50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5c1.5-1.5 1.5-3.5 0-5" />
              <path d="M12 18c3-3 3-7 0-10" />
              <path d="M15.5 21.5c4.5-4.5 4.5-10.5 0-15" />
            </svg>
          </div>
          
          {/* Card Number */}
          <div className="mt-10 mb-4">
            <div className={`bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border transition-all ${focused === 'number' ? 'border-[#FFC000] ring-1 ring-[#FFC000]/50' : 'border-white/20'}`}>
              <CardNumberElement 
                options={{ 
                  style: elementStyle, 
                  placeholder: '•••• •••• •••• ••••'
                }}
                onFocus={() => setFocused('number')}
                onBlur={() => setFocused(null)}
                onChange={handleCardChange}
              />
            </div>
          </div>
          
          {/* Bottom Row: Name + Expiry */}
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
              <span className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Card Holder</span>
              <input
                type="text"
                placeholder="YOUR NAME"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                className="w-full bg-transparent text-white text-sm font-medium tracking-wider placeholder:text-white/30 focus:outline-none border-b border-white/20 focus:border-[#FFC000] pb-1 transition-colors"
                required
              />
            </div>
            <div className="w-20">
              <span className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Expires</span>
              <div className={`bg-white/10 rounded px-2 py-1 border transition-all ${focused === 'expiry' ? 'border-[#FFC000]' : 'border-transparent'}`}>
                <CardExpiryElement 
                  options={{ style: elementStyle }}
                  onFocus={() => setFocused('expiry')}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>
          </div>
          
          {/* Card brand logo - dynamically updates based on card number */}
          <div className="absolute top-5 right-5 transition-all duration-300">
            <CardBrandIcon brand={cardBrand} />
          </div>
        </div>
        
        {/* CVV Section - Below card */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Security Code (CVV)</label>
            <div className={`h-10 border rounded-lg px-3 flex items-center bg-white transition-all ${focused === 'cvc' ? 'border-[#FFC000] ring-1 ring-[#FFC000]/30' : 'border-gray-300'}`}>
              <CardCvcElement 
                options={{ 
                  style: {
                    base: {
                      fontSize: '14px',
                      color: '#1f2937',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      '::placeholder': { color: '#9ca3af' },
                    },
                    invalid: { color: '#ef4444' },
                  }, 
                  placeholder: '•••'
                }}
                onFocus={() => setFocused('cvc')}
                onBlur={() => setFocused(null)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-5">
            <Button 
              type="submit"
              disabled={!stripe || loading || !cardholderName.trim()}
              size="sm"
              className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] hover:from-[#FF8400] hover:to-[#FFC000] text-white px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Save
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel} className="px-4">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Shield className="h-3 w-3" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
};

// Original Stripe Card Form Component (full form)
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
  const [showReplaceCard, setShowReplaceCard] = useState(false);
  const [cardToReplace, setCardToReplace] = useState(null); // Track which specific card to replace
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalError, setRenewalError] = useState(null);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load payment methods on component mount
  useEffect(() => {
    console.log('PaymentMethodManager mounted, loading payment methods...');
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    console.log('loadPaymentMethods called');
    try {
      setInitialLoading(true);
      console.log('Calling subscriptionsApi.getPaymentMethods()...');
      const response = await subscriptionsApi.getPaymentMethods();
      console.log('Payment methods API response:', JSON.stringify(response, null, 2));
      
      // Check for backend warnings (like no subscription found)
      if (response?.warning) {
        console.warn('Payment methods warning:', response.warning);
      }
      
      // Check if API returned an error
      if (response?.source === 'api_error') {
        console.error('API error loading payment methods:', response.error);
        setError('Could not connect to payment service. Please try again.');
        setPaymentMethods([]);
        return;
      }
      
      // The API service returns { payment_methods: [...] } directly
      // Handle different response structures in priority order
      let methods = [];
      
      if (Array.isArray(response?.payment_methods)) {
        // Most common case: { payment_methods: [...] }
        methods = response.payment_methods;
      } else if (response?.data?.payment_methods && Array.isArray(response.data.payment_methods)) {
        // If somehow wrapped in data: { data: { payment_methods: [...] } }
        methods = response.data.payment_methods;
      } else if (Array.isArray(response?.data)) {
        // Direct array in data: { data: [...] }
        methods = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response: [...]
        methods = response;
      } else {
        console.log('No payment methods found or unknown response structure:', response);
      }
      
      console.log('Setting payment methods:', methods.length, 'items');
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddSuccess = async (newMethod) => {
    // If replacing a specific card, delete only that card
    if (cardToReplace) {
      try {
        await subscriptionsApi.deletePaymentMethod(cardToReplace);
        // Replace the old card with new one in the list
        setPaymentMethods(prev => 
          prev.map(m => m.id === cardToReplace ? newMethod : m)
            .filter(m => m.id !== cardToReplace)
            .concat([newMethod])
        );
        setSuccess('Card replaced successfully');
      } catch (err) {
        console.error('Error removing old payment method:', err);
        // Still add the new method even if deletion failed
        setPaymentMethods(prev => [...prev, newMethod]);
        setSuccess('New card added (old card may remain)');
      }
    } else {
      // Just adding a new card (keep existing ones)
      setPaymentMethods(prev => [...prev, newMethod]);
      setSuccess('Payment method added successfully');
    }
    
    setShowAddCard(false);
    setCardToReplace(null);
    if (onUpdate) onUpdate();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const handleReplaceSuccess = async (newMethod) => {
    // Delete all existing payment methods when replacing
    if (paymentMethods.length > 0) {
      try {
        for (const oldMethod of paymentMethods) {
          await subscriptionsApi.deletePaymentMethod(oldMethod.id);
        }
        setPaymentMethods([newMethod]);
        setSuccess('Card replaced successfully');
      } catch (err) {
        console.error('Error removing old payment methods:', err);
        setPaymentMethods([newMethod]);
        setSuccess('New card added (some old cards may remain)');
      }
    } else {
      setPaymentMethods([newMethod]);
      setSuccess('Card added successfully');
    }
    
    setShowReplaceCard(false);
    if (onUpdate) onUpdate();
    setTimeout(() => setSuccess(''), 3000);
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

  // Local state to track if we just renewed (to hide alert immediately)
  const [justRenewed, setJustRenewed] = useState(false);

  // Check if subscription period has expired
  const isPeriodExpired = () => {
    if (justRenewed) return false; // Hide if just renewed
    if (!subscription?.current_period_end) return false;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    return endDate < now;
  };

  // Check if subscription needs renewal
  const needsRenewal = () => {
    if (justRenewed) return false; // Hide if just renewed
    if (!subscription) return false;
    const status = subscription.status?.toLowerCase();
    if (['expired', 'cancelled', 'canceled', 'past_due', 'unpaid'].includes(status)) {
      return true;
    }
    return isPeriodExpired();
  };

  // Handle subscription renewal
  const handleRenewSubscription = async () => {
    if (!subscription?.id) return;
    
    try {
      setRenewalLoading(true);
      setRenewalError(null);
      setRenewalSuccess(false);
      
      if (paymentMethods.length === 0) {
        setRenewalError('Please add a payment method before renewing.');
        return;
      }
      
      const response = await subscriptionsApi.processRenewal(subscription.id);
      
      if (response?.data || response) {
        setRenewalSuccess(true);
        setJustRenewed(true); // Hide renewal alert immediately
        setSuccess('Subscription renewed successfully! Payment processed.');
        if (onUpdate) onUpdate(); // Trigger parent to refresh data
        setTimeout(() => {
          setSuccess('');
          setRenewalSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error renewing subscription:', err);
      setRenewalError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        'Failed to renew subscription. Please try again.'
      );
    } finally {
      setRenewalLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBrandIcon = (brand) => {
    return <CreditCard className="h-6 w-6" />;
  };

  // Show loading state during initial load
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600">Loading payment methods...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Renewal Alert - Shows on both mobile and desktop */}
      <div className="lg:hidden">
        {needsRenewal() && (
          <Card className={`border-2 ${isPeriodExpired() ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50' : 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
            <CardContent className="py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPeriodExpired() ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertCircle className={`h-5 w-5 ${isPeriodExpired() ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${isPeriodExpired() ? 'text-red-800' : 'text-amber-800'}`}>
                      {isPeriodExpired() ? 'Subscription Expired' : 'Expiring Soon'}
                    </h4>
                    <p className={`text-xs ${isPeriodExpired() ? 'text-red-600' : 'text-amber-600'}`}>
                      {isPeriodExpired() 
                        ? 'Renew now to restore access'
                        : `Expires ${new Date(subscription?.current_period_end).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {renewalError && (
                    <span className="text-xs text-red-600">{renewalError}</span>
                  )}
                  {renewalSuccess && (
                    <span className="text-xs text-green-600 font-medium">✓ Renewed successfully!</span>
                  )}
                  <Button 
                    onClick={handleRenewSubscription}
                    disabled={renewalLoading || !paymentMethods.length}
                    size="sm"
                    className={`w-full ${isPeriodExpired() 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-br from-[#FFC000] to-[#FF8400] hover:from-[#FF8400] hover:to-[#FFC000]'
                    } text-white`}
                  >
                    {renewalLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Now
                      </>
                    )}
                  </Button>
                  {!paymentMethods.length && (
                    <p className="text-xs text-gray-500 text-center">Add a payment method first</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden">
        {showAddCard ? (
          <div className="space-y-4">
            {/* Back Button */}
            <button 
              onClick={() => {
                setShowAddCard(false);
                setCardToReplace(null);
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back
            </button>

            {/* Form Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {cardToReplace ? 'Replace Card' : (paymentMethods.length > 0 ? 'Add New Card' : 'Add Payment Method')}
              </h3>
              <p className="text-sm text-gray-600">
                {cardToReplace ? 'Enter new card details to replace the selected card' : 'Enter your card details'}
              </p>
            </div>

            {/* Compact Card Form */}
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CompactCardForm
                onSuccess={(msg) => {
                  handleAddSuccess(msg);
                  setShowAddCard(false);
                }}
                onError={handleAddError}
                onCancel={() => {
                  setShowAddCard(false);
                  setCardToReplace(null);
                }}
                loading={loading}
                setLoading={setLoading}
              />
            </Elements>
          </div>
        ) : paymentMethods.length > 0 ? (
          /* Has cards - show card list */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-600">Manage your payment methods</p>
              </div>
              <button 
                onClick={() => {
                  setCardToReplace(null);
                  setShowAddCard(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-[#FFC000] hover:bg-amber-50 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            </div>

            {/* Saved Cards */}
            <h4 className="text-base font-semibold text-gray-900">Saved Cards</h4>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className={`p-4 rounded-lg border-2 transition-all ${method.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <CardBrandIcon brand={method.brand} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 capitalize">{method.brand}</p>
                          {method.is_default && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">•••• •••• •••• {method.last4}</p>
                      </div>
                    </div>
                  </div>
                  {/* Card Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          disabled={loading}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Set as Default
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCardToReplace(method.id);
                          setShowAddCard(true);
                        }}
                        disabled={loading}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        Replace
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        disabled={loading}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* No cards - show add card form directly */
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600">Add a card to ensure uninterrupted service</p>
            </div>
            
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CompactCardForm
                onSuccess={handleAddSuccess}
                onError={handleAddError}
                loading={loading}
                setLoading={setLoading}
              />
            </Elements>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block space-y-6">
        {/* Renewal Alert - Desktop */}
        {needsRenewal() && (
          <Card className={`border-2 ${isPeriodExpired() ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50' : 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPeriodExpired() ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertCircle className={`h-6 w-6 ${isPeriodExpired() ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isPeriodExpired() ? 'text-red-800' : 'text-amber-800'}`}>
                      {isPeriodExpired() ? 'Subscription Expired' : 'Subscription Expiring Soon'}
                    </h4>
                    <p className={`text-sm ${isPeriodExpired() ? 'text-red-600' : 'text-amber-600'}`}>
                      {isPeriodExpired() 
                        ? 'Your subscription has expired. Renew now to restore access.'
                        : `Your subscription expires on ${new Date(subscription?.current_period_end).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {renewalSuccess && (
                    <span className="text-sm text-green-600 font-medium">✓ Renewed!</span>
                  )}
                  {renewalError && (
                    <span className="text-sm text-red-600">{renewalError}</span>
                  )}
                  <Button 
                    onClick={handleRenewSubscription}
                    disabled={renewalLoading || !paymentMethods.length}
                    className={`${isPeriodExpired() 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-br from-[#FFC000] to-[#FF8400] hover:from-[#FF8400] hover:to-[#FFC000]'
                    } text-white`}
                  >
                    {renewalLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {!paymentMethods.length && (
                <p className="mt-2 text-sm text-gray-600 ml-15">
                  Please add a payment method below to renew your subscription.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
            <p className="text-sm text-gray-600">Manage your payment methods and billing preferences</p>
          </div>
          {paymentMethods.length > 0 && !showReplaceCard && (
            <Button 
              onClick={() => {
                setCardToReplace(null);
                setShowReplaceCard(true);
              }}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:border-[#FFC000] hover:bg-amber-50"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          )}
        </div>

        {/* Content Area */}
        {paymentMethods.length > 0 ? (
          /* Has Cards - Show card list and optional replace form */
          <div className={`grid grid-cols-1 ${showReplaceCard ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-6`}>
            {/* Left Column: Payment Methods List */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900">Saved Cards</h4>
                <p className="text-xs text-gray-500">The default card will be used for payments</p>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={`p-4 rounded-lg border-2 transition-all ${method.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <CardBrandIcon brand={method.brand} size="sm" />
                        <span className="text-sm font-medium text-gray-900 capitalize">{method.brand}</span>
                        {method.is_default && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">•••• •••• •••• {method.last4}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          {!method.is_default && (
                            <button
                              onClick={() => handleSetDefault(method.id)}
                              disabled={loading}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Set as Default
                            </button>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setCardToReplace(method.id);
                              setShowReplaceCard(true);
                            }}
                            disabled={loading}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            Replace
                          </button>
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            disabled={loading}
                            className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Add/Replace Card Form */}
            {showReplaceCard && (
              <div className="lg:col-span-2">
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">
                          {cardToReplace ? 'Replace Card' : 'Add New Card'}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mt-1">
                          {cardToReplace ? 'Enter new card details to replace the selected card' : 'Add a backup payment method'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowReplaceCard(false);
                          setCardToReplace(null);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Elements stripe={stripePromise} options={elementsOptions}>
                      <CompactCardForm
                        onSuccess={(msg) => {
                          handleAddSuccess(msg);
                          setShowReplaceCard(false);
                        }}
                        onError={handleAddError}
                        onCancel={() => {
                          setShowReplaceCard(false);
                          setCardToReplace(null);
                        }}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </Elements>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          /* No Cards - Show add card form directly */
          <div className="max-w-md mx-auto">
            <Card className="border-gray-200">
              <CardHeader className="pb-3 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-7 w-7 text-gray-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Add Payment Method</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Add a card to ensure uninterrupted service</p>
              </CardHeader>
              <CardContent className="pt-0">
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CompactCardForm
                    onSuccess={handleAddSuccess}
                    onError={handleAddError}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Compact Security Notice */}
      <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500">
        <Shield className="h-3.5 w-3.5" />
        <span>All payments are securely processed via Stripe. We never store your card details.</span>
      </div>
    </div>
  );
};

export default PaymentMethodManager;
