import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, FileText, Check, Loader2, AlertCircle, User, Lock } from "lucide-react";
import { cartService, orderService } from "../../api-services/marketplace";
import { getCurrentUser } from "../../api-services/users";
import { getSession } from "../../lib/session";
import { toast } from "sonner";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from "../../lib/stripeUtils";
import { webRoutes } from "../../lib/webRoutes";

function CheckoutFormInner({ cart, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    phone: "",
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({...shippingAddress});
  const [buyerNotes, setBuyerNotes] = useState("");

  // Fetch user/company data to prepopulate shipping address
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        setLoadingAddress(true);
        
        // Try to get user data from session first
        const session = getSession();
        const sessionUser = session?.user;
        
        // Also fetch fresh current user data
        const currentUser = await getCurrentUser();
        const user = currentUser || sessionUser;
        
        if (user) {
          // Prepopulate from user profile
          const prepopulatedAddress = {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            street: user.address || user.company_address || "",
            city: user.city || "",
            state: user.state || user.region || "",
            postal_code: user.postal_code || user.zip_code || "",
            country: user.country || user.nationality || "United States",
            phone: user.phone || user.phone_number || "",
          };
          
          // If user has a company, try to use company address as fallback
          if (user.company) {
            prepopulatedAddress.street = prepopulatedAddress.street || user.company.office_address || "";
            prepopulatedAddress.city = prepopulatedAddress.city || user.company.city || "";
            prepopulatedAddress.state = prepopulatedAddress.state || user.company.state || "";
            prepopulatedAddress.country = prepopulatedAddress.country || user.company.country || "United States";
            prepopulatedAddress.phone = prepopulatedAddress.phone || user.company.phone || "";
          }
          
          setShippingAddress(prepopulatedAddress);
          setBillingAddress(prepopulatedAddress);
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
        // Continue with empty form - not a critical error
      } finally {
        setLoadingAddress(false);
      }
    };
    
    fetchUserAddress();
  }, []);

  const handleAddressChange = (field, value, isBilling = false) => {
    if (isBilling) {
      setBillingAddress({ ...billingAddress, [field]: value });
    } else {
      setShippingAddress({ ...shippingAddress, [field]: value });
      if (sameAsBilling) {
        setBillingAddress({ ...shippingAddress, [field]: value });
      }
    }
  };

  const validateAddress = () => {
    const required = ['first_name', 'last_name', 'street', 'city', 'state', 'postal_code', 'country'];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }
    return true;
  };

  const formatAddressString = (addr) => {
    return `${addr.first_name} ${addr.last_name}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAddress()) return;
    
    if (!stripe || !elements) {
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    // Get CardElement - it must be available
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Payment card information is missing. Please go back to the payment step.");
      setStep(2); // Go back to payment step
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order with shipping address
      const order = await orderService.createOrder(
        shippingAddress,
        sameAsBilling ? null : billingAddress,
        buyerNotes
      );

      // Step 2: Create payment intent for the order
      const paymentData = await orderService.createPaymentIntent(order.id);
      
      if (!paymentData.client_secret) {
        toast.error("Failed to initialize payment");
        return;
      }

      // Step 3: Confirm the card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
              email: shippingAddress.email,
              address: {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.postal_code,
                country: shippingAddress.country === 'United States' ? 'US' : shippingAddress.country,
              },
            },
          },
        }
      );

      if (error) {
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 4: Confirm payment on backend
        await orderService.confirmPayment(order.id, paymentIntent.id);
        toast.success("Payment successful! Order placed.");
        onSuccess(order);
      } else {
        toast.error("Payment not completed. Please try again.");
      }

    } catch (error) {
      console.error("Checkout error:", error);
      // Handle various error formats
      const errorData = error.response?.data;
      let errorMessage = "Failed to complete checkout";
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.shipping_address) {
          errorMessage = `Shipping address: ${errorData.shipping_address}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Try to extract any field errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { num: 1, label: "Shipping" },
        { num: 2, label: "Payment" },
        { num: 3, label: "Review" },
      ].map((s, idx, arr) => (
        <React.Fragment key={s.num}>
          <button
            type="button"
            onClick={() => step > s.num && setStep(s.num)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              step === s.num
                ? "bg-blue-600 text-white"
                : step > s.num
                ? "bg-green-100 text-green-600 cursor-pointer"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step > s.num ? <Check size={16} /> : s.num}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {idx < arr.length - 1 && <div className="w-8 h-0.5 bg-gray-200" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderStepIndicator()}

      {/* Step 1: Shipping Address */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin size={20} /> Shipping Address
          </h3>
          
          {loadingAddress ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
              <span className="text-gray-500">Loading your address...</span>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={shippingAddress.first_name}
                onChange={(e) => handleAddressChange('first_name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={shippingAddress.last_name}
                onChange={(e) => handleAddressChange('last_name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
              <input
                type="text"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
              <input
                type="text"
                value={shippingAddress.postal_code}
                onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                value={shippingAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          )}

          {!loadingAddress && (
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => setSameAsBilling(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Billing address same as shipping</span>
          </label>
          )}
          
          {!loadingAddress && !sameAsBilling && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Billing Address</h4>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={billingAddress.first_name}
                  onChange={(e) => handleAddressChange('first_name', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={billingAddress.last_name}
                  onChange={(e) => handleAddressChange('last_name', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={billingAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value, true)}
                  className="col-span-2 border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={billingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={billingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={billingAddress.postal_code}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={billingAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value, true)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          )}
          
          {!loadingAddress && (
          <button
            type="button"
            onClick={() => validateAddress() && setStep(2)}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Continue to Payment
          </button>
          )}
        </div>
      )}

      {/* Step 2: Payment */}
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${step !== 2 ? 'hidden' : ''}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={20} /> Payment Details
        </h3>
        
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">Card Information</label>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                  padding: '12px',
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Lock size={14} />
          <span>Your payment info is secured with SSL encryption</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Review Order
          </button>
        </div>
      </div>

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} /> Review Your Order
          </h3>
          
          {/* Shipping Address Review */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Shipping To:</h4>
            <p className="text-gray-600">
              {shippingAddress.first_name} {shippingAddress.last_name}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />
              {shippingAddress.country}
              {shippingAddress.phone && <><br />{shippingAddress.phone}</>}
            </p>
          </div>
          
          {/* Items Review */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-3">Items ({cart?.items?.length || 0}):</h4>
            <div className="space-y-3">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.listing?.title || 'Product'} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(parseFloat(item.price || item.listing?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
            <textarea
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="Special instructions for your order..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Payment Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <CreditCard className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-blue-800 font-medium">Order & Shipping</p>
                <p className="text-sm text-blue-700">
                  A shipment request will be created automatically for logistics tracking.
                </p>
              </div>
            </div>
          </div>
          
          {/* Total */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${parseFloat(cart?.subtotal || cart?.total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">${parseFloat(cart?.total || cart?.subtotal || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !stripe}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Pay & Place Order
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// Wrapper component that provides Stripe Elements context
function CheckoutForm({ cart, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner cart={cart} onSuccess={onSuccess} />
    </Elements>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      if (!data || !data.items || data.items.length === 0) {
        toast.info("Your cart is empty");
        navigate("/marketplace/cart");
        return;
      }
      setCart(data);
    } catch (error) {
      toast.error("Failed to load cart");
      navigate("/marketplace/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (order) => {
    navigate(`/marketplace/order-confirmation/${order.id}`, { state: { order } });
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={webRoutes.marketplaceCart} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <CheckoutForm cart={cart} onSuccess={handleSuccess} />
      </div>
    </section>
  );
}
