import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import { 
  UsersIcon, 
  CompanyIcon, 
  PostIcon, 
  MessageIcon,
  ActivityIcon,
  SystemIcon,
  RefreshIcon
} from '../../components/ui/ModernIcon';

// Dashboard Analytics Component
const AdminDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { 
    analytics, 
    systemStats, 
    users, 
    companies, 
    posts, 
    messages,
    activities,
    loading, 
    errors, 
    fetchData 
  } = useAdminData();

  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');

  const didInitRef = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      await Promise.all([
        fetchData('/admin/stats/', 'analytics'),
        fetchData('/admin/platform/stats/', 'systemStats'),
        fetchData('/admin/activities/', 'activities', { params: { limit: 10 } }),
        fetchData('/users/', 'users', { 
          params: { ordering: '-date_joined', limit: 5 },
          transform: (data) => Array.isArray(data) ? data : (data.results || [])
        }),
        fetchData('/companies/', 'companies', { 
          params: { ordering: '-date_created', limit: 5 },
          transform: (data) => Array.isArray(data) ? data : (data.results || [])
        }),
        fetchData('/posts/', 'posts', { 
          params: { ordering: '-date_created', limit: 5 },
          transform: (data) => Array.isArray(data) ? data : (data.results || [])
        }),
        fetchData('/messages/', 'messages', { 
          params: { last_chats: 'true' },
          transform: (data) => Array.isArray(data) ? data : (data.results || [])
        })
      ]);
    };

    // Avoid duplicate initial fetch in React 18 StrictMode (dev only)
    if (import.meta?.env?.DEV && !didInitRef.current && timeFilter === 'week') {
      didInitRef.current = true;
      fetchDashboardData();
      return;
    }
    fetchDashboardData();
  }, [fetchData, timeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData('/admin/stats/', 'analytics', { useCache: false });
    await fetchData('/admin/platform/stats/', 'systemStats', { useCache: false });
    setRefreshing(false);
  };

  const growthData = useMemo(() => {
    if (!analytics) return {};
    return {
      users: {
        total: analytics.total_users || 0,
        growth: analytics.user_growth || 0,
        trend: (analytics.user_growth || 0) >= 0 ? 'up' : 'down'
      },
      companies: {
        total: analytics.active_companies || 0,
        growth: analytics.company_growth || 0,
        trend: (analytics.company_growth || 0) >= 0 ? 'up' : 'down'
      },
      posts: {
        total: analytics.posts_created || 0,
        growth: analytics.posts_growth || 0,
        trend: (analytics.posts_growth || 0) >= 0 ? 'up' : 'down'
      },
      messages: {
        total: (messages || []).length || 0,
        unread: (messages || []).reduce((sum, m) => sum + (m.unread_count || 0), 0),
        response_rate: 0,
        trend: 'up'
      }
    };
  }, [analytics, messages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your platform today.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-soft glass border border-white/20"
          >
            {refreshing ? (
              <>
                <RefreshIcon size={16} className="animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshIcon size={16} className="mr-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stats */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.analytics ? '...' : growthData.users?.total?.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  growthData.users?.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {growthData.users?.trend === 'up' ? '↗' : '↘'} {growthData.users?.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-soft">
              <UsersIcon size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Companies Stats */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Companies</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.analytics ? '...' : growthData.companies?.total?.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  growthData.companies?.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {growthData.companies?.trend === 'up' ? '↗' : '↘'} {growthData.companies?.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-soft">
              <CompanyIcon size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Posts Stats */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.analytics ? '...' : growthData.posts?.total?.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  growthData.posts?.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {growthData.posts?.trend === 'up' ? '↗' : '↘'} {growthData.posts?.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-soft">
              <PostIcon size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Messages Stats */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.messages ? '...' : growthData.messages?.total?.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  growthData.messages?.unread > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {growthData.messages?.unread} unread
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-soft">
              <MessageIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Activities and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 shadow-soft">
                <ActivityIcon size={20} className="text-white" />
              </div>
              Recent Activities
            </h3>
          </div>
          <div className="space-y-4">
            {(activities || []).slice(0, 7).map((act) => (
              <div key={act.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white text-xs">•</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{act.message}</p>
                  <p className="text-xs text-gray-500">{new Date(act.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3 shadow-soft">
              <SystemIcon size={20} className="text-white" />
            </div>
            System Health
          </h3>
          
          <div className="space-y-4">
            {/* Uptime */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uptime</span>
                <span className="text-sm text-green-600 font-medium">
                  {systemStats?.uptime || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full shadow-inner" style={{ width: `${systemStats?.uptime || 0}%` }}></div>
              </div>
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                <span className="text-sm text-blue-600 font-medium">
                  {systemStats?.response_time || 0}ms
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full shadow-inner" 
                  style={{ width: `${Math.min(100, (systemStats?.response_time || 0) / 3)}%` }}
                ></div>
              </div>
            </div>

            {/* Error Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Error Rate</span>
                <span className="text-sm text-yellow-600 font-medium">
                  {systemStats?.error_rate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full shadow-inner" 
                  style={{ width: `${systemStats?.error_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 shadow-soft">
                <UsersIcon size={16} className="text-white" />
              </div>
              Recent Users
            </h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(users || []).slice(0, 5).map((u) => {
              const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email || 'Unknown user';
              const userSuffix = u.username ? ` (${u.username})` : '';
              return (
                <Link key={u.id} to={`/admin/users/${u.id}`} className="flex items-center space-x-3 hover:bg-gray-50/50 rounded-lg p-3 group transition-colors" aria-label={`View ${displayName}`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-white text-sm font-bold">
                      {u.first_name?.[0] || u.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName}{userSuffix}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Companies */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3 shadow-soft">
                <CompanyIcon size={16} className="text-white" />
              </div>
              Recent Companies
            </h3>
            <Link to="/admin/companies" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(companies || []).slice(0, 5).map((c) => (
              <Link key={c.slug || c.id} to={`/admin/companies/${c.slug || c.id}`} className="flex items-center space-x-3 hover:bg-gray-50/50 rounded-lg p-3 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-soft">
                  <CompanyIcon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.company_name || c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.email}</p>
                </div>
                <div className={`px-2 py-0.5 text-xs rounded-full ${c.verify ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.verify ? 'Verified' : 'Pending'}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass shadow-soft border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg mr-3 shadow-soft">
                <PostIcon size={16} className="text-white" />
              </div>
              Recent Posts
            </h3>
            <Link to="/admin/content" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(posts || []).slice(0, 5).map((p) => (
              <Link key={p.id} to={`/admin/content/${p.id}`} className="flex items-center space-x-3 hover:bg-gray-50/50 rounded-lg p-3 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-soft">
                  <PostIcon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 truncate">{new Date(p.date_created || p.created_at).toLocaleString()}</p>
                </div>
                <div className="text-xs text-gray-500">{(p.status || '').toString()}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="glass shadow-soft border border-green-200/50 rounded-xl p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3 shadow-soft">
            <span className="text-white text-lg">✅</span>
          </div>
          <div>
            <h4 className="text-green-800 font-semibold">Admin Dashboard Live</h4>
            <p className="text-green-700 mt-1">
              All stats and lists are powered by the Django API. No demo data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
