import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Link, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  DashboardIcon,
  UsersIcon,
  CompanyIcon,
  DocumentIcon,
  ProductIcon,
  ServiceIcon,
  NotificationIcon,
  TrendingIcon,
  SettingsIcon,
  MessageIcon,
  SystemIcon
} from '../../components/ui/ModernIcon';

// Import Dashboard Component - Use the enhanced version
import AdminDashboard from './AdminDashboard';
import AdminUsersManagement from './AdminUsersManagement';
import AdminCompaniesManagement from './AdminCompaniesManagement';
import AdminContentManagement from './AdminContentManagement';
import AdminPostsManagement from './AdminPostsManagement';
import AdminSystemSettings from './AdminSystemSettings';
import AdminProductsManagement from './AdminProductsManagement';
import AdminServicesManagement from './AdminServicesManagement';
import AdminAnalyticsReports from './AdminAnalyticsReports';
import AdminUserDetail from './details/AdminUserDetail';
import AdminCompanyDetail from './details/AdminCompanyDetail';
import AdminPostDetail from './details/AdminPostDetail';
import AdminNotifications from './AdminNotifications';
import AdminProductDetail from './details/AdminProductDetail';
import AdminServiceDetail from './details/AdminServiceDetail';
import AdminNotificationDetail from './details/AdminNotificationDetail';
import AdminMessagesManagement from './AdminMessagesManagement';
import PlaceholderPage from './PlaceholderPage';

// Import the new admin modules with correct paths
import AdminDeals from './deals/AdminDeals';
import AdminWorkforce from './workforce/AdminWorkforce';
import AdminLogistics from './logistics/AdminLogistics';
import AdminKnowledge from './knowledge/AdminKnowledge';
import AdminSubscriptions from './subscriptions/AdminSubscriptions';
import AdminAuth from './AdminAuth';

