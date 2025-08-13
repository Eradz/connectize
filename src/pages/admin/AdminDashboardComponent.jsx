import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useAdminData } from './ComprehensiveAdmin';

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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="p-3 bg-blue-50 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Companies Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="p-3 bg-green-50 rounded-full">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        {/* Posts Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="p-3 bg-yellow-50 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        {/* Messages Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="p-3 bg-purple-50 rounded-full">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="space-y-4">
            {(activities || []).slice(0, 7).map((act) => (
              <div key={act.id} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">•</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
          
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
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemStats?.uptime || 0}%` }}></div>
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
                  className="bg-blue-500 h-2 rounded-full" 
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
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${systemStats?.error_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-3">
            {(users || []).slice(0, 5).map((u) => {
              const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email || 'Unknown user';
              const userSuffix = u.username ? ` (${u.username})` : '';
              return (
                <Link key={u.id} to={`/admin/users/${u.id}`} className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2 group" aria-label={`View ${displayName}`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Companies</h3>
            <Link to="/admin/companies" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-3">
            {(companies || []).slice(0, 5).map((c) => (
              <Link key={c.slug || c.id} to={`/admin/companies/${c.slug || c.id}`} className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">🏢</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
            <Link to="/admin/content" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-3">
            {(posts || []).slice(0, 5).map((p) => (
              <Link key={p.id} to={`/admin/content/${p.id}`} className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">📝</span>
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center">
          <span className="text-green-600 text-xl mr-3">✅</span>
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
