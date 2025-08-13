import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Link, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';

// Import Dashboard Component
import AdminDashboardComponent from './AdminDashboardComponent';
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
    const checkAuth = async () => {
      try {
        const access = localStorage.getItem('access') || sessionStorage.getItem('access');
        if (access) {
          // Verify JWT access token
          const verify = await makeApiRequest('/auth/verify-token/', {
            method: 'POST',
            body: JSON.stringify({ token: access })
          });

          if (verify.success) {
            // Load current user profile
            const me = await makeApiRequest('/current-user/');
            // Load user permissions (protected endpoint, Authorization is attached)
            const perms = await makeApiRequest('/auth/permissions/');
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
      icon: '📊',
      permission: 'admin'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
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
      icon: '🏢',
      permission: 'companies.view',
      subItems: [
        { name: 'All Companies', path: '/admin/companies', permission: 'companies.view' },
        { name: 'Add Company', path: '/admin/companies/add', permission: 'companies.add' },
        { name: 'Verification', path: '/admin/companies/verify', permission: 'companies.change' }
      ]
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: '📝',
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
      icon: '📦',
      permission: 'products.view',
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: '🛠️',
      permission: 'services.view',
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: '🔔',
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
      icon: '📊',
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
      icon: '⚙️',
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
      icon: '💬',
      permission: 'messages.view'
    },
    {
      name: 'System',
      path: '/admin/system',
      icon: '⚙️',
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-xl transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Connectize</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                  
                  {/* Sub-items */}
                  {sidebarOpen && isActive && item.subItems && (
                    <div className="ml-6 mt-2">
                      {item.subItems
                        .filter(subItem => hasPermission(subItem.permission))
                        .map(subItem => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              location.pathname === subItem.path
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-full flex items-center text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.[0] || user?.username?.[0] || 'A'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.username}</p>
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && sidebarOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border py-2">
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.first_name || user?.username}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/admin/notifications" className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Notifications">
                  <span className="text-xl">🔔</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Settings">
                  <span className="text-xl">⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>

        {/* Toasts */}
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
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<RequirePermission permission="admin"><AdminDashboardComponent /></RequirePermission>} />
              <Route path="users" element={<RequirePermission permission="users.view"><AdminUsersManagement /></RequirePermission>} />
              <Route path="users/:id" element={<RequirePermission permission="users.view"><AdminUserDetail /></RequirePermission>} />
              <Route path="users/add" element={<RequirePermission permission="users.add"><AdminUsersManagement /></RequirePermission>} />
              <Route path="companies" element={<RequirePermission permission="companies.view"><AdminCompaniesManagement /></RequirePermission>} />
              <Route path="companies/:id" element={<RequirePermission permission="companies.view"><AdminCompanyDetail /></RequirePermission>} />
              <Route path="companies/add" element={<RequirePermission permission="companies.add"><AdminCompaniesManagement /></RequirePermission>} />
              <Route path="content" element={<RequirePermission permission="content.view"><AdminPostsManagement /></RequirePermission>} />
              <Route path="content/:id" element={<RequirePermission permission="content.view"><AdminPostDetail /></RequirePermission>} />
              <Route path="content/create" element={<RequirePermission permission="content.add"><AdminPostsManagement /></RequirePermission>} />
              <Route path="content/comments" element={<RequirePermission permission="content.view"><AdminContentManagement /></RequirePermission>} />
              <Route path="content/media" element={<RequirePermission permission="content.view"><AdminContentManagement /></RequirePermission>} />
              <Route path="products" element={<RequirePermission permission="products.view"><AdminProductsManagement /></RequirePermission>} />
              <Route path="products/:id" element={<RequirePermission permission="products.view"><AdminProductDetail /></RequirePermission>} />
              <Route path="services" element={<RequirePermission permission="services.view"><AdminServicesManagement /></RequirePermission>} />
              <Route path="services/:id" element={<RequirePermission permission="services.view"><AdminServiceDetail /></RequirePermission>} />
              <Route path="notifications" element={<RequirePermission permission="notifications.view"><AdminNotifications /></RequirePermission>} />
              <Route path="notifications/:id" element={<RequirePermission permission="notifications.view"><AdminNotificationDetail /></RequirePermission>} />
              <Route path="notifications/create" element={<RequirePermission permission="notifications.add"><AdminNotifications /></RequirePermission>} />
              <Route path="analytics" element={<RequirePermission permission="admin"><AdminAnalyticsReports /></RequirePermission>} />
              <Route path="settings" element={<RequirePermission permission="admin"><AdminSystemSettings /></RequirePermission>} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
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
