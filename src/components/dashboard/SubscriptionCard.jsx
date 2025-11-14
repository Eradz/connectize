import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  ArrowUpRight 
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import subscriptionsApi from '../../api-services/subscriptions';
import CardIcon from '../../icon/CardIcon';

const SubscriptionCard = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getCurrentSubscription();
      setSubscriptionData(response.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-600" />;
      case 'professional':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'premium':
        return <Zap className="w-6 h-6 text-yellow-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100';
      case 'professional':
        return 'bg-blue-100';
      case 'premium':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            Trial
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Past Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatNextBillingDate = (subscription) => {
    if (!subscription) return 'N/A';
    
    // Try different possible date fields
    const nextDate = subscription.next_payment_date || 
                     subscription.current_period_end ||
                     subscription.next_billing_date;
    
    if (nextDate) {
      const date = new Date(nextDate);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    return 'N/A';
  };

  const formatPrice = (subscription) => {
    if (!subscription) return '$0';
    
    const amount = subscription.plan?.price || 
                   subscription.billing_info?.next_billing_amount ||
                   subscription.amount ||
                   0;
    
    return `$${amount}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !subscriptionData?.subscription) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <CardIcon/>
            <p className="text-sm font-medium text-gray-600">Subscription</p>
            <p className="font-bold text-gray-900">No Plan</p>
            <Link 
              to={webRoutes.subscriptions}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1"
            >
              Choose a plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subscription = subscriptionData.subscription;
  const planName = subscription.plan?.name || subscription.plan_name || 'Unknown Plan';
  const planType = subscription.plan?.tier || subscription.plan?.type || planName;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex items-center gap-2 mb-2">
             <CardIcon/>
            <p className="text-sm md:text-[14px] font-medium text-gray-600">Subscription</p>
            {getStatusBadge(subscription.status)}
          </div>
          
          <div className="mb-2">
            <p className="text-xl font-bold text-gray-900">{planName}</p>
            <p className="text-sm text-gray-600">
              {formatPrice(subscription)}/month
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              Next billing: {formatNextBillingDate(subscription)}
            </p>
            
            <Link 
              to={webRoutes.subscriptions}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              Manage subscription
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${getPlanColor(planType)}`}>
          {getPlanIcon(planType)}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
