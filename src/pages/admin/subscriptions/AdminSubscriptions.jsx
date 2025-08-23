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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, statusFilter, searchTerm, planFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'subscriptions') {
        const response = await subscriptionsAPI.getUserSubscriptions({
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          plan: planFilter !== 'all' ? planFilter : undefined
        });
        setSubscriptions(response?.results || []);
      } else if (activeTab === 'plans') {
        const response = await subscriptionsAPI.getAllPlans();
        setPlans(response?.results || []);
      } else if (activeTab === 'billing') {
        const response = await subscriptionsAPI.getBillingHistory({
          search: searchTerm
        });
        setBillingRecords(response?.results || []);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      
      // Use mock data for demonstration based on active tab
      if (activeTab === 'subscriptions') {
        setSubscriptions([
          {
            id: 1,
            user: { name: 'John Doe', email: 'john@example.com' },
            plan: { name: 'Professional', price: 49.99 },
            status: 'active',
            current_period_start: '2024-08-01T00:00:00Z',
            current_period_end: '2024-09-01T00:00:00Z',
            created_at: '2024-07-15T10:30:00Z',
            payment_method: 'card_ending_4242'
          },
          {
            id: 2,
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            plan: { name: 'Enterprise', price: 199.99 },
            status: 'past_due',
            current_period_start: '2024-07-15T00:00:00Z',
            current_period_end: '2024-08-15T00:00:00Z',
            created_at: '2024-06-20T14:15:00Z',
            payment_method: 'card_ending_1234'
          },
          {
            id: 3,
            user: { name: 'Bob Wilson', email: 'bob@example.com' },
            plan: { name: 'Starter', price: 19.99 },
            status: 'trialing',
            current_period_start: '2024-08-10T00:00:00Z',
            current_period_end: '2024-08-24T00:00:00Z',
            created_at: '2024-08-10T09:00:00Z',
            payment_method: null
          }
        ]);
      } else if (activeTab === 'plans') {
        // Use actual API data with proper mapping
        const response = await subscriptionsAPI.getAllPlans();
        if (response?.results && response.results.length > 0) {
          // Map API data to expected format
          const mappedPlans = response.results.map(plan => ({
            ...plan,
            // Add some computed fields for the UI
            subscribers: Math.floor(Math.random() * 200), // Mock subscriber count
            active: plan.is_active,
            interval: plan.billing_cycle,
            // Keep features as object for proper processing
          }));
          setPlans(mappedPlans);
        } else {
          // Fallback to mock data if no real data
          setPlans([
            {
              id: 1,
              name: 'Starter',
              price: 19.99,
              interval: 'month',
              features: {
                content_limits: { posts_per_month: 50, products_per_month: 25 },
                technical_limits: { storage_gb: 10, team_members: 3 },
                analytics_features: { basic_analytics: true },
                support_features: { support_level: 'email' }
              },
              active: true,
              subscribers: 156
            },
            {
              id: 2,
              name: 'Professional',
              price: 49.99,
              interval: 'month',
              features: {
                content_limits: { posts_per_month: 200, products_per_month: 100 },
                technical_limits: { storage_gb: 50, team_members: 10 },
                analytics_features: { basic_analytics: true, advanced_analytics: true },
                ai_features: { ai_insights: true },
                support_features: { support_level: 'email', priority_support: true }
              },
              active: true,
              subscribers: 89
            }
          ]);
        }
      } else if (activeTab === 'billing') {
        setBillingRecords([
          {
            id: 1,
            subscription_id: 1,
            user: { name: 'John Doe', email: 'john@example.com' },
            amount: 49.99,
            status: 'paid',
            invoice_date: '2024-08-01T00:00:00Z',
            payment_method: 'card_ending_4242',
            description: 'Professional Plan - Monthly',
            transaction_type: 'charge'
          },
          {
            id: 2,
            subscription_id: 2,
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            amount: 199.99,
            status: 'failed',
            invoice_date: '2024-08-15T00:00:00Z',
            payment_method: 'card_ending_1234',
            description: 'Enterprise Plan - Monthly',
            transaction_type: 'charge'
          },
          {
            id: 3,
            subscription_id: 3,
            user: { name: 'Bob Wilson', email: 'bob@example.com' },
            amount: 19.99,
            status: 'paid',
            invoice_date: '2024-08-10T00:00:00Z',
            payment_method: 'card_ending_9876',
            description: 'Starter Plan - Monthly',
            transaction_type: 'charge'
          },
          {
            id: 4,
            subscription_id: 1,
            user: { name: 'John Doe', email: 'john@example.com' },
            amount: 49.99,
            status: 'paid',
            invoice_date: '2024-07-01T00:00:00Z',
            payment_method: 'card_ending_4242',
            description: 'Professional Plan - Monthly',
            transaction_type: 'charge'
          },
          {
            id: 5,
            subscription_id: 4,
            user: { name: 'Sarah Chen', email: 'sarah@example.com' },
            amount: 299.99,
            status: 'paid',
            invoice_date: '2024-08-20T00:00:00Z',
            payment_method: 'card_ending_5555',
            description: 'Enterprise Plan - Monthly',
            transaction_type: 'charge'
          },
          {
            id: 6,
            subscription_id: 2,
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            amount: -99.99,
            status: 'processed',
            invoice_date: '2024-08-16T00:00:00Z',
            payment_method: 'card_ending_1234',
            description: 'Partial refund for failed payment',
            transaction_type: 'refund'
          }
        ]);
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
      // Show success message or close modal
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
      // Show success message or close modal
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
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon, count: subscriptions.length },
    { id: 'plans', label: 'Plans', icon: DocumentTextIcon, count: plans.length },
    { id: 'billing', label: 'Billing', icon: BanknotesIcon, count: billingRecords.length }
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
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    onClick={() => {/* Handle edit */}}
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
                {getStatusBadge(plan.active ? 'active' : 'inactive')}
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
                    onClick={() => {/* Handle edit */}}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Plan"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* Handle delete */}}
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
                  setCurrentPage(1);
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
                className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 'subscriptions' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
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
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
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
        <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-300/30 rounded-2xl p-6 shadow-xl">
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
        </div>
  );
};

export default AdminSubscriptions;
