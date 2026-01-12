import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Building2,
  Shield,
  Wallet,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { stripeConnectService } from '../../api-services/marketplace';
import { toast } from 'sonner';

const SellerPayments = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    // Check for onboarding completion
    const onboardingStatus = searchParams.get('onboarding');
    if (onboardingStatus === 'complete') {
      toast.success('Stripe onboarding completed! Checking your account status...');
    } else if (searchParams.get('refresh') === 'true') {
      toast.info('Please complete your Stripe onboarding to receive payments.');
    }
    
    fetchAccountStatus();
  }, [searchParams]);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);
      const status = await stripeConnectService.getStatus();
      setAccountStatus(status);
    } catch (err) {
      console.error('Failed to fetch account status:', err);
      if (err.response?.status === 401) {
        setIsUnauthorized(true);
        setError('Please log in to access payment settings');
      } else {
        setError(err.response?.data?.error || 'Failed to load payment account status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setActionLoading(true);
      const result = await stripeConnectService.startOnboarding();
      console.log('Onboarding result:', result);
      
      // Check for URL in response (backend may return 'onboarding_url' or 'url')
      const url = result.onboarding_url || result.url;
      
      if (url) {
        // Store the URL in case popup is blocked
        setOnboardingUrl(url);
        
        // Try to open in new tab
        const newWindow = window.open(url, '_blank');
        
        if (newWindow) {
          toast.success('Stripe onboarding opened in new tab');
        } else {
          // Popup was blocked - show link to user
          toast.info('Popup blocked! Click the link below to complete setup.');
        }
        
        // Refresh status after a short delay
        setTimeout(() => fetchAccountStatus(), 2000);
      } else {
        console.error('No onboarding URL in response:', result);
        toast.error('No onboarding URL received from server');
      }
    } catch (err) {
      console.error('Failed to start onboarding:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        toast.error('Please log in to continue');
        setIsUnauthorized(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to start payment setup');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshOnboarding = async () => {
    try {
      setActionLoading(true);
      const result = await stripeConnectService.refreshOnboarding();
      
      // Check for URL in response
      const url = result.onboarding_url || result.url;
      
      if (url) {
        setOnboardingUrl(url);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          toast.success('Onboarding link refreshed');
        } else {
          toast.info('Popup blocked! Click the link below.');
        }
        setTimeout(() => fetchAccountStatus(), 2000);
      }
    } catch (err) {
      console.error('Failed to refresh onboarding:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to continue');
        setIsUnauthorized(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to refresh onboarding link');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setActionLoading(true);
      const result = await stripeConnectService.getDashboardLink();
      
      if (result.dashboard_url) {
        window.open(result.dashboard_url, '_blank');
        toast.success('Opening Stripe Dashboard...');
      }
    } catch (err) {
      console.error('Failed to get dashboard link:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to continue');
        setIsUnauthorized(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to open Stripe Dashboard');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!accountStatus) return null;

    const { has_account, onboarding_complete, charges_enabled, payouts_enabled } = accountStatus;

    if (!has_account) {
      return {
        icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
        title: 'Payment Account Not Set Up',
        description: 'Set up your Stripe account to receive payments from marketplace sales.',
        borderClass: 'border-yellow-200',
        status: 'not_setup'
      };
    }

    if (!onboarding_complete) {
      return {
        icon: <Clock className="w-8 h-8 text-orange-500" />,
        title: 'Onboarding In Progress',
        description: 'Complete your Stripe account setup to start receiving payments.',
        borderClass: 'border-orange-200',
        status: 'pending'
      };
    }

    if (charges_enabled && payouts_enabled) {
      return {
        icon: <CheckCircle className="w-8 h-8 text-green-500" />,
        title: 'Account Active',
        description: 'Your Stripe account is fully set up and ready to receive payments.',
        borderClass: 'border-green-200',
        status: 'active'
      };
    }

    return {
      icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
      title: 'Account Restricted',
      description: 'Your account has some restrictions. Please complete additional verification.',
      borderClass: 'border-yellow-200',
      status: 'restricted'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className={`${isUnauthorized ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
            <AlertCircle className={`w-12 h-12 ${isUnauthorized ? 'text-yellow-500' : 'text-red-500'} mx-auto mb-4`} />
            <h2 className={`text-xl font-semibold ${isUnauthorized ? 'text-yellow-700' : 'text-red-700'} mb-2`}>
              {isUnauthorized ? 'Login Required' : 'Error'}
            </h2>
            <p className={`${isUnauthorized ? 'text-yellow-600' : 'text-red-600'} mb-4`}>{error}</p>
            {isUnauthorized ? (
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Log In
              </Link>
            ) : (
              <button
                onClick={fetchAccountStatus}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/marketplace/my-listings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Listings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your Stripe account and view your earnings from marketplace sales.
          </p>
        </div>

        {/* Account Status Card */}
        <div className={`bg-white rounded-xl shadow-sm border-2 p-6 mb-6 ${statusDisplay?.borderClass || 'border-gray-200'}`}>
          <div className="flex items-start gap-4">
            {statusDisplay?.icon}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{statusDisplay?.title}</h2>
              <p className="text-gray-600 mt-1">{statusDisplay?.description}</p>
              
              {/* Status indicators */}
              {accountStatus?.has_account && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <StatusBadge 
                    label="Onboarding" 
                    active={accountStatus?.onboarding_complete} 
                  />
                  <StatusBadge 
                    label="Can Receive Payments" 
                    active={accountStatus?.charges_enabled} 
                  />
                  <StatusBadge 
                    label="Payouts Enabled" 
                    active={accountStatus?.payouts_enabled} 
                  />
                </div>
              )}
            </div>
            
            <button
              onClick={fetchAccountStatus}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Onboarding URL fallback (if popup blocked) */}
        {onboardingUrl && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-blue-900 font-semibold text-lg">Complete Your Stripe Setup</p>
                <p className="text-blue-700 text-sm mt-1 mb-3">
                  Your browser blocked the popup. Click the button below to open Stripe onboarding:
                </p>
                <a 
                  href={onboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Open Stripe Onboarding
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Setup or Dashboard Button */}
          {!accountStatus?.has_account ? (
            <ActionCard
              icon={<CreditCard className="w-8 h-8" />}
              title="Set Up Payment Account"
              description="Connect your bank account through Stripe to receive payments from your sales."
              buttonText="Start Setup"
              buttonIcon={<ArrowUpRight className="w-4 h-4 ml-2" />}
              onClick={handleStartOnboarding}
              loading={actionLoading}
              primary
            />
          ) : !accountStatus?.onboarding_complete ? (
            <ActionCard
              icon={<RefreshCw className="w-8 h-8" />}
              title="Complete Onboarding"
              description="You started the setup process. Continue where you left off."
              buttonText="Continue Setup"
              buttonIcon={<ArrowUpRight className="w-4 h-4 ml-2" />}
              onClick={handleRefreshOnboarding}
              loading={actionLoading}
              primary
            />
          ) : (
            <ActionCard
              icon={<ExternalLink className="w-8 h-8" />}
              title="Stripe Dashboard"
              description="View detailed transactions, manage your bank account, and configure payout settings."
              buttonText="Open Stripe Dashboard"
              buttonIcon={<ExternalLink className="w-4 h-4 ml-2" />}
              onClick={handleOpenDashboard}
              loading={actionLoading}
              primary
            />
          )}

          {/* Seller Orders Link */}
          <ActionCard
            icon={<DollarSign className="w-8 h-8" />}
            title="View Sales"
            description="See all your marketplace orders and track shipments."
            buttonText="View Orders"
            buttonIcon={<ArrowUpRight className="w-4 h-4 ml-2" />}
            to="/marketplace/seller-orders"
          />
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Payments Work</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <InfoItem
              icon={<Building2 className="w-6 h-6 text-gold" />}
              title="Automatic Splits"
              description="When buyers pay, Stripe automatically splits the payment between you and the platform fee."
            />
            <InfoItem
              icon={<Wallet className="w-6 h-6 text-gold" />}
              title="Direct Payouts"
              description="Your earnings are sent directly to your bank account on a regular schedule (daily, weekly, or monthly)."
            />
            <InfoItem
              icon={<Shield className="w-6 h-6 text-gold" />}
              title="Secure & Protected"
              description="Stripe handles all payment processing, security, and fraud protection."
            />
          </div>
        </div>

        {/* Stripe Branding */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Payments powered by <span className="font-semibold text-[#635BFF]">Stripe</span></p>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ label, active }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    active 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-600'
  }`}>
    {active ? (
      <CheckCircle className="w-4 h-4 mr-1" />
    ) : (
      <Clock className="w-4 h-4 mr-1" />
    )}
    {label}
  </span>
);

// Action Card Component
const ActionCard = ({ icon, title, description, buttonText, buttonIcon, onClick, to, loading, primary }) => {
  const buttonClasses = primary
    ? 'bg-gold hover:bg-yellow-500 text-black'
    : 'bg-gray-900 hover:bg-gray-800 text-white';

  const content = (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="text-gold mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      
      {to ? (
        <Link
          to={to}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${buttonClasses}`}
        >
          {buttonText}
          {buttonIcon}
        </Link>
      ) : (
        <button
          onClick={onClick}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {buttonText}
              {buttonIcon}
            </>
          )}
        </button>
      )}
    </div>
  );

  return content;
};

// Info Item Component
const InfoItem = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 rounded-full mb-3">
      {icon}
    </div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default SellerPayments;
