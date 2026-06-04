/**
 * Stripe Payment Utility
 * Handles Stripe payment integration for subscription management
 */
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key (Vite environment variables)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                            import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
                            'pk_test_51RyO26CivSUJhvqtO4EFKwDU5WBuUBADdCFAOf5kJZ1MQu2FkDdbP2Be3i2ucELjQ4LswFVDbSSbkdO6ynxUctm700UQ7mxdCf';

// Load Stripe with just the publishable key (no additional options needed for basic usage)
const stripePromise = loadStripe(stripePublishableKey);

export { stripePromise };

/**
 * Stripe Payment Service
 */
export class StripePaymentService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.initialized = false;
  }

  /**
   * Initialize Stripe
   */
  async initialize() {
    if (this.initialized) return;
    
    this.stripe = await stripePromise;
    this.initialized = true;
    
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    return this.stripe;
  }

  /**
   * Create Stripe Elements for payment forms
   */
  createElements(options = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized. Call initialize() first.');
    }

    this.elements = this.stripe.elements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '2px',
          borderRadius: '4px',
        },
      },
      ...options
    });

    return this.elements;
  }

  /**
   * Create a payment method from card element
   */
  async createPaymentMethod(cardElement, billingDetails = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentMethod;
  }

  /**
   * Confirm a setup intent (for saving payment methods)
   */
  async confirmSetupIntent(clientSecret, paymentMethod) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, setupIntent } = await this.stripe.confirmSetupIntent(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return setupIntent;
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(clientSecret, paymentMethodId = null) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const confirmParams = {};
    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId;
    }

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      clientSecret,
      ...confirmParams,
      redirect: 'if_required'
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  }

  /**
   * Create a card element
   */
  createCardElement(options = {}) {
    if (!this.elements) {
      throw new Error('Elements not created. Call createElements() first.');
    }

    const defaultOptions = {
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
      ...options
    };

    return this.elements.create('card', defaultOptions);
  }

  /**
   * Create a card number element (separate fields)
   */
  createCardNumberElement(options = {}) {
    if (!this.elements) {
      throw new Error('Elements not created. Call createElements() first.');
    }

    return this.elements.create('cardNumber', options);
  }

  /**
   * Create a card expiry element
   */
  createCardExpiryElement(options = {}) {
    if (!this.elements) {
      throw new Error('Elements not created. Call createElements() first.');
    }

    return this.elements.create('cardExpiry', options);
  }

  /**
   * Create a card CVC element
   */
  createCardCvcElement(options = {}) {
    if (!this.elements) {
      throw new Error('Elements not created. Call createElements() first.');
    }

    return this.elements.create('cardCvc', options);
  }

  /**
   * Validate card information
   */
  validateCard(cardData) {
    const errors = {};

    if (!cardData.number || cardData.number.length < 13) {
      errors.number = 'Please enter a valid card number';
    }

    if (!cardData.expiry || !/^\d{2}\/\d{4}$/.test(cardData.expiry)) {
      errors.expiry = 'Please enter expiry as MM/YYYY';
    }

    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.cvc = 'Please enter a valid CVC';
    }

    if (!cardData.name || cardData.name.trim().length < 2) {
      errors.name = 'Please enter the cardholder name';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(value) {
    return value
      .replace(/\s+/g, '')
      .replace(/[^0-9]/gi, '')
      .match(/.{1,4}/g)?.join(' ') || '';
  }

  /**
   * Get card brand from number
   */
  getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s+/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    if (/^35/.test(number)) return 'jcb';
    if (/^30/.test(number)) return 'diners';
    
    return 'unknown';
  }

  /**
   * Handle Stripe errors
   */
  handleStripeError(error) {
    switch (error.type) {
      case 'card_error':
        return error.message;
      case 'validation_error':
        return error.message;
      case 'authentication_required':
        return 'Your payment requires authentication. Please try again.';
      case 'rate_limit_error':
        return 'Too many requests. Please try again later.';
      case 'api_connection_error':
        return 'Network error. Please check your connection and try again.';
      case 'api_error':
        return 'Payment processing error. Please try again.';
      case 'invalid_request_error':
        return 'Invalid payment request. Please contact support.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Export singleton instance
export const stripeService = new StripePaymentService();

// Utility functions
// Single source of truth for currency formatting lives in utils/currency.
// Re-exported here so existing imports from stripeUtils keep working.
export { formatCurrency } from '../utils/currency';

export const centsToDollars = (cents) => cents / 100;
export const dollarsToCents = (dollars) => Math.round(dollars * 100);
