import React, { useState, useEffect, useMemo } from 'react';
import { UsersIcon, BuildingOffice2Icon, DocumentTextIcon, Cog6ToothIcon, ArrowPathIcon, ChartBarIcon, FireIcon, BoltIcon, ClipboardDocumentListIcon, NoSymbolIcon, HandThumbUpIcon, ChatBubbleLeftRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth, useAdminData } from './ComprehensiveAdmin';

// Analytics & Reports Component
const AdminAnalyticsReports = () => {
  const { hasPermission, user, permissions } = useAuth();
  const { addToast, makeApiRequest } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const [retentionWeeks, setRetentionWeeks] = useState(12);

  useEffect(() => {
    // Route already requires admin; always load when range changes
    loadAnalytics();
  }, [dateRange]);

  // Sync initial tab from URL and push URL on tab change for deep-linking
  useEffect(() => {
    // On mount or path change, set tab based on URL
    const p = location.pathname || '';
    if (p.endsWith('/users')) setActiveTab('users');
    else if (p.endsWith('/content') || p.endsWith('/engagement')) setActiveTab('engagement');
    else if (p.endsWith('/retention')) setActiveTab('retention');
    else if (p.endsWith('/performance')) setActiveTab('performance');
    else if (p.endsWith('/export')) setActiveTab('exports');
    else setActiveTab('overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    // When tab changes, navigate to a stable sub-route for deep links
    const base = '/admin/analytics';
    const target = (
      activeTab === 'overview' ? base :
      activeTab === 'users' ? `${base}/users` :
      activeTab === 'engagement' ? `${base}/content` :
      activeTab === 'retention' ? `${base}/retention` :
      activeTab === 'performance' ? `${base}/performance` :
      activeTab === 'exports' ? `${base}/export` : base
    );
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  useEffect(() => {
    // Sync default retention weeks with date range changes when user hasn't manually changed it
    const weeksMap = { '24h': 4, '7d': 8, '30d': 12, '90d': 13 };
    setRetentionWeeks(weeksMap[dateRange] || 12);
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
  const weeks = Math.max(4, Math.min(26, retentionWeeks || 12));

      const [adminStats, platformStats, usersStats, engagementStats, retentionStats] = await Promise.all([
        safe('/admin/stats/'),
        safe('/admin/platform/stats/'),
        safe(`/admin/users/stats/?period=${dateRange}`),
        safe(`/admin/engagement/stats/?period=${dateRange}`),
        safe(`/admin/retention/stats/?weeks=${weeks}`),
      ]);

      console.log('[analytics] Admin responses:', { adminStats, platformStats, usersStats, engagementStats, retentionStats });

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

      // Set partial analytics so UI has something even if charts fail later
      const baseAnalytics = {
        overview,
        performance_metrics: {
          avg_response_time: platformStats?.response_time ?? null,
          error_rate: platformStats?.error_rate ?? null,
          uptime: platformStats?.uptime ?? null,
        },
      };
      // Prepare engagement block (if available)
      if (engagementStats && Array.isArray(engagementStats.labels)) {
        try {
          const engSeries = engagementStats.labels.map((label, i) => ({
            date: label,
            posts: engagementStats.posts?.[i] || 0,
            comments: engagementStats.comments?.[i] || 0,
            likes: engagementStats.likes?.[i] || 0,
            followers: engagementStats.followers?.[i] || 0,
          }));
          const hoursSeries = (engagementStats.active_hours || []).map((v, hour) => ({ hour, count: v }));
          const geoSeries = (engagementStats.geo || []).map(g => ({ name: g.country || 'Unknown', value: g.count || 0 }));
          const funnelSeries = (engagementStats.funnel || []).map(f => ({ name: f.name, value: f.count }));

          baseAnalytics.engagement = {
            dau: engagementStats.dau || 0,
            wau: engagementStats.wau || 0,
            mau: engagementStats.mau || 0,
            stickiness: engagementStats.stickiness || 0,
            series: engSeries,
            active_hours: hoursSeries,
            geo: geoSeries,
            funnel: funnelSeries,
            top_posts: engagementStats.top_posts || [],
          };
        } catch (e) {
          console.warn('[analytics] Failed to process engagement stats', e);
        }
      }

      // Prepare retention block (if available)
      if (retentionStats && Array.isArray(retentionStats.labels) && Array.isArray(retentionStats.cohorts)) {
        try {
          baseAnalytics.retention = {
            labels: retentionStats.labels,
            cohorts: retentionStats.cohorts,
            weeks: retentionStats.weeks,
          };
        } catch (e) {
          console.warn('[analytics] Failed to process retention stats', e);
        }
      }

      setAnalyticsData((prev) => ({ ...prev, ...baseAnalytics }));

      // Time-series (recent sample only) wrapped in try/catch so we keep base stats on failure
      try {
        const daysMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[dateRange] || 30;
        const since = new Date();
        since.setDate(since.getDate() - days + 1);
        const dateKey = (d) => {
          if (!d) return null;
          const dt = d instanceof Date ? d : new Date(d);
          if (isNaN(dt.getTime())) return null;
          try { return dt.toISOString().slice(0, 10); } catch (_) { return null; }
        };
        const initSeries = (n) => Array.from({ length: n }, () => 0);

        const [usersList, postsList, commentsList, productsList, servicesList] = await Promise.all([
          fetchAllPaged('/users/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_joined' }),
          fetchAllPaged('/posts/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created&status=PUBLISHED' }),
          fetchAllPaged('/comments/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
          fetchAllPaged('/products/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
          fetchAllPaged('/services/', { page_size: 200, maxPages: 10, extra: 'ordering=-date_created' }),
        ]);

        const daysArr = Array.from({ length: days }, (_, i) => {
          const d = new Date(since);
          d.setDate(since.getDate() + i);
          return dateKey(d);
        });
        const idx = new Map(daysArr.map((k, i) => [k, i]));
        let dailyUsers = initSeries(days);
        const postsPerDay = initSeries(days);
        const commentsPerDay = initSeries(days);

        const inc = (arr, d) => {
          const k = dateKey(d);
          if (!k) return;
          if (idx.has(k)) arr[idx.get(k)]++;
        };

        usersList.forEach(u => inc(dailyUsers, u.date_joined || u.date_created || u.created_at));
        postsList.forEach(p => inc(postsPerDay, p.date_created || p.created_at));
        commentsList.forEach(c => inc(commentsPerDay, c.commented_at || c.date_created || c.created_at));

        if (Array.isArray(usersStats?.new_users) && usersStats.new_users.length) {
          const series = usersStats.new_users;
          dailyUsers = series.length > days ? series.slice(series.length - days) : series;
        }

        const computeGrowth = (arr) => {
          if (!Array.isArray(arr) || arr.length < 2) return null;
          const half = Math.floor(arr.length / 2);
          const prev = arr.slice(0, half).reduce((a, b) => a + b, 0);
          const curr = arr.slice(half).reduce((a, b) => a + b, 0);
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 100);
        };
        const usersGrowth = computeGrowth(dailyUsers);
        if (usersGrowth !== null) {
          const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
          overview.growth_rate = clamp(usersGrowth, -99, 999);
        }

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
          ...baseAnalytics,
          overview,
          content_metrics: { posts_per_day: postsPerDay, comments_per_day: commentsPerDay },
          distributions: { productCategories, serviceCategories },
          user_metrics: { daily_active_users: dailyUsers, weekly_active_users: dailyUsers, user_retention: { day_1: null, day_7: null, day_30: null } },
          series: timeSeries,
          has_activity: (dailyUsers.some(v => v > 0) || postsPerDay.some(v => v > 0) || commentsPerDay.some(v => v > 0)),
        };
        console.log('[analytics] Final analytics data:', analytics);
        setAnalyticsData(analytics);
      } catch (chartErr) {
        console.warn('[analytics] Chart/distribution build failed:', chartErr);
        setAnalyticsData((prev) => ({
          ...prev,
          ...baseAnalytics,
          content_metrics: { posts_per_day: [], comments_per_day: [] },
          distributions: { productCategories: [], serviceCategories: [] },
          user_metrics: { daily_active_users: [], weekly_active_users: [], user_retention: { day_1: null, day_7: null, day_30: null } },
          series: [],
          has_activity: false,
        }));
        addToast('Failed to load some analytics data. Showing what is available.', 'warning', 4000);
      }
    } catch (error) {
      console.error('[analytics] Fatal error while loading analytics:', error);
      // Keep existing data to avoid clearing UI
      setAnalyticsData((prev) => prev || {});
      addToast('Failed to load analytics. Check your connection or permissions.', 'error', 4000);
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

  const exportRetentionCSV = () => {
    try {
      const ret = analyticsData.retention;
      if (!ret?.cohorts?.length) {
        addToast('No retention data to export.', 'warning');
        return;
      }
      const totalWeeks = ret.labels?.length || 0;
      const headers = ['Cohort', 'Size', ...Array.from({ length: totalWeeks }, (_, i) => ret.labels?.[i] || `W${i+1}`)];
      const rows = ret.cohorts.map((row, ri) => {
        const pre = Math.min(ri, totalWeeks);
        const vals = row.retention || [];
        const post = Math.max(0, totalWeeks - pre - vals.length);
        const cells = [row.cohort, row.size, ...Array(pre).fill(''), ...vals.map(v => `${v}%`), ...Array(post).fill('')];
        return cells.map((c) => (typeof c === 'string' && c.includes(',') ? `"${c}"` : c)).join(',');
      });
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `retention_${ret.weeks || totalWeeks}_weeks.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Retention CSV exported.', 'success');
    } catch (e) {
      addToast(`Failed to export retention CSV: ${e.message}`,'error');
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <NoSymbolIcon className="w-8 h-8" aria-hidden="true" />
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
            <ArrowPathIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.overview?.total_users?.toLocaleString() || '0'}</p>
              <p className={`text-sm ${Number.isFinite(analyticsData.overview?.growth_rate) && analyticsData.overview.growth_rate < 0 ? 'text-red-600' : 'text-green-600'}`}>
                +{Number.isFinite(analyticsData.overview?.growth_rate) ? analyticsData.overview.growth_rate : 0}% growth
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <BuildingOffice2Icon className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Companies</h3>
              <p className="text-3xl font-bold text-green-600">{analyticsData.overview?.active_companies?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Published Posts</h3>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.overview?.posts_created?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <Cog6ToothIcon className="w-7 h-7" aria-hidden="true" />
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
              { key: 'overview', name: 'Overview', icon: ChartBarIcon },
              { key: 'users', name: 'Users', icon: UsersIcon },
              { key: 'engagement', name: 'Engagement', icon: FireIcon },
              { key: 'retention', name: 'Retention', icon: ChartBarIcon },
              { key: 'performance', name: 'Performance', icon: BoltIcon },
              { key: 'exports', name: 'Export', icon: ClipboardDocumentListIcon }
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
                  <tab.icon className="w-4 h-4" aria-hidden="true" />
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
                        {!analyticsData.has_activity ? (
                          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                            No recent activity in this period. Try expanding the date range or check back later.
                          </div>
                        ) : (
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
                        )}
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
                        {!analyticsData.has_activity ? (
                          <div className="h-full flex items-center justify-center text-gray-500 text-sm">No recent user signups in this period.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" hide={true} />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="users" fill="#3b82f6" name="Users" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts & Comments (last {dateRange})</h3>
                      <div className="h-64">
                        {!analyticsData.has_activity ? (
                          <div className="h-full flex items-center justify-center text-gray-500 text-sm">No posts or comments in this period.</div>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'retention' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cohort Retention
                      <span className="ml-2 text-gray-400 cursor-help text-sm" title="Weekly cohorts by signup week. Each cell shows % of that cohort active in the given week." aria-label="Retention explanation">
                        <InformationCircleIcon className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">Weeks: {analyticsData.retention?.weeks || '-'}</div>
                      <select
                        value={retentionWeeks}
                        onChange={(e) => setRetentionWeeks(Number(e.target.value))}
                        onBlur={() => loadAnalytics()}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        title="Select number of weeks to include"
                      >
                        {Array.from({ length: 23 }, (_, i) => 4 + i).map((w) => (
                          <option key={w} value={w}>{w} weeks</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { exportRetentionCSV(); }}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
                        title="Export retention as CSV"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {!analyticsData.retention?.cohorts?.length ? (
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                      Not enough data to display retention yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="flex items-center justify-end mb-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>Low</span>
                          <div className="h-3 w-24 bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-600 rounded"></div>
                          <span>High</span>
                        </div>
                      </div>
                      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Cohort</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-24 bg-gray-50 z-10">Size</th>
                            {(analyticsData.retention?.labels || []).map((lbl, i) => (
                              <th key={i} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{lbl}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {(analyticsData.retention?.cohorts || []).map((row, ri) => {
                            const startIdx = ri; // row aligns from its cohort start
                            const totalWeeks = analyticsData.retention?.labels?.length || 0;
                            const preBlanks = Math.min(startIdx, totalWeeks);
                            const values = row.retention || [];
                            const blanksAfter = Math.max(0, totalWeeks - preBlanks - values.length);
                            const colorFor = (p) => {
                              const pct = Math.max(0, Math.min(100, Number(p) || 0));
                              // teal scale from light (low) to dark (high)
                              const alpha = 0.15 + (pct / 100) * 0.65;
                              return `rgba(13, 148, 136, ${alpha.toFixed(2)})`;
                            };
                            return (
                              <tr key={row.cohort}>
                                <td className="px-3 py-2 text-sm text-gray-700 sticky left-0 bg-white z-10">{row.cohort}</td>
                                <td className="px-3 py-2 text-sm text-gray-500 sticky left-24 bg-white z-10">{row.size}</td>
                                {Array.from({ length: preBlanks }).map((_, i) => (
                                  <td key={`pre-${ri}-${i}`} className="px-2 py-2 text-center text-xs text-gray-400 bg-gray-50">—</td>
                                ))}
                                {values.map((v, ci) => (
                                  <td key={`val-${ri}-${ci}`} className="px-2 py-2 text-center text-xs" style={{ backgroundColor: colorFor(v) }}>
                                    <span className="font-medium text-gray-800">{v}%</span>
                                  </td>
                                ))}
                                {Array.from({ length: blanksAfter }).map((_, i) => (
                                  <td key={`post-${ri}-${i}`} className="px-2 py-2 text-center text-xs text-gray-400 bg-gray-50">—</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
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

              {activeTab === 'engagement' && (
                <div className="space-y-6">
                  {/* Engagement Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-sm text-gray-500">
                        DAU
                        <span className="ml-2 text-gray-400 cursor-help" title="Daily Active Users — unique users who engaged in the last 24 hours." aria-label="Daily Active Users explanation">
                          <InformationCircleIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analyticsData.engagement?.dau ?? 0}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-sm text-gray-500">
                        WAU
                        <span className="ml-2 text-gray-400 cursor-help" title="Weekly Active Users — unique users who engaged over the last 7 days." aria-label="Weekly Active Users explanation">
                          <InformationCircleIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analyticsData.engagement?.wau ?? 0}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-sm text-gray-500">
                        MAU
                        <span className="ml-2 text-gray-400 cursor-help" title="Monthly Active Users — unique users who engaged over the last 30 days." aria-label="Monthly Active Users explanation">
                          <InformationCircleIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analyticsData.engagement?.mau ?? 0}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-sm text-gray-500">
                        Stickiness (DAU/MAU)
                        <span className="ml-2 text-gray-400 cursor-help" title="Stickiness = DAU / MAU — the share of monthly active users who are active on a typical day." aria-label="Stickiness explanation">
                          <InformationCircleIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{(analyticsData.engagement?.stickiness ?? 0)}%</div>
                    </div>
                  </div>

                  {/* Activity Multi-Series */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Activity</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.engagement?.series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" hide={true} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="posts" stroke="#8b5cf6" name="Posts" dot={false} />
                          <Line type="monotone" dataKey="comments" stroke="#f59e0b" name="Comments" dot={false} />
                          <Line type="monotone" dataKey="likes" stroke="#10b981" name="Likes" dot={false} />
                          <Line type="monotone" dataKey="followers" stroke="#ef4444" name="Follows" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Hours */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Hours (last 7 days)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.engagement?.active_hours || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" name="Events" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Geo Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyticsData.engagement?.geo || []} dataKey="value" nameKey="name" outerRadius={80} label>
                              {(analyticsData.engagement?.geo || []).map((_, i) => (
                                <Cell key={`geo-${i}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"][i % 6]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Funnel */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Funnel</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.engagement?.funnel || []} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" width={120} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" name="Users" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Posts */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Posts</h3>
                      <div className="space-y-4">
                        {(analyticsData.engagement?.top_posts || []).map((p) => (
                          <div key={p.id} className="p-4 rounded border border-gray-200 bg-gray-50">
                            <div className="text-sm text-gray-500 mb-1">{p.company || 'Anonymous'}</div>
                            <div className="text-gray-800 line-clamp-2 mb-2">{p.snippet}</div>
                            <div className="text-xs text-gray-600">
                              <span className="inline-flex items-center mr-3"><HandThumbUpIcon className="w-4 h-4 mr-1" aria-hidden="true" /> {p.likes}</span>
                              <span className="inline-flex items-center mr-3"><ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" aria-hidden="true" /> {p.comments}</span>
                              {new Date(p.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {(!analyticsData.engagement?.top_posts || analyticsData.engagement.top_posts.length === 0) && (
                          <div className="text-sm text-gray-500">No posts in this period.</div>
                        )}
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
          <ChartBarIcon className="text-indigo-600 w-6 h-6 mr-3" aria-hidden="true" />
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
