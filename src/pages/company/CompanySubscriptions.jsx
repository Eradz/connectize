import React, { useEffect, useState } from 'react';
import subscriptionsApi from '../../api-services/subscriptions';
import { 
  Users, TrendingUp, DollarSign, BarChart, 
  Calendar, Download, Settings, AlertTriangle,
  CheckCircle, Crown, Building, UserPlus,
  FileText, Filter, Search, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CompanySubscriptions = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, subscriptionsRes, analyticsRes] = await Promise.all([
        subscriptionsApi.getCompanySubscriptionSummary().then(r => r.data || r),
        subscriptionsApi.getCompanySubscriptions().then(r => r.data || r),
        subscriptionsApi.getSubscriptionAnalytics().then(r => r.data || r),
      ]);
      
      setSummary(summaryRes);
      setSubscriptions(subscriptionsRes?.results || subscriptionsRes || []);
      setAnalytics(analyticsRes);
    } catch (e) {
      console.error('Failed to load company subscription data', e);
      setError('Unable to load subscription data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      trialing: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      past_due: 'bg-orange-100 text-orange-700',
      incomplete: 'bg-gray-100 text-gray-700',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.incomplete}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'enterprise': return <Building className="w-4 h-4 text-green-500" />;
      case 'professional': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  const exportData = () => {
    // Implementation for exporting subscription data
    const csvData = filteredSubscriptions.map(sub => ({
      User: sub.user?.name || 'N/A',
      Email: sub.user?.email || 'N/A',
      Plan: sub.plan?.name || 'N/A',
      Status: sub.status,
      'Monthly Cost': sub.plan?.price || 0,
      'Start Date': sub.started_at ? new Date(sub.started_at).toLocaleDateString() : 'N/A',
      'Next Billing': sub.next_payment_date ? new Date(sub.next_payment_date).toLocaleDateString() : 'N/A',
    }));
    
    console.log('Export data:', csvData);
    // Here you would implement actual CSV export functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Subscriptions</h1>
              <p className="text-gray-600">Manage and monitor all team subscriptions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'subscriptions', label: 'Subscriptions', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-2" />
                    <div className="h-6 w-1/3 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.total_users || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.active_subscriptions || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.total_monthly_cost || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annual Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.total_annual_cost || 0)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Plan Distribution */}
            {summary?.plan_distribution && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(summary.plan_distribution).map(([planName, count]) => (
                    <div key={planName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(planName)}
                        <span className="font-medium">{planName}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users, emails, or plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="trialing">Trial</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="past_due">Past Due</option>
                    </select>
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    {filteredSubscriptions.length} of {subscriptions.length} subscriptions
                  </span>
                </div>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Plan</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Cost</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Next Billing</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-4 px-6">
                            <div className="animate-pulse">
                              <div className="h-4 w-32 bg-gray-100 rounded mb-1" />
                              <div className="h-3 w-24 bg-gray-100 rounded" />
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                          </td>
                          <td className="py-4 px-6">
                            <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
                          </td>
                          <td className="py-4 px-6">
                            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                          </td>
                          <td className="py-4 px-6">
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                          </td>
                          <td className="py-4 px-6">
                            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">
                                {subscription.user?.name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {subscription.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              {getPlanIcon(subscription.plan?.plan_type)}
                              <span className="font-medium">{subscription.plan?.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(subscription.status)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium">
                              {formatCurrency(subscription.plan?.price || 0)}
                              <span className="text-sm text-gray-500">
                                /{subscription.plan?.billing_cycle === 'yearly' ? 'year' : 'month'}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {subscription.next_payment_date 
                                ? new Date(subscription.next_payment_date).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Link
                                to={`/company/users/${subscription.user?.id}/subscription`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Manage
                              </Link>
                              <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.total_revenue || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ARPU</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.average_revenue_per_user || 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(analytics.churn_rate * 100 || 0).toFixed(1)}%
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.active_subscribers || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Plan Popularity */}
            {analytics.plan_popularity && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Popularity</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.plan_popularity).map(([planName, data]) => (
                    <div key={planName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getPlanIcon(planName)}
                        <span className="font-medium">{planName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(data.percentage || 0)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {data.count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySubscriptions;