// Enhanced API Helper with comprehensive error handling and live data support
const makeApiRequest = async (endpoint, options = {}) => {
  const rawBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://127.0.0.1:8000';
  // Normalize API base to always include /api
  const baseRoot = rawBase.replace(/\/+$/, '');
  const apiBase = baseRoot.endsWith('/api') ? baseRoot : `${baseRoot}/api`;
  // Ensure endpoint does not duplicate /api and always starts with '/'
  let path = typeof endpoint === 'string' ? endpoint : '';
  path = path.startsWith('/') ? path : `/${path}`;
  // Strip a leading '/api' once (handles '/api' and '/api/...')
  path = path.replace(/^\/api(\/|$)/, '/');
  const url = `${apiBase}${path}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
    retries: 3,
  };

  // Enhanced token handling for live API integration
  const accessToken = localStorage.getItem('access') || sessionStorage.getItem('access');
  const initialToken = accessToken; // do not fallback to legacy tokens to avoid stale auth

  // Determine public auth endpoints where we should NOT attach Authorization
  const publicAuthPaths = ['/auth/login/', '/auth/refresh-token/', '/auth/verify-token/', '/auth/register/'];
  const isPublicAuthPath = publicAuthPaths.some(p => endpoint === p || endpoint.startsWith(p));
  if (initialToken && !isPublicAuthPath) {
    defaultOptions.headers['Authorization'] = `Bearer ${initialToken}`;
  }

  // Add CSRF token if available (for Django integration)
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
  if (csrfToken) {
    defaultOptions.headers['X-CSRFToken'] = csrfToken;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Helper: refresh JWT access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshLS = localStorage.getItem('refresh') || localStorage.getItem('refresh_token');
      const refreshSS = sessionStorage.getItem('refresh') || sessionStorage.getItem('refresh_token');
      const refresh = refreshLS || refreshSS;
      if (!refresh) return null;
      const storage = refreshLS ? localStorage : sessionStorage;
  const res = await fetch(`${apiBase}/auth/refresh-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (!res.ok) return null;
      const data = await res.json();
      const pick = (obj) => {
        if (!obj || typeof obj !== 'object') return {};
        const src = obj.tokens || obj;
        return {
          access: src.access || src.access_token || src.results?.access || src.results?.access_token,
          refresh: src.refresh || src.refresh_token || src.results?.refresh || src.results?.refresh_token,
        };
      };
      const tokens = pick(data);
      const newAccess = tokens.access;
      if (newAccess) {
        storage.setItem('access', newAccess);
        if (tokens.refresh) {
          storage.setItem('refresh', tokens.refresh);
          storage.setItem('refresh_token', tokens.refresh);
        }
        return newAccess;
      }
      return null;
    } catch {
      return null;
    }
  };

  let didRefreshAttempt = false;

  for (let attempt = 0; attempt <= finalOptions.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Handle 204 No Content safely
      if (response.status === 204) {
        return { success: true, data: null, status: response.status, attempt: attempt + 1 };
      }

      if (response.ok) {
        // Safely parse JSON or text based on content-type
        let data = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Fallback to text for non-JSON responses
          data = await response.text();
        }
        return { success: true, data, status: response.status, attempt: attempt + 1 };
      }

      // If unauthorized and not a public auth endpoint, try refreshing token once
      if (response.status === 401 && !isPublicAuthPath && !didRefreshAttempt) {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          didRefreshAttempt = true;
          finalOptions.headers['Authorization'] = `Bearer ${newAccess}`;
          attempt--; // retry same attempt without counting against retries
          continue;
        }
      }
      
      // For 5xx and 429, throw to trigger retry/backoff
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse error body for 4xx to bubble up DRF field errors
      let errorData = null;
      let errorText = '';
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorText = await response.text();
        }
      } catch {}
      const message = (errorData && (errorData.detail || errorData.non_field_errors?.join(' ') || 'Request failed')) || errorText || response.statusText;
      return { success: false, status: response.status, error: message, data: errorData, attempt: attempt + 1 };
    } catch (error) {
      console.error(`API Request attempt ${attempt + 1} failed:`, error);

      if (attempt === finalOptions.retries) {
        return { 
          success: false, 
          error: error.message, 
          attempts: attempt + 1,
          isNetworkError: error.name === 'AbortError' || error.message.includes('fetch')
        };
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Comprehensive Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  useEffect(() => {
    // Safety: ensure we never keep the UI in loading state for too long
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 7000);

    const checkAuth = async () => {
      try {
        const access = localStorage.getItem('access') || sessionStorage.getItem('access');
        if (access) {
          // Verify JWT access token
          const verify = await makeApiRequest('/auth/verify-token/', {
            method: 'POST',
            body: JSON.stringify({ token: access }),
            // Fast-fail in UI to avoid long blank states if API is down
            timeout: 4000,
            retries: 0,
          });

          if (verify.success) {
            // Load current user profile
            const me = await makeApiRequest('/current-user/', { timeout: 5000, retries: 0 });
            // Load user permissions (protected endpoint, Authorization is attached)
            const perms = await makeApiRequest('/auth/permissions/', { timeout: 5000, retries: 0 });
            if (me.success) {
              setUser(me.data);
              const basePerms = ['analytics.view', 'settings.view'];
              const adminPerms = me.data?.is_staff || me.data?.is_superuser ? ['admin'] : [];
              const permsArray = Array.isArray(perms?.data?.results?.permissions)
                ? perms.data.results.permissions
                : Array.isArray(perms?.data?.permissions)
                  ? perms.data.permissions
                  : Array.isArray(perms?.data)
                    ? perms.data
                    : [];
              setPermissions([...new Set([...basePerms, ...adminPerms, ...permsArray])]);
              // Optional: set session expiry to 8 hours from now
              setSessionExpiry(new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
  clearTimeout(safetyTimer);
      }
    };

    checkAuth();
  }, []);

  // Define logout before using it in effects to avoid TDZ errors
  const logout = useCallback(() => {
    // Clear from both local and session storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    setPermissions([]);
    setSessionExpiry(null);
  }, []);

  // Replace alert-based expiry check with redirect to login carrying a flag
  useEffect(() => {
    const checkExpiry = () => {
      if (sessionExpiry && new Date() > new Date(sessionExpiry)) {
        logout();
        // Redirect to login with query param so login page can show a toast
        window.location.replace('/admin/login?expired=1');
      }
    };
    const id = setInterval(checkExpiry, 60000);
    return () => clearInterval(id);
  }, [sessionExpiry, logout]);

  const login = useCallback(async (credentials) => {
    try {
      // Backend expects email and password
      const payload = {
        email: (credentials.email || credentials.username || '').toLowerCase(),
        password: credentials.password,
      };

      const result = await makeApiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Login failed' };
      }

      // Purge any stale tokens before storing new ones
      ['localStorage', 'sessionStorage'].forEach((storeName) => {
        const store = storeName === 'localStorage' ? localStorage : sessionStorage;
        store.removeItem('admin_token');
        store.removeItem('token');
        store.removeItem('authToken');
        store.removeItem('access');
        store.removeItem('refresh');
        store.removeItem('refresh_token');
      });

      // Support multiple response shapes
      const d = result.data || {};
      const extract = (obj) => {
        if (!obj || typeof obj !== 'object') return {};
        const levels = [obj, obj.results, obj.data];
        for (const lvl of levels) {
          if (!lvl) continue;
          if (lvl.tokens) {
            return {
              access: lvl.tokens.access || lvl.tokens.access_token,
              refresh: lvl.tokens.refresh || lvl.tokens.refresh_token,
            };
          }
          if (('access' in lvl) || ('access_token' in lvl) || ('refresh' in lvl) || ('refresh_token' in lvl)) {
            return {
              access: lvl.access || lvl.access_token,
              refresh: lvl.refresh || lvl.refresh_token,
            };
          }
        }
        return {};
      };
      const tokens = extract(d);
      const storage = credentials.remember ? localStorage : sessionStorage;
      // Guard: tokens must exist
      if (!tokens.access || !tokens.refresh) {
        return { success: false, error: 'Invalid token response from server' };
      }

      // Persist tokens (no legacy keys)
      storage.setItem('access', tokens.access);
      storage.setItem('refresh', tokens.refresh);
      storage.setItem('refresh_token', tokens.refresh);

      // Load user profile and permissions
      const authHeaders = { Authorization: `Bearer ${tokens.access}` };
      const [me, perms] = await Promise.all([
        makeApiRequest('/current-user/', { headers: authHeaders }),
        makeApiRequest('/auth/permissions/', { headers: authHeaders }),
      ]);

      if (!me.success) {
        // Tokens invalid; clear and fail
        ['localStorage', 'sessionStorage'].forEach((storeName) => {
          const store = storeName === 'localStorage' ? localStorage : sessionStorage;
          store.removeItem('access');
          store.removeItem('refresh');
          store.removeItem('refresh_token');
        });
        return { success: false, error: me.error || 'Unable to load profile' };
      }

      setUser(me.data);
      const basePerms = ['analytics.view', 'settings.view'];
      const adminPerms = me.data?.is_staff || me.data?.is_superuser ? ['admin'] : [];
      const permsArray = Array.isArray(perms?.data?.results?.permissions)
        ? perms.data.results.permissions
        : Array.isArray(perms?.data?.permissions)
          ? perms.data.permissions
          : Array.isArray(perms?.data)
            ? perms.data
            : [];
      setPermissions([...new Set([...basePerms, ...adminPerms, ...permsArray])]);
      setSessionExpiry(new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const hasPermission = useCallback((permission) => {
    return permissions.includes('admin') || permissions.includes(permission);
  }, [permissions]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      if (!user?.id) return { success: false, error: 'No user' };
      const result = await makeApiRequest(`/users/${user.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });

      if (result.success) {
        setUser(prev => ({ ...prev, ...result.data }));
        return { success: true };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    permissions,
    sessionExpiry,
    login,
    logout,
    hasPermission,
    updateProfile
  }), [user, loading, permissions, sessionExpiry, login, logout, hasPermission, updateProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Comprehensive Admin Data Context
const AdminDataContext = createContext();

const AdminDataProvider = ({ children }) => {
  const [state, setState] = useState({
    // Data stores
    users: [],
    companies: [],
    posts: [],
    comments: [],
    media: [],
    messages: [],
    notifications: [],
    analytics: {},
    systemStats: {},
    activities: [],
    
    // UI state
    loading: {},
    errors: {},
    filters: {
      users: { search: '', status: 'all', role: 'all' },
      companies: { search: '', status: 'all', type: 'all' },
      posts: { search: '', status: 'all', author: 'all' },
      comments: { search: '', status: 'all', author: 'all' },
      media: { search: '', type: 'all', size: 'all' },
      messages: { search: '', status: 'all' }
    },
    sorting: {
      users: { field: 'date_joined', direction: 'desc' },
      companies: { field: 'created_at', direction: 'desc' },
      posts: { field: 'created_at', direction: 'desc' },
      messages: { field: 'timestamp', direction: 'desc' }
    },
    pagination: {
      users: { page: 1, limit: 20, total: 0 },
      companies: { page: 1, limit: 20, total: 0 },
      posts: { page: 1, limit: 20, total: 0 },
      messages: { page: 1, limit: 20, total: 0 }
    },
    
    // Cache and metadata
    cache: new Map(),
    lastFetch: {},
    selectedItems: {},

    // Notifications and toasts
    unreadNotificationsCount: 0,
    toasts: []
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const setLoading = useCallback((key, isLoading) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: isLoading }
    }));
  }, []);

  const setError = useCallback((key, error) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
  }, []);

  const clearError = useCallback((key) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: null }
    }));
  }, []);

  // Toast helpers
  const removeToast = useCallback((id) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setState(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  // Keep a ref to the latest state to avoid re-creating callbacks on every change
  const stateRef = React.useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Live-only data fetching (no demo fallbacks)
  const fetchData = useCallback(async (endpoint, key, options = {}) => {
    const current = stateRef.current;
    const {
      transform = (data) => data,
      useCache = true,
      cacheDuration = 300000, // 5 minutes
      params = {}
    } = options;

    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const fullEndpoint = endpoint + queryString;
    const cacheKey = `${fullEndpoint}-${JSON.stringify(current.filters[key] || {})}`;

    if (
      useCache &&
      current.cache.has(cacheKey) &&
      Date.now() - (current.lastFetch[cacheKey] || 0) < cacheDuration
    ) {
      return { success: true, data: current.cache.get(cacheKey) };
    }

    setLoading(key, true);
    clearError(key);

    try {
      const result = await makeApiRequest(fullEndpoint);

      if (result.success) {
        const transformedData = transform(result.data);
        if (useCache) {
          // Mutate cache map intentionally (stored in state) for performance; track freshness separately
          current.cache.set(cacheKey, transformedData);
          updateState({
            lastFetch: { ...current.lastFetch, [cacheKey]: Date.now() }
          });
        }
        updateState({ [key]: transformedData });
        return { success: true, data: transformedData };
      } else {
        throw new Error(result.error || 'Request failed');
      }
    } catch (error) {
      console.warn(`API call failed for ${key}:`, error.message);
      const emptyValue = Array.isArray(current[key]) ? [] : {};
      updateState({ [key]: emptyValue });
      setError(key, error.message);
      return { success: false, error: error.message, data: emptyValue };
    } finally {
      setLoading(key, false);
    }
  }, [setLoading, clearError, updateState]);

  // Unread notifications counter (efficient via count)
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await makeApiRequest('/notifications/?page_size=1&is_read=false');
      if (res.success) {
        const total = Number.isFinite(res.data?.count) ? res.data.count : 0;
        updateState({ unreadNotificationsCount: total });
      }
    } catch (e) {
      // ignore errors silently
    }
  }, [updateState]);

  useEffect(() => {
    refreshUnreadCount();
    const id = setInterval(refreshUnreadCount, 60000);
    return () => clearInterval(id);
  }, [refreshUnreadCount]);

  const contextValue = useMemo(() => ({
    ...state,
    updateState,
    setLoading,
    setError,
    clearError,
    fetchData,
    makeApiRequest,
    addToast,
    removeToast,
    refreshUnreadCount,
  }), [state, updateState, setLoading, setError, clearError, fetchData, addToast, removeToast, refreshUnreadCount]);

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
};

const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};

// Enhanced Login Component
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '',
    remember: false 
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast, toasts, removeToast } = useAdminData();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    if (params.get('expired') === '1') {
      addToast('Session expired. Please login again.', 'warning', 5000);
    }
  }, [loc.search, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      setSubmitting(false);
      return;
    }
    
    const result = await login(credentials);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      {/* Toasts on login page */}
      <div className="fixed top-4 right-4 space-y-3 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm shadow-lg rounded-lg border px-4 py-3 flex items-start space-x-3 ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className="text-lg">
              {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1 text-sm leading-5">{t.message}</div>
            <button onClick={() => removeToast(t.id)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-gray-600 mt-2">Sign in to your admin account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
                disabled={submitting}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
                disabled={submitting}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={credentials.remember}
                  onChange={(e) => setCredentials({...credentials, remember: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={submitting}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// RequirePermission for nested routes (assumes user is authenticated by outer guard)
const RequirePermission = ({ permission, children }) => {
  const { hasPermission } = useAuth();
  if (!permission) return children;
  if (!hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  return children;
};

// Main Admin Layout Component (will continue in next part)
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { unreadNotificationsCount, toasts, removeToast } = useAdminData();

  const navigation = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: DashboardIcon,
      permission: 'admin'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: UsersIcon,
      permission: 'users.view',
      subItems: [
        { name: 'All Users', path: '/admin/users', permission: 'users.view' },
        { name: 'Add User', path: '/admin/users/add', permission: 'users.add' },
        { name: 'User Roles', path: '/admin/users/roles', permission: 'users.change' }
      ]
    },
    {
      name: 'Companies',
      path: '/admin/companies',
      icon: CompanyIcon,
      permission: 'companies.view',
      subItems: [
        { name: 'All Companies', path: '/admin/companies', permission: 'companies.view' },
        { name: 'Add Company', path: '/admin/companies/add', permission: 'companies.add' },
        { name: 'Verification', path: '/admin/companies/verify', permission: 'companies.change' }
      ]
    },
    {
      name: 'Deal Rooms',
      path: '/admin/deals',
      icon: CompanyIcon, // Using CompanyIcon as placeholder
      permission: 'admin',
      subItems: [
        { name: 'All Deals', path: '/admin/deals', permission: 'admin' },
        { name: 'Active Deals', path: '/admin/deals/active', permission: 'admin' },
        { name: 'Completed Deals', path: '/admin/deals/completed', permission: 'admin' },
        { name: 'Deal Analytics', path: '/admin/deals/analytics', permission: 'admin' }
      ]
    },
    {
      name: 'Workforce',
      path: '/admin/workforce',
      icon: UsersIcon,
      permission: 'admin',
      subItems: [
        { name: 'All Workforce', path: '/admin/workforce', permission: 'admin' },
        { name: 'Job Postings', path: '/admin/workforce/jobs', permission: 'admin' },
        { name: 'Applications', path: '/admin/workforce/applications', permission: 'admin' },
        { name: 'Workforce Analytics', path: '/admin/workforce/analytics', permission: 'admin' }
      ]
    },
    {
      name: 'Logistics',
      path: '/admin/logistics',
      icon: ServiceIcon, // Using ServiceIcon as placeholder
      permission: 'admin',
      subItems: [
        { name: 'All Logistics', path: '/admin/logistics', permission: 'admin' },
        { name: 'Shipments', path: '/admin/logistics/shipments', permission: 'admin' },
        { name: 'Warehouses', path: '/admin/logistics/warehouses', permission: 'admin' },
        { name: 'Logistics Analytics', path: '/admin/logistics/analytics', permission: 'admin' }
      ]
    },
    {
      name: 'Knowledge Hub',
      path: '/admin/knowledge',
      icon: DocumentIcon,
      permission: 'admin',
      subItems: [
        { name: 'All Articles', path: '/admin/knowledge', permission: 'admin' },
        { name: 'Categories', path: '/admin/knowledge/categories', permission: 'admin' },
        { name: 'FAQs', path: '/admin/knowledge/faqs', permission: 'admin' },
        { name: 'Knowledge Analytics', path: '/admin/knowledge/analytics', permission: 'admin' }
      ]
    },
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: TrendingIcon,
      permission: 'admin',
      subItems: [
        { name: 'All Subscriptions', path: '/admin/subscriptions', permission: 'admin' },
        { name: 'Plans', path: '/admin/subscriptions/plans', permission: 'admin' },
        { name: 'Billing', path: '/admin/subscriptions/billing', permission: 'admin' },
        { name: 'Subscription Analytics', path: '/admin/subscriptions/analytics', permission: 'admin' }
      ]
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: DocumentIcon,
      permission: 'content.view',
      subItems: [
        { name: 'All Posts', path: '/admin/content', permission: 'content.view' },
        { name: 'Create Post', path: '/admin/content/create', permission: 'content.add' },
        { name: 'Comments', path: '/admin/content/comments', permission: 'content.view' },
        { name: 'Media Library', path: '/admin/content/media', permission: 'content.view' }
      ]
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: ProductIcon,
      permission: 'products.view',
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: ServiceIcon,
      permission: 'services.view',
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: NotificationIcon,
      permission: 'notifications.view',
      subItems: [
        { name: 'All Notifications', path: '/admin/notifications', permission: 'notifications.view' },
        { name: 'Create Notification', path: '/admin/notifications/create', permission: 'notifications.add' },
        { name: 'Templates', path: '/admin/notifications/templates', permission: 'notifications.view' },
        { name: 'Analytics', path: '/admin/notifications/analytics', permission: 'notifications.view' }
      ]
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: TrendingIcon,
      permission: 'admin',
      subItems: [
        { name: 'Overview', path: '/admin/analytics', permission: 'admin' },
        { name: 'User Analytics', path: '/admin/analytics/users', permission: 'admin' },
        { name: 'Content Reports', path: '/admin/analytics/content', permission: 'admin' },
        { name: 'Export Reports', path: '/admin/analytics/export', permission: 'admin' }
      ]
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: SettingsIcon,
      permission: 'admin',
      subItems: [
        { name: 'General', path: '/admin/settings', permission: 'admin' },
        { name: 'Email Config', path: '/admin/settings/email', permission: 'admin' },
        { name: 'Security', path: '/admin/settings/security', permission: 'admin' },
        { name: 'Integrations', path: '/admin/settings/integrations', permission: 'admin' }
      ]
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: MessageIcon,
      permission: 'messages.view'
    },
    {
      name: 'System',
      path: '/admin/system',
      icon: SystemIcon,
      permission: 'system.manage',
      subItems: [
        { name: 'Settings', path: '/admin/system/settings', permission: 'system.manage' },
        { name: 'Logs', path: '/admin/system/logs', permission: 'system.manage' },
        { name: 'Backups', path: '/admin/system/backups', permission: 'system.manage' }
      ]
    }
  ];

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Modern Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} glass rounded-r-3xl shadow-large transition-all duration-300 ease-in-out border-r border-white/20`}>
        <div className="flex flex-col h-full">
          {/* Modern Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Connectize
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
            </button>
          </div>

          {/* Modern Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const IconComponent = item.icon;
              return (
                <div key={item.path} className="animate-in">
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-white/20 text-blue-700 shadow-medium border border-white/30' 
                        : 'text-gray-600 hover:bg-white/10 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 group-hover:bg-white/10'
                    }`}>
                      <IconComponent size={18} />
                    </div>
                    {sidebarOpen && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                  
                  {/* Modern Sub-items */}
                  {sidebarOpen && isActive && item.subItems && (
                    <div className="ml-6 mt-2 space-y-1 animate-in">
                      {item.subItems
                        .filter(subItem => hasPermission(subItem.permission))
                        .map(subItem => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              location.pathname === subItem.path
                                ? 'text-blue-700 bg-blue-50/60 font-medium'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/10'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Modern User Profile */}
          <div className="border-t border-white/10 p-4">
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-full flex items-center text-left hover:bg-white/10 rounded-xl p-3 transition-all duration-200"
              >
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.[0] || user?.username?.[0] || 'A'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </button>

              {/* Modern Profile Dropdown */}
              {profileMenuOpen && sidebarOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 glass rounded-xl shadow-large border border-white/20 py-2 animate-in">
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-white/10 transition-colors rounded-lg mx-2"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/60 transition-colors rounded-lg mx-2"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Top Bar */}
        <header className="glass border-b border-white/20 shadow-soft">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {user?.first_name || user?.username}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link 
                  to="/admin/notifications" 
                  className="relative p-3 glass rounded-xl hover:bg-white/20 transition-all duration-200 group" 
                  aria-label="Notifications"
                >
                  <NotificationIcon size={20} className="text-gray-600 group-hover:text-blue-600" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium shadow-medium">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>
                <button className="p-3 glass rounded-xl hover:bg-white/20 transition-all duration-200 group" aria-label="Settings">
                  <SettingsIcon size={20} className="text-gray-600 group-hover:text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Modern Page Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="animate-in">
            {children}
          </div>
        </main>

        {/* Modern Toast Notifications */}
        <div className="fixed top-4 right-4 space-y-3 z-50">
          {toasts.map(t => (
            <div key={t.id} className={`max-w-sm glass rounded-xl shadow-large px-6 py-4 flex items-start space-x-3 animate-in ${
              t.type === 'success' ? 'border-l-4 border-green-500' :
              t.type === 'error' ? 'border-l-4 border-red-500' :
              t.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            }`}>
              <div className={`p-1 rounded-lg ${
                t.type === 'success' ? 'bg-green-100 text-green-600' :
                t.type === 'error' ? 'bg-red-100 text-red-600' :
                t.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : t.type === 'warning' ? '⚠' : 'ℹ'}
              </div>
              <div className="flex-1 text-sm leading-5 text-gray-800 font-medium">{t.message}</div>
              <button 
                onClick={() => removeToast(t.id)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Minimal Profile Settings page
const AdminProfile = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <p className="text-gray-600">Logged in as {user?.email || user?.username}</p>
    </div>
  );
};

// Main Admin Component
const ComprehensiveAdmin = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="auth" element={<AdminAuth />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <ErrorBoundary>
            <Routes>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<RequirePermission permission="admin"><AdminDashboard /></RequirePermission>} />
              
              {/* User Management Routes */}
              <Route path="users" element={<RequirePermission permission="users.view"><AdminUsersManagement /></RequirePermission>} />
              <Route path="users/:id" element={<RequirePermission permission="users.view"><AdminUserDetail /></RequirePermission>} />
              <Route path="users/add" element={<RequirePermission permission="users.add"><AdminUsersManagement /></RequirePermission>} />
              <Route path="users/roles" element={<RequirePermission permission="users.change"><PlaceholderPage title="User Roles Management" subtitle="Manage user roles and permissions" /></RequirePermission>} />
              
              {/* Company Management Routes */}
              <Route path="companies" element={<RequirePermission permission="companies.view"><AdminCompaniesManagement /></RequirePermission>} />
              <Route path="companies/:id" element={<RequirePermission permission="companies.view"><AdminCompanyDetail /></RequirePermission>} />
              <Route path="companies/add" element={<RequirePermission permission="companies.add"><AdminCompaniesManagement /></RequirePermission>} />
              <Route path="companies/verify" element={<RequirePermission permission="companies.change"><PlaceholderPage title="Company Verification" subtitle="Manage company verification requests and status updates" /></RequirePermission>} />
              
              {/* Deal Rooms Management Routes */}
              <Route path="deals" element={<RequirePermission permission="admin"><AdminDeals /></RequirePermission>} />
              <Route path="deals/active" element={<RequirePermission permission="admin"><AdminDeals /></RequirePermission>} />
              <Route path="deals/completed" element={<RequirePermission permission="admin"><AdminDeals /></RequirePermission>} />
              <Route path="deals/analytics" element={<RequirePermission permission="admin"><AdminDeals /></RequirePermission>} />
              
              {/* Workforce Management Routes */}
              <Route path="workforce" element={<RequirePermission permission="admin"><AdminWorkforce /></RequirePermission>} />
              <Route path="workforce/jobs" element={<RequirePermission permission="admin"><AdminWorkforce /></RequirePermission>} />
              <Route path="workforce/applications" element={<RequirePermission permission="admin"><AdminWorkforce /></RequirePermission>} />
              <Route path="workforce/analytics" element={<RequirePermission permission="admin"><AdminWorkforce /></RequirePermission>} />
              
              {/* Logistics Management Routes */}
              <Route path="logistics" element={<RequirePermission permission="admin"><AdminLogistics /></RequirePermission>} />
              <Route path="logistics/shipments" element={<RequirePermission permission="admin"><AdminLogistics /></RequirePermission>} />
              <Route path="logistics/warehouses" element={<RequirePermission permission="admin"><AdminLogistics /></RequirePermission>} />
              <Route path="logistics/analytics" element={<RequirePermission permission="admin"><AdminLogistics /></RequirePermission>} />
              
              {/* Knowledge Hub Management Routes */}
              <Route path="knowledge" element={<RequirePermission permission="admin"><AdminKnowledge /></RequirePermission>} />
              <Route path="knowledge/categories" element={<RequirePermission permission="admin"><AdminKnowledge /></RequirePermission>} />
              <Route path="knowledge/faqs" element={<RequirePermission permission="admin"><AdminKnowledge /></RequirePermission>} />
              <Route path="knowledge/analytics" element={<RequirePermission permission="admin"><AdminKnowledge /></RequirePermission>} />
              
              {/* Subscription Management Routes */}
              <Route path="subscriptions" element={<RequirePermission permission="admin"><AdminSubscriptions /></RequirePermission>} />
              <Route path="subscriptions/plans" element={<RequirePermission permission="admin"><AdminSubscriptions /></RequirePermission>} />
              <Route path="subscriptions/billing" element={<RequirePermission permission="admin"><AdminSubscriptions /></RequirePermission>} />
              <Route path="subscriptions/analytics" element={<RequirePermission permission="admin"><AdminSubscriptions /></RequirePermission>} />
              
              {/* Content Management Routes */}
              <Route path="content" element={<RequirePermission permission="content.view"><AdminPostsManagement /></RequirePermission>} />
              <Route path="content/:id" element={<RequirePermission permission="content.view"><AdminPostDetail /></RequirePermission>} />
              <Route path="content/create" element={<RequirePermission permission="content.add"><AdminPostsManagement /></RequirePermission>} />
              <Route path="content/comments" element={<RequirePermission permission="content.view"><AdminContentManagement /></RequirePermission>} />
              <Route path="content/media" element={<RequirePermission permission="content.view"><AdminContentManagement /></RequirePermission>} />
              
              {/* Product & Service Routes */}
              <Route path="products" element={<RequirePermission permission="products.view"><AdminProductsManagement /></RequirePermission>} />
              <Route path="products/:id" element={<RequirePermission permission="products.view"><AdminProductDetail /></RequirePermission>} />
              <Route path="services" element={<RequirePermission permission="services.view"><AdminServicesManagement /></RequirePermission>} />
              <Route path="services/:id" element={<RequirePermission permission="services.view"><AdminServiceDetail /></RequirePermission>} />
              
              {/* Notification Routes */}
              <Route path="notifications" element={<RequirePermission permission="notifications.view"><AdminNotifications /></RequirePermission>} />
              <Route path="notifications/:id" element={<RequirePermission permission="notifications.view"><AdminNotificationDetail /></RequirePermission>} />
              <Route path="notifications/create" element={<RequirePermission permission="notifications.add"><AdminNotifications /></RequirePermission>} />
              <Route path="notifications/templates" element={<RequirePermission permission="notifications.view"><PlaceholderPage title="Notification Templates" subtitle="Manage and customize notification templates" /></RequirePermission>} />
              <Route path="notifications/analytics" element={<RequirePermission permission="notifications.view"><PlaceholderPage title="Notification Analytics" subtitle="View notification performance and engagement metrics" /></RequirePermission>} />
              
              {/* Message Routes */}
              <Route path="messages" element={<RequirePermission permission="messages.view"><AdminMessagesManagement /></RequirePermission>} />
              
              {/* Analytics Routes */}
              <Route path="analytics" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/users" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/content" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/export" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/engagement" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/retention" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="analytics/performance" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              
              {/* Settings Routes */}
              <Route path="settings" element={<RequirePermission permission="admin"><AdminSystemSettings /></RequirePermission>} />
              <Route path="settings/email" element={<RequirePermission permission="admin"><PlaceholderPage title="Email Configuration" subtitle="Configure email settings and SMTP servers" /></RequirePermission>} />
              <Route path="settings/security" element={<RequirePermission permission="admin"><PlaceholderPage title="Security Settings" subtitle="Manage security policies and authentication settings" /></RequirePermission>} />
              <Route path="settings/integrations" element={<RequirePermission permission="admin"><PlaceholderPage title="Integrations" subtitle="Configure third-party integrations and API settings" /></RequirePermission>} />
              
              {/* System Routes */}
              <Route path="system/settings" element={<RequirePermission permission="system.manage"><PlaceholderPage title="System Settings" subtitle="Configure system-wide settings and preferences" /></RequirePermission>} />
              <Route path="system/logs" element={<RequirePermission permission="system.manage"><PlaceholderPage title="System Logs" subtitle="View and manage system logs and error reports" /></RequirePermission>} />
              <Route path="system/backups" element={<RequirePermission permission="system.manage"><PlaceholderPage title="System Backups" subtitle="Manage database backups and restore points" /></RequirePermission>} />
              
              {/* Profile Route */}
              <Route path="profile" element={<AdminProfile />} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
            </ErrorBoundary>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// Main Wrapper
const ComprehensiveAdminWrapper = () => {
  return (
    <AuthProvider>
      <AdminDataProvider>
        <ComprehensiveAdmin />
      </AdminDataProvider>
    </AuthProvider>
  );
};

// Export the hooks for use in other components
export { useAuth, useAdminData };

export default ComprehensiveAdminWrapper;

// Simple error boundary to avoid blank pages on runtime errors in route components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Admin route error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <div className="max-w-xl mx-auto text-center bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-3xl mb-2">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 text-sm">{String(this.state.error?.message || 'Unknown error')}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
