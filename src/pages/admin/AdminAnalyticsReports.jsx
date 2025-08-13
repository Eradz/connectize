import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth, useAdminData } from './ComprehensiveAdmin';

// Analytics & Reports Component
const AdminAnalyticsReports = () => {
  const { hasPermission, user, permissions } = useAuth();
  const { addToast, makeApiRequest } = useAdminData();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    // Route already requires admin; always load when range changes
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    console.log('[analytics] Starting data load...');
    console.log('[analytics] Current user:', user);
    console.log('[analytics] User permissions:', permissions);
    console.log('[analytics] Has admin permission:', hasPermission('admin'));
    setLoading(true);
    try {
      // Helpers
      const safe = async (endpoint) => {
        console.log('[analytics] Calling endpoint:', endpoint);
        try {
          const res = await makeApiRequest(endpoint);
          console.log('[analytics] Response for', endpoint, ':', res);
          if (!res?.success) {
            console.warn('[analytics] Request failed for', endpoint, 'Response:', res);
            if (res?.status) {
              console.warn('[analytics] HTTP Status:', res.status, 'Error:', res.error);
            }
          }
          return res?.success ? res.data : null;
        } catch (error) {
          console.error('[analytics] Request crashed for', endpoint, error);
          return null;
        }
      };
      const fetchPage = async (basePath, { page = 1, page_size = 200, extra = '' } = {}) => {
        const qs = `?page=${page}&page_size=${page_size}${extra ? `&${extra.replace(/^&/, '')}` : ''}`;
        return await safe(`${basePath}${basePath.endsWith('/') ? '' : '/'}${qs}`);
      };
      const fetchAllPaged = async (basePath, { page_size = 200, maxPages = 25, extra = '' } = {}) => {
        const all = [];
        for (let page = 1; page <= maxPages; page++) {
          const data = await fetchPage(basePath, { page, page_size, extra });
          const items = data?.results || data || [];
          if (!Array.isArray(items) || items.length === 0) break;
          all.push(...items);
          // stop early if fewer than page_size returned
          if (items.length < page_size) break;
        }
        return all;
      };
      const pickCount = (data, fallbackList = []) => {
        if (Number.isFinite(data?.count)) return data.count;
        const list = data?.results || data || fallbackList;
        return Array.isArray(list) ? list.length : 0;
      };

      // Try a simple test first - check current user endpoint
      console.log('[analytics] Testing current user endpoint...');
      const currentUserTest = await safe('/current-user/');
      console.log('[analytics] Current user test result:', currentUserTest);

      // Try admin endpoints first for robust server-side stats
      console.log('[analytics] Trying admin endpoints...');
      const [adminStats, platformStats, usersStats] = await Promise.all([
        safe('/admin/stats/'),
        safe('/admin/platform/stats/'),
        safe(`/admin/users/stats/?period=${dateRange}`)
      ]);

      console.log('[analytics] Admin responses:', { adminStats, platformStats, usersStats });

      // Fallback parallel fetch counts from list endpoints if needed
      console.log('[analytics] Trying list endpoints as fallback...');
      const [usersData, companiesData, productsData, servicesData, postsData] = await Promise.all([
        safe('/users/?page_size=1'),
        safe('/companies/?page_size=1'),
        safe('/products/?page_size=1'),
        safe('/services/?page_size=1'),
        safe('/posts/?page_size=1'),
      ]);

      console.log('[analytics] List responses:', { usersData, companiesData, productsData, servicesData, postsData });

      const overview = adminStats
        ? {
            total_users: adminStats.total_users ?? 0,
            active_companies: adminStats.active_companies ?? 0,
            total_products: adminStats.total_products ?? 0,
            total_services: adminStats.total_services ?? 0,
            posts_created: adminStats.posts_created ?? 0,
            growth_rate: adminStats.user_growth ?? 0,
          }
        : {
            total_users: pickCount(usersData),
            active_companies: pickCount(companiesData),
            total_products: pickCount(productsData),
            total_services: pickCount(servicesData),
            posts_created: pickCount(postsData),
            growth_rate: 0,
          };

      console.log('[analytics] Computed overview:', overview);

      // If we still have zeros, let's try to get some basic counts differently
      if (overview.total_users === 0 && overview.active_companies === 0) {
        console.log('[analytics] All counts are zero, trying alternate approach...');
        
        // Try getting actual results arrays instead of just count
        const basicUsers = await safe('/users/');
        const basicCompanies = await safe('/companies/');
        
        console.log('[analytics] Basic data fetch:', { basicUsers, basicCompanies });
        
        if (basicUsers && Array.isArray(basicUsers)) {
          overview.total_users = basicUsers.length;
        }
        if (basicCompanies && Array.isArray(basicCompanies)) {
          overview.active_companies = basicCompanies.length;
        }
        
        console.log('[analytics] Updated overview after basic fetch:', overview);
      }

      // Time-series (recent sample only)
      const daysMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
      const days = daysMap[dateRange] || 30;
      const since = new Date();
      since.setDate(since.getDate() - days + 1);
      const dateKey = (d) => new Date(d).toISOString().slice(0, 10);
      const initSeries = (n) => Array.from({ length: n }, (_, i) => 0);

      // Pull at most N pages to avoid huge payloads
      const [usersList, postsList, commentsList, productsList, servicesList] = await Promise.all([
        fetchAllPaged('/users/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_joined' }),
        fetchAllPaged('/posts/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created&status=PUBLISHED' }),
        fetchAllPaged('/comments/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
        fetchAllPaged('/products/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
        fetchAllPaged('/services/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
      ]);

      // Build day index array (oldest -> newest)
      const daysArr = Array.from({ length: days }, (_, i) => {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        return dateKey(d);
      });
      const idx = new Map(daysArr.map((k, i) => [k, i]));
      const dailyUsers = initSeries(days);
      const postsPerDay = initSeries(days);
      const commentsPerDay = initSeries(days);

      const inc = (arr, d) => { const k = dateKey(d); if (idx.has(k)) arr[idx.get(k)]++; };

  usersList.forEach(u => inc(dailyUsers, u.date_joined || u.date_created || u.created_at));
  postsList.forEach(p => inc(postsPerDay, p.date_created || p.created_at));
  commentsList.forEach(c => inc(commentsPerDay, c.commented_at || c.date_created || c.created_at));

      // Category distributions (client-side sample)
      const agg = (arr, key) => {
        const map = new Map();
        (arr || []).forEach((item) => {
          const k = (item?.[key] && (item[key].name || item[key])) || 'Uncategorized';
          map.set(k, (map.get(k) || 0) + 1);
        });
        return Array.from(map, ([name, value]) => ({ name, value }));
      };
      const productCategories = agg(productsList, 'category');
      const serviceCategories = agg(servicesList, 'category');

      const timeSeries = daysArr.map((d, i) => ({
        date: d,
        users: dailyUsers[i] || 0,
        posts: postsPerDay[i] || 0,
        comments: commentsPerDay[i] || 0,
      }));

      const analytics = {
        overview,
        performance_metrics: {
          avg_response_time: platformStats?.response_time ?? null,
          error_rate: platformStats?.error_rate ?? null,
          uptime: platformStats?.uptime ?? null,
        },
        user_metrics: {
          daily_active_users: dailyUsers,
          weekly_active_users: dailyUsers,
          user_retention: { day_1: null, day_7: null, day_30: null },
        },
        content_metrics: { posts_per_day: postsPerDay, comments_per_day: commentsPerDay },
        distributions: { productCategories, serviceCategories },
        series: timeSeries,
      };

      console.log('[analytics] Final analytics data:', analytics);
      setAnalyticsData(analytics);
    } catch (error) {
  setAnalyticsData({});
  addToast('Failed to load some analytics data. Showing what is available.', 'warning', 4000);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format, type) => {
    try {
      const reportData = {
        type,
        format,
        period: dateRange,
        generated_at: new Date().toISOString(),
        data: analyticsData
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${dateRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(`${type} report exported successfully!`, 'success');
    } catch (error) {
      addToast(`Failed to export report: ${error.message}`, 'error');
    }
  };

  const chartData = useMemo(() => {
    return {
      dailyUsers: analyticsData.user_metrics?.daily_active_users || [],
      weeklyUsers: analyticsData.user_metrics?.weekly_active_users || [],
      postsPerDay: analyticsData.content_metrics?.posts_per_day || [],
      commentsPerDay: analyticsData.content_metrics?.comments_per_day || []
    };
  }, [analyticsData]);

  if (!hasPermission('admin')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view analytics and reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-gray-600">Live analytics from Django API</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.overview?.total_users?.toLocaleString() || '0'}</p>
              <p className="text-sm text-green-600">+{analyticsData.overview?.growth_rate || 0}% growth</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Companies</h3>
              <p className="text-3xl font-bold text-green-600">{analyticsData.overview?.active_companies?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Published Posts</h3>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.overview?.posts_created?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
              <p className="text-3xl font-bold text-orange-600">{analyticsData.performance_metrics?.uptime ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', name: 'Overview', icon: '📊' },
              { key: 'users', name: 'Users', icon: '👥' },
              { key: 'performance', name: 'Performance', icon: '⚡' },
              { key: 'exports', name: 'Export', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Analytics Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide={true} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Users" dot={false} />
                            <Line type="monotone" dataKey="posts" stroke="#8b5cf6" name="Posts" dot={false} />
                            <Line type="monotone" dataKey="comments" stroke="#f59e0b" name="Comments" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Products vs Services (by category)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={analyticsData.distributions?.productCategories || []} dataKey="value" nameKey="name" outerRadius={80} label>
                                {(analyticsData.distributions?.productCategories || []).map((_, i) => (
                                  <Cell key={`pc-${i}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"][i % 6]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={analyticsData.distributions?.serviceCategories || []} dataKey="value" nameKey="name" outerRadius={80} label>
                                {(analyticsData.distributions?.serviceCategories || []).map((_, i) => (
                                  <Cell key={`sc-${i}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"][i % 6]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Signups (last {dateRange})</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide={true} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="users" fill="#3b82f6" name="Users" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts & Comments (last {dateRange})</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide={true} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="posts" fill="#8b5cf6" name="Posts" />
                            <Bar dataKey="comments" fill="#f59e0b" name="Comments" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exports' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
                    <p className="text-gray-600 mb-6">Generate and download reports.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-2">User Analytics Report</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => exportReport('pdf', 'user_analytics')}
                          className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Export as PDF
                        </button>
                        <button
                          onClick={() => exportReport('xlsx', 'user_analytics')}
                          className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => exportReport('json', 'user_analytics')}
                          className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center">
          <span className="text-indigo-600 text-xl mr-3">📊</span>
          <div>
            <h4 className="text-indigo-800 font-semibold">Advanced Analytics Live</h4>
            <p className="text-indigo-700 mt-1">Data shown is fetched from Django API only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsReports;
