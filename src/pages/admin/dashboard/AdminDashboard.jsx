import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../../components/admin/dashboard/StatsCard';
import { adminStatsApi } from '../../../api-services/adminStats';
import { webRoutes } from '../../../lib/webRoutes';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, active: 0 },
    companies: { total: 0, verified: 0, pending: 0 },
    products: { total: 0, approved: 0, pending: 0 },
    services: { total: 0, active: 0, pending: 0 },
    orders: { total: 0, revenue: 0, completed: 0 },
    posts: { total: 0, published: 0, pending: 0 },
    messages: { total: 0, today: 0 },
    dealRooms: { total: 0, active: 0, completed: 0 },
    jobs: { total: 0, active: 0, filled: 0 },
    logistics: { total: 0, pending: 0, delivered: 0 },
    knowledgeBase: { total: 0, articles: 0, forums: 0 },
    subscriptions: { total: 0, active: 0, revenue: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from your admin stats API
      // For now, we'll use mock data
      setStats({
        users: { total: 15420, new: 234, active: 12890 },
        companies: { total: 3456, verified: 2890, pending: 566 },
        products: { total: 8910, approved: 7650, pending: 1260 },
        services: { total: 5670, active: 4890, pending: 780 },
        orders: { total: 12340, revenue: 987654, completed: 11200 },
        posts: { total: 23450, published: 21200, pending: 2250 },
        messages: { total: 567890, today: 1234 },
        dealRooms: { total: 456, active: 234, completed: 167 },
        jobs: { total: 1890, active: 567, filled: 890 },
        logistics: { total: 3450, pending: 234, delivered: 2890 },
        knowledgeBase: { total: 890, articles: 567, forums: 123 },
        subscriptions: { total: 5678, active: 4890, revenue: 234567 }
      });

      setRecentActivities([
        { id: 1, type: 'user', action: 'New user registration', user: 'John Doe', time: '2 minutes ago' },
        { id: 2, type: 'order', action: 'New order placed', user: 'Acme Corp', time: '5 minutes ago' },
        { id: 3, type: 'product', action: 'Product approved', user: 'Oil Tech Solutions', time: '10 minutes ago' },
        { id: 4, type: 'deal', action: 'Deal room created', user: 'Energy Partners', time: '15 minutes ago' },
        { id: 5, type: 'job', action: 'Job posting approved', user: 'Drilling Inc', time: '20 minutes ago' }
      ]);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const quickActions = [
    {
      title: 'Manage Deal Rooms',
      description: 'View and manage all deal room activities',
      icon: BriefcaseIcon,
      color: 'blue',
      route: '/admin/deals',
      stats: `${stats.dealRooms.active} active`
    },
    {
      title: 'Workforce Management',
      description: 'Oversee job postings and professional profiles',
      icon: UsersIcon,
      color: 'green',
      route: '/admin/workforce',
      stats: `${stats.jobs.active} active jobs`
    },
    {
      title: 'Logistics Hub',
      description: 'Monitor logistics requests and shipments',
      icon: TruckIcon,
      color: 'orange',
      route: '/admin/logistics',
      stats: `${stats.logistics.pending} pending`
    },
    {
      title: 'Knowledge Base',
      description: 'Manage articles, forums, and knowledge content',
      icon: AcademicCapIcon,
      color: 'purple',
      route: '/admin/knowledge',
      stats: `${stats.knowledgeBase.articles} articles`
    },
    {
      title: 'Subscriptions',
      description: 'Handle subscription plans and billing',
      icon: CreditCardIcon,
      color: 'indigo',
      route: '/admin/subscriptions',
      stats: `${stats.subscriptions.active} active`
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and verification',
      icon: UsersIcon,
      color: 'emerald',
      route: '/admin/users',
      stats: `${stats.users.new} new today`
    }
  ];

  const pendingApprovals = [
    { type: 'Deal Room', count: 12, route: '/admin/deals/pending' },
    { type: 'Job Postings', count: 8, route: '/admin/workforce/pending' },
    { type: 'Company Verification', count: 23, route: '/admin/companies/verification' },
    { type: 'Knowledge Articles', count: 5, route: '/admin/knowledge/pending' },
    { type: 'Product Listings', count: 45, route: '/admin/products/approval' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive overview of the Connectize platform
        </p>
      </div>

          {/* Core Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={formatNumber(stats.users.total)}
              change="+12.5%"
              changeType="increase"
              icon={UsersIcon}
              color="blue"
              loading={loading}
            />
            <StatsCard
              title="Active Companies"
              value={formatNumber(stats.companies.verified)}
              change="+8.3%"
              changeType="increase"
              icon={BuildingOfficeIcon}
              color="green"
              loading={loading}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.orders.revenue)}
              change="+15.2%"
              changeType="increase"
              icon={ChartBarIcon}
              color="emerald"
              loading={loading}
            />
            <StatsCard
              title="Active Subscriptions"
              value={formatNumber(stats.subscriptions.active)}
              change="+6.8%"
              changeType="increase"
              icon={CreditCardIcon}
              color="purple"
              loading={loading}
            />
          </div>

          {/* New Platform Modules Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Deal Rooms"
              value={formatNumber(stats.dealRooms.total)}
              change="+23.1%"
              changeType="increase"
              icon={BriefcaseIcon}
              color="blue"
              loading={loading}
            />
            <StatsCard
              title="Job Postings"
              value={formatNumber(stats.jobs.total)}
              change="+18.7%"
              changeType="increase"
              icon={UsersIcon}
              color="green"
              loading={loading}
            />
            <StatsCard
              title="Logistics Requests"
              value={formatNumber(stats.logistics.total)}
              change="+11.4%"
              changeType="increase"
              icon={TruckIcon}
              color="orange"
              loading={loading}
            />
            <StatsCard
              title="Knowledge Articles"
              value={formatNumber(stats.knowledgeBase.articles)}
              change="+9.2%"
              changeType="increase"
              icon={AcademicCapIcon}
              color="purple"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Platform Management</h2>
                  <Link 
                    to="/admin/overview"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all modules
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        to={action.route}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform ${
                            action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            action.color === 'green' ? 'bg-green-100 text-green-600' :
                            action.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                            action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            action.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <p className={`text-xs font-medium ${
                          action.color === 'blue' ? 'text-blue-600' :
                          action.color === 'green' ? 'text-green-600' :
                          action.color === 'orange' ? 'text-orange-600' :
                          action.color === 'purple' ? 'text-purple-600' :
                          action.color === 'indigo' ? 'text-indigo-600' :
                          'text-emerald-600'
                        }`}>
                          {action.stats}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                  <span className="text-sm text-red-600 font-medium">
                    {pendingApprovals.reduce((sum, item) => sum + item.count, 0)} total
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingApprovals.map((item, index) => (
                    <Link
                      key={index}
                      to={item.route}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{item.type}</span>
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                  <Link 
                    to="/admin/activities"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-100' :
                        activity.type === 'order' ? 'bg-green-100' :
                        activity.type === 'product' ? 'bg-purple-100' :
                        activity.type === 'deal' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Critical Metrics Overview */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Health Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{((stats.users.active / stats.users.total) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">User Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{((stats.companies.verified / stats.companies.total) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Company Verification Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{((stats.dealRooms.completed / stats.dealRooms.total) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Deal Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{((stats.subscriptions.active / stats.subscriptions.total) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Subscription Retention</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
