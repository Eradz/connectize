import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCardIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { subscriptionsAPI } from '../../../api-services/subscriptions';

// Helper function to format plan features object into readable array
const formatPlanFeatures = (features) => {
  if (!features || typeof features !== 'object') return [];
  
  const featureList = [];
  
  // Extract key features from the features object
  if (features.content_limits) {
    const { posts_per_month, products_per_month, services_per_month } = features.content_limits;
    if (posts_per_month > 0) featureList.push(`${posts_per_month} posts/month`);
    if (products_per_month > 0) featureList.push(`${products_per_month} products/month`);
    if (services_per_month > 0) featureList.push(`${services_per_month} services/month`);
  }
  
  if (features.technical_limits) {
    const { storage_gb, team_members, api_calls_per_month } = features.technical_limits;
    if (storage_gb > 0) featureList.push(`${storage_gb}GB storage`);
    if (team_members > 0) featureList.push(`${team_members} team members`);
    if (api_calls_per_month > 0) featureList.push(`${api_calls_per_month.toLocaleString()} API calls/month`);
  }
  
  if (features.analytics_features) {
    if (features.analytics_features.basic_analytics) featureList.push('Basic Analytics');
    if (features.analytics_features.advanced_analytics) featureList.push('Advanced Analytics');
    if (features.analytics_features.api_access) featureList.push('API Access');
  }
  
  if (features.ai_features) {
    if (features.ai_features.ai_insights) featureList.push('AI Insights');
    if (features.ai_features.ai_matchmaking) featureList.push('AI Matchmaking');
    if (features.ai_features.ai_predictions) featureList.push('AI Predictions');
  }
  
  if (features.advertising_features) {
    if (features.advertising_features.featured_ads) featureList.push('Featured Ads');
    if (features.advertising_features.video_ads) featureList.push('Video Ads');
    if (features.advertising_features.real_time_bidding) featureList.push('Real-time Bidding');
  }
  
  if (features.support_features) {
    if (features.support_features.priority_support) featureList.push('Priority Support');
    if (features.support_features.dedicated_manager) featureList.push('Dedicated Manager');
  }
  
  if (features.branding_features) {
    if (features.branding_features.custom_branding) featureList.push('Custom Branding');
    if (features.branding_features.white_label) featureList.push('White Label');
  }
  
  return featureList;
};

const AdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions', 'plans', 'billing'
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  // Pagination meta
  const [subsCount, setSubsCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [billingCount, setBillingCount] = useState(0);
  const [page, setPage] = useState({ subscriptions: 1, plans: 1, billing: 1 });
  const [pageSize, setPageSize] = useState({ subscriptions: 10, plans: 10, billing: 10 });
  const [loading, setLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  // legacy pagination state removed; using server pagination
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ user_id: '', plan_id: '', status: 'active' });
  const [newPlan, setNewPlan] = useState({
    name: '', plan_type: 'starter', billing_cycle: 'monthly', price: 0, currency: 'USD',
    max_posts_per_month: 10, max_products_per_month: 5, max_services_per_month: 5,
    max_storage_gb: 1, max_team_members: 1, max_api_calls_per_month: 1000,
    max_ad_campaigns: 3, max_ad_spend_monthly: 1000,
    analytics_enabled: false, advanced_analytics: false, api_access_enabled: false,
    priority_support: false, custom_branding: false, white_label: false,
    ai_insights_enabled: false, ai_matchmaking_enabled: false, ai_predictions_enabled: false,
    ai_compliance_monitoring: false, custom_ai_models: false,
    featured_ads_enabled: false, promoted_listings: 0, spotlight_ads: 0, banner_ads: 0,
    video_ads_enabled: false, real_time_bidding: false,
    support_level: 'email', sla_response_hours: 48, dedicated_account_manager: false,
    description: '', tagline: '', popular: false, recommended: false,
    feature_highlights: [], feature_comparison: {}, estimated_roi: '',
    business_value_props: [], use_cases: [], success_stories: [],
    onboarding_included: false, dedicated_support: false, implementation_time: '',
    stripe_product_id: '', stripe_price_monthly_id: '', stripe_price_annual_id: '',
    is_active: true
  });
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editingSubscriptionData, setEditingSubscriptionData] = useState({ status: 'active', auto_renew: true, plan_id: '' });
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingPlanData, setEditingPlanData] = useState(null);

  // Load all data initially for tab counts
  useEffect(() => {
    loadAllDataForCounts();
  }, []);

  // Load specific data when tab changes or filters change (but not on initial mount)
  useEffect(() => {
    if (initialDataLoaded) {
      loadData();
    }
  }, [activeTab, page, pageSize, statusFilter, searchTerm, planFilter, initialDataLoaded]);

  const loadAllDataForCounts = async () => {
    try {
      setLoading(true);
      // Load all data in parallel to get accurate counts
      const [subscriptionsRes, plansRes, billingRes] = await Promise.all([
        subscriptionsAPI.getUserSubscriptions({ page: page.subscriptions, page_size: pageSize.subscriptions }),
        subscriptionsAPI.getAllPlans({ page: page.plans, page_size: pageSize.plans }),
        subscriptionsAPI.getBillingHistory({ page: page.billing, page_size: pageSize.billing })
      ]);

      setSubscriptions(subscriptionsRes?.results || subscriptionsRes || []);
      setSubsCount(subscriptionsRes?.count ?? (subscriptionsRes?.results ? subscriptionsRes.results.length : 0));
      setPlans(plansRes?.results || plansRes || []);
      setPlansCount(plansRes?.count ?? (plansRes?.results ? plansRes.results.length : 0));
      setBillingRecords(billingRes?.results || billingRes?.billing_history || []);
      setBillingCount(billingRes?.count ?? (billingRes?.results ? billingRes.results.length : (billingRes?.billing_history ? billingRes.billing_history.length : 0)));
      setInitialDataLoaded(true);
    } catch (error) {
      console.error('Failed to load initial data for counts:', error);
      setInitialDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'subscriptions') {
        const response = await subscriptionsAPI.getUserSubscriptions({
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          plan: planFilter !== 'all' ? planFilter : undefined,
          page: page.subscriptions,
          page_size: pageSize.subscriptions
        });
        setSubscriptions(response?.results || response || []);
        setSubsCount(response?.count ?? (response?.results ? response.results.length : 0));
      } else if (activeTab === 'plans') {
        const response = await subscriptionsAPI.getAllPlans({ page: page.plans, page_size: pageSize.plans });
        setPlans(response?.results || response || []);
        setPlansCount(response?.count ?? (response?.results ? response.results.length : 0));
      } else if (activeTab === 'billing') {
        const response = await subscriptionsAPI.getBillingHistory({
          search: searchTerm,
          page: page.billing,
          page_size: pageSize.billing
        });
        setBillingRecords(response?.results || response?.billing_history || []);
        setBillingCount(response?.count ?? (response?.results ? response.results.length : (response?.billing_history ? response.billing_history.length : 0)));
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      // Show error state instead of mock data
      if (activeTab === 'subscriptions') {
        setSubscriptions([]);
      } else if (activeTab === 'plans') {
        setPlans([]);
      } else if (activeTab === 'billing') {
        setBillingRecords([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      await subscriptionsAPI.updateSubscription(subscriptionId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Failed to update subscription status:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'cancel') {
        await Promise.all(selectedItems.map(id => 
          subscriptionsAPI.cancelSubscription(id)
        ));
      } else if (action === 'reactivate') {
        await Promise.all(selectedItems.map(id => 
          subscriptionsAPI.reactivateSubscription(id)
        ));
      }
      setSelectedItems([]);
      loadData();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  // CRUD Operation Handlers
  const handleCreateSubscription = async (subscriptionData) => {
    try {
      await subscriptionsAPI.createSubscription(subscriptionData);
      loadData();
  setShowCreateSubscriptionModal(false);
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  const handleEditSubscription = async (id, subscriptionData) => {
    try {
      await subscriptionsAPI.updateSubscription(id, subscriptionData);
      loadData();
      // Show success message or close modal
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await subscriptionsAPI.deleteSubscription(id);
      loadData();
      // Show success message
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    }
  };

  const handleCreatePlan = async (planData) => {
    try {
      await subscriptionsAPI.createPlan(planData);
      loadData();
  setShowCreatePlanModal(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleEditPlan = async (id, planData) => {
    try {
      await subscriptionsAPI.updatePlan(id, planData);
      loadData();
      // Show success message or close modal
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await subscriptionsAPI.deletePlan(id);
      loadData();
      // Show success message
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (activeTab === 'subscriptions') {
        await Promise.all(selectedItems.map(id => 
          subscriptionsAPI.deleteSubscription(id)
        ));
      } else if (activeTab === 'plans') {
        await Promise.all(selectedItems.map(id => 
          subscriptionsAPI.deletePlan(id)
        ));
      }
      setSelectedItems([]);
      loadData();
    } catch (error) {
      console.error('Failed to perform bulk delete:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', label: 'Active' },
  cancelled: { color: 'bg-gray-200 text-gray-700', label: 'Cancelled' },
      trialing: { color: 'bg-blue-100 text-blue-800', label: 'Trial' },
      past_due: { color: 'bg-red-100 text-red-800', label: 'Past Due' },
      canceled: { color: 'bg-gray-100 text-gray-800', label: 'Canceled' },
      unpaid: { color: 'bg-yellow-100 text-yellow-800', label: 'Unpaid' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon, count: subsCount },
    { id: 'plans', label: 'Plans', icon: DocumentTextIcon, count: plansCount },
    { id: 'billing', label: 'Billing', icon: BanknotesIcon, count: billingCount }
  ];

  const renderSubscriptionsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === subscriptions.length && subscriptions.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(subscriptions.map(sub => sub.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-gold focus:ring-primary-500/30"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(subscription.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, subscription.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== subscription.id));
                    }
                  }}
                  className="rounded border-gray-300 text-gold focus:ring-primary-500/30"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{subscription.user.name}</div>
                  <div className="text-sm text-gray-500">{subscription.user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{subscription.plan.name}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(subscription.plan.price)}/month</div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(subscription.status)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  <div>{formatDate(subscription.current_period_start)}</div>
                  <div className="text-gray-500">to {formatDate(subscription.current_period_end)}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {subscription.payment_method || 'No payment method'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/subscriptions/${subscription.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Subscription"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleStatusChange(subscription.id, subscription.status === 'active' ? 'canceled' : 'active')}
                    className={`${subscription.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                    title={subscription.status === 'active' ? 'Cancel Subscription' : 'Reactivate Subscription'}
                  >
                    {subscription.status === 'active' ? 
                      <XCircleIcon className="w-4 h-4" /> : 
                      <CheckCircleIcon className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubscription(subscription);
                      setEditingSubscriptionData({
                        status: subscription.status,
                        auto_renew: subscription.auto_renew,
                        plan_id: subscription.plan?.id || ''
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Subscription"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlansTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subscribers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Features
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {plans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{plan.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {formatCurrency(plan.price)}/{plan.interval}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {plan.subscribers}
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(plan.is_active ? 'active' : 'inactive')}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {(() => {
                    const featureList = formatPlanFeatures(plan.features);
                    return (
                      <>
                        {featureList.slice(0, 2).map((feature, index) => (
                          <div key={index} className="text-xs text-gray-600">• {feature}</div>
                        ))}
                        {featureList.length > 2 && (
                          <div className="text-xs text-gray-500">+{featureList.length - 2} more</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* Handle view */}}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Plan"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setEditingPlanData({ ...plan });
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Plan"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Plan"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBillingTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {billingRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">#{record.id.toString().padStart(6, '0')}</div>
                  <div className="text-sm text-gray-500">{record.description}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{record.user.name}</div>
                  <div className="text-sm text-gray-500">{record.user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(record.amount)}
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(record.status)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(record.invoice_date)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{record.payment_method}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* Handle view invoice */}}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Invoice"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {record.status === 'failed' && (
                    <button
                      onClick={() => {/* Handle retry payment */}}
                      className="text-green-600 hover:text-green-700"
                      title="Retry Payment"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header Card */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Subscription Management
            </h1>
            <p className="text-gray-600 mt-1">Manage subscriptions, plans, and billing</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/subscriptions/analytics'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </button>
            {activeTab === 'subscriptions' && (
              <button
                onClick={() => setShowCreateSubscriptionModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-medium"
              >
                New Subscription
              </button>
            )}
            {activeTab === 'plans' && (
              <button
                onClick={() => setShowCreatePlanModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-medium"
              >
                New Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedItems([]);
                  setPage(prev => ({ ...prev, [tab.id]: 1 }));
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg backdrop-blur-xl'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-xl'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100/80 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-500/30/50 focus:border-primary-500/50 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 'subscriptions' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-500/30/50 focus:border-primary-500/50 transition-all duration-200 text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trial</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                </select>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-500/30/50 focus:border-primary-500/50 transition-all duration-200 text-gray-700"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </>
            )}
            <button
              onClick={loadData}
              className="px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl text-gray-700 rounded-xl hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
                </button>
              </div>
            </div>
          </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && activeTab === 'subscriptions' && (
        <div className="backdrop-blur-xl bg-gold/20 border border-blue-300/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-semibold">
              {selectedItems.length} subscription(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 text-white rounded-xl text-sm hover:from-red-600/90 hover:to-red-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('reactivate')}
                className="px-4 py-2 bg-gradient-to-r from-green-500/90 to-green-600/90 text-white rounded-xl text-sm hover:from-green-600/90 hover:to-green-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Reactivate
              </button>
            </div>
          </div>
        </div>
          )}

          {/* Content Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {activeTab === 'subscriptions' && renderSubscriptionsTable()}
            {activeTab === 'plans' && renderPlansTable()}
            {activeTab === 'billing' && renderBillingTable()}

            {((activeTab === 'subscriptions' && subscriptions.length === 0) ||
              (activeTab === 'plans' && plans.length === 0) ||
              (activeTab === 'billing' && billingRecords.length === 0)) && (
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : `No ${activeTab} available at the moment`
                  }
                </p>
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-sm">
              <span>Rows per page:</span>
              <select
                className="border rounded px-2 py-1"
                value={pageSize[activeTab]}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 10;
                  setPageSize(ps => ({ ...ps, [activeTab]: val }));
                  setPage(p => ({ ...p, [activeTab]: 1 }));
                }}
              >
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-gray-500">
                {(() => {
                  const currentPage = page[activeTab];
                  const size = pageSize[activeTab];
                  const total = activeTab === 'subscriptions' ? subsCount : activeTab === 'plans' ? plansCount : billingCount;
                  const start = total === 0 ? 0 : (currentPage - 1) * size + 1;
                  const end = Math.min(currentPage * size, total);
                  return `${start}-${end} of ${total}`;
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-40"
                disabled={page[activeTab] === 1}
                onClick={() => setPage(p => ({ ...p, [activeTab]: Math.max(1, p[activeTab]-1) }))}
              >Prev</button>
              <span className="text-sm">Page {page[activeTab]}</span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-40"
                disabled={(() => {
                  const total = activeTab === 'subscriptions' ? subsCount : activeTab === 'plans' ? plansCount : billingCount;
                  return page[activeTab] * pageSize[activeTab] >= total;
                })()}
                onClick={() => setPage(p => ({ ...p, [activeTab]: p[activeTab] + 1 }))}
              >Next</button>
            </div>
          </div>
          {/* Create Subscription Modal */}
          {showCreateSubscriptionModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Create Subscription</h3>
                  <button onClick={() => setShowCreateSubscriptionModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input value={newSubscription.user_id} onChange={e=>setNewSubscription({...newSubscription,user_id:e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="UUID of user" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan ID</label>
                    <input value={newSubscription.plan_id} onChange={e=>setNewSubscription({...newSubscription,plan_id:e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="UUID of plan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={newSubscription.status} onChange={e=>setNewSubscription({...newSubscription,status:e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      <option value="active">Active</option>
                      <option value="trialing">Trialing</option>
                      <option value="past_due">Past Due</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={()=>setShowCreateSubscriptionModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button onClick={()=>handleCreateSubscription(newSubscription)} className="px-4 py-2 rounded-lg bg-gold text-dark">Create</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Create Plan Modal */}
          {showCreatePlanModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Create Plan</h3>
                  <button onClick={() => setShowCreatePlanModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-8">
                  {/* Basic Info */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input value={newPlan.name} onChange={e=>setNewPlan({...newPlan,name:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Plan Type</label>
                      <select value={newPlan.plan_type} onChange={e=>setNewPlan({...newPlan,plan_type:e.target.value})} className="w-full border rounded-lg px-3 py-2">
                        {['trial','starter','professional','enterprise','custom'].map(p=> <option key={p} value={p}>{p}</option> )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                      <select value={newPlan.billing_cycle} onChange={e=>setNewPlan({...newPlan,billing_cycle:e.target.value})} className="w-full border rounded-lg px-3 py-2">
                        {['monthly','yearly'].map(c=> <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <input type="number" value={newPlan.price} onChange={e=>setNewPlan({...newPlan,price:Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <input value={newPlan.currency} onChange={e=>setNewPlan({...newPlan,currency:e.target.value.toUpperCase()})} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" checked={newPlan.is_active} onChange={e=>setNewPlan({...newPlan,is_active:e.target.checked})}/>
                      <span className="text-sm">Active</span>
                    </div>
                  </section>
                  {/* Limits */}
                  <section>
                    <h4 className="font-semibold mb-2 text-sm">Limits</h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      {[
                        ['max_posts_per_month','Posts'],['max_products_per_month','Products'],['max_services_per_month','Services'],
                        ['max_storage_gb','Storage GB'],['max_team_members','Team'],['max_api_calls_per_month','API Calls'],
                        ['max_ad_campaigns','Ad Campaigns'],['max_ad_spend_monthly','Ad Spend']
                      ].map(([k,label])=> (
                        <div key={k}>
                          <label className="block text-xs mb-1">{label}</label>
                          <input type="number" value={newPlan[k]} onChange={e=>setNewPlan({...newPlan,[k]:Number(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm"/>
                        </div>
                      ))}
                    </div>
                  </section>
                  {/* Toggles */}
                  <section>
                    <h4 className="font-semibold mb-2 text-sm">Feature Flags</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {[
                        'analytics_enabled','advanced_analytics','api_access_enabled','priority_support','custom_branding','white_label',
                        'ai_insights_enabled','ai_matchmaking_enabled','ai_predictions_enabled','ai_compliance_monitoring','custom_ai_models',
                        'featured_ads_enabled','video_ads_enabled','real_time_bidding','dedicated_account_manager','onboarding_included','dedicated_support','popular','recommended'
                      ].map(flag => (
                        <label key={flag} className="flex items-center gap-2">
                          <input type="checkbox" checked={newPlan[flag]} onChange={e=>setNewPlan({...newPlan,[flag]:e.target.checked})}/>
                          <span className="capitalize">{flag.replace(/_/g,' ')}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                  {/* Ads counts */}
                  <section>
                    <h4 className="font-semibold mb-2 text-sm">Ads Inventory</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ['promoted_listings','Promoted'],['spotlight_ads','Spotlight'],['banner_ads','Banner']
                      ].map(([k,label])=> (
                        <div key={k}>
                          <label className="block text-xs mb-1">{label}</label>
                          <input type="number" value={newPlan[k]} onChange={e=>setNewPlan({...newPlan,[k]:Number(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm"/>
                        </div>
                      ))}
                    </div>
                  </section>
                  {/* Support */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Support Level</label>
                      <input value={newPlan.support_level} onChange={e=>setNewPlan({...newPlan,support_level:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">SLA Hours</label>
                      <input type="number" value={newPlan.sla_response_hours} onChange={e=>setNewPlan({...newPlan,sla_response_hours:Number(e.target.value)})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Implementation Time</label>
                      <input value={newPlan.implementation_time} onChange={e=>setNewPlan({...newPlan,implementation_time:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                  </section>
                  {/* Descriptive Fields */}
                  <section className="space-y-3">
                    {[
                      ['tagline','Tagline'],['estimated_roi','Estimated ROI']
                    ].map(([k,label])=> (
                      <div key={k}>
                        <label className="block text-sm mb-1">{label}</label>
                        <input value={newPlan[k]} onChange={e=>setNewPlan({...newPlan,[k]:e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm mb-1">Description</label>
                      <textarea rows={3} value={newPlan.description} onChange={e=>setNewPlan({...newPlan,description:e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                    </div>
                  </section>
                  {/* Provider IDs */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ['stripe_product_id','Stripe Product'],['stripe_price_monthly_id','Stripe Monthly Price'],['stripe_price_annual_id','Stripe Annual Price']
                    ].map(([k,label]) => (
                      <div key={k}>
                        <label className="block text-sm mb-1">{label}</label>
                        <input value={newPlan[k]||''} onChange={e=>setNewPlan({...newPlan,[k]:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                      </div>
                    ))}
                  </section>
                  {/* Arrays (comma delimited) */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ['feature_highlights','Feature Highlights'],['business_value_props','Business Value Props'],['use_cases','Use Cases']
                    ].map(([k,label])=> (
                      <div key={k}>
                        <label className="block text-sm mb-1">{label} (comma separated)</label>
                        <input value={newPlan[k].join(',')} onChange={e=>setNewPlan({...newPlan,[k]:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})} className="w-full border rounded px-2 py-2 text-sm"/>
                      </div>
                    ))}
                  </section>
                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-4">
                    <button onClick={()=>setShowCreatePlanModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button onClick={()=>handleCreatePlan(newPlan)} className="px-4 py-2 rounded-lg bg-gold text-dark">Create Plan</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Subscription Modal */}
          {editingSubscription && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Edit Subscription</h3>
                  <button onClick={() => setEditingSubscription(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={editingSubscriptionData.status} onChange={e=>setEditingSubscriptionData({...editingSubscriptionData,status:e.target.value})} className="w-full border rounded px-3 py-2 text-sm">
                      {['active','trialing','past_due','canceled','cancelled','unpaid','paused'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editingSubscriptionData.auto_renew} onChange={e=>setEditingSubscriptionData({...editingSubscriptionData,auto_renew:e.target.checked})} />
                    <span className="text-sm">Auto Renew</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan ID (change)</label>
                    <input value={editingSubscriptionData.plan_id} onChange={e=>setEditingSubscriptionData({...editingSubscriptionData,plan_id:e.target.value})} className="w-full border rounded px-3 py-2 text-sm"/>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={()=>setEditingSubscription(null)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
                    <button onClick={async ()=>{ await handleEditSubscription(editingSubscription.id, editingSubscriptionData); setEditingSubscription(null); }} className="px-4 py-2 rounded-lg bg-gold text-dark text-sm">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Plan Modal */}
          {editingPlan && editingPlanData && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Edit Plan</h3>
                  <button onClick={() => { setEditingPlan(null); setEditingPlanData(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Name</label>
                    <input value={editingPlanData.name} onChange={e=>setEditingPlanData({...editingPlanData,name:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Plan Type</label>
                    <select value={editingPlanData.plan_type} onChange={e=>setEditingPlanData({...editingPlanData,plan_type:e.target.value})} className="w-full border rounded px-2 py-2 text-sm">
                      {['trial','starter','professional','enterprise','custom'].map(p=> <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Billing Cycle</label>
                    <select value={editingPlanData.billing_cycle} onChange={e=>setEditingPlanData({...editingPlanData,billing_cycle:e.target.value})} className="w-full border rounded px-2 py-2 text-sm">
                      {['monthly','yearly'].map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Price</label>
                    <input type="number" value={editingPlanData.price} onChange={e=>setEditingPlanData({...editingPlanData,price:Number(e.target.value)})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Currency</label>
                    <input value={editingPlanData.currency} onChange={e=>setEditingPlanData({...editingPlanData,currency:e.target.value.toUpperCase()})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" checked={editingPlanData.is_active} onChange={e=>setEditingPlanData({...editingPlanData,is_active:e.target.checked})}/>
                    <span className="text-sm">Active</span>
                  </div>
                </section>
                <section>
                  <h4 className="font-semibold mb-2 text-sm">Limits</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {['max_posts_per_month','max_products_per_month','max_services_per_month','max_storage_gb','max_team_members','max_api_calls_per_month','max_ad_campaigns','max_ad_spend_monthly'].map(k => (
                      <div key={k}>
                        <label className="block text-xs mb-1">{k.replace(/_/g,' ')}</label>
                        <input type="number" value={editingPlanData[k]} onChange={e=>setEditingPlanData({...editingPlanData,[k]:Number(e.target.value)})} className="w-full border rounded px-2 py-1 text-xs"/>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="font-semibold mb-2 text-sm">Feature Flags</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {['analytics_enabled','advanced_analytics','api_access_enabled','priority_support','custom_branding','white_label','ai_insights_enabled','ai_matchmaking_enabled','ai_predictions_enabled','ai_compliance_monitoring','custom_ai_models','featured_ads_enabled','video_ads_enabled','real_time_bidding','dedicated_account_manager','onboarding_included','dedicated_support','popular','recommended'].map(flag => (
                      <label key={flag} className="flex items-center gap-2">
                        <input type="checkbox" checked={editingPlanData[flag]} onChange={e=>setEditingPlanData({...editingPlanData,[flag]:e.target.checked})}/>
                        <span className="capitalize">{flag.replace(/_/g,' ')}</span>
                      </label>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="font-semibold mb-2 text-sm">Ads Inventory</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['promoted_listings','spotlight_ads','banner_ads'].map(k => (
                      <div key={k}>
                        <label className="block text-xs mb-1">{k.replace(/_/g,' ')}</label>
                        <input type="number" value={editingPlanData[k]} onChange={e=>setEditingPlanData({...editingPlanData,[k]:Number(e.target.value)})} className="w-full border rounded px-2 py-1 text-xs"/>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Support Level</label>
                    <input value={editingPlanData.support_level} onChange={e=>setEditingPlanData({...editingPlanData,support_level:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">SLA Hours</label>
                    <input type="number" value={editingPlanData.sla_response_hours} onChange={e=>setEditingPlanData({...editingPlanData,sla_response_hours:Number(e.target.value)})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Implementation Time</label>
                    <input value={editingPlanData.implementation_time} onChange={e=>setEditingPlanData({...editingPlanData,implementation_time:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                </section>
                <section className="space-y-2">
                  {['tagline','estimated_roi'].map(k => (
                    <div key={k}>
                      <label className="block text-xs mb-1">{k.replace(/_/g,' ')}</label>
                      <input value={editingPlanData[k]||''} onChange={e=>setEditingPlanData({...editingPlanData,[k]:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs mb-1">Description</label>
                    <textarea rows={3} value={editingPlanData.description||''} onChange={e=>setEditingPlanData({...editingPlanData,description:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                  </div>
                </section>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['stripe_product_id','stripe_price_monthly_id','stripe_price_annual_id'].map(k => (
                    <div key={k}>
                      <label className="block text-xs mb-1">{k.replace(/_/g,' ')}</label>
                      <input value={editingPlanData[k]||''} onChange={e=>setEditingPlanData({...editingPlanData,[k]:e.target.value})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                  ))}
                </section>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['feature_highlights','business_value_props','use_cases'].map(k => (
                    <div key={k}>
                      <label className="block text-xs mb-1">{k.replace(/_/g,' ')} (comma separated)</label>
                      <input value={(editingPlanData[k]||[]).join(',')} onChange={e=>setEditingPlanData({...editingPlanData,[k]:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})} className="w-full border rounded px-2 py-2 text-sm"/>
                    </div>
                  ))}
                </section>
                <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-4">
                  <button onClick={()=>{setEditingPlan(null); setEditingPlanData(null);}} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
                  <button onClick={async ()=>{ await handleEditPlan(editingPlan.id, editingPlanData); setEditingPlan(null); setEditingPlanData(null); }} className="px-4 py-2 rounded-lg bg-gold text-dark text-sm">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
  );
};

export default AdminSubscriptions;
