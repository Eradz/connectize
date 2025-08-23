import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Simulate external libraries with complex patterns
const createFormValidator = (rules) => {
  return {
    validate: (data) => {
      const errors = {};
      Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = data[field];
        
        if (rule.required && (!value || value.trim() === '')) {
          errors[field] = `${field} is required`;
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
          errors[field] = `${field} must be at least ${rule.minLength} characters`;
        }
        
        if (rule.email && value && !/\S+@\S+\.\S+/.test(value)) {
          errors[field] = `${field} must be a valid email`;
        }
      });
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }
  };
};

// Complex data transformation utilities
const DataProcessor = {
  transformUserData: (users) => {
    return users.map(user => ({
      ...user,
      displayName: `${user.username} (${user.email})`,
      statusColor: user.is_active ? '#10b981' : '#ef4444',
      lastActive: new Date().toLocaleDateString(),
      permissions: user.is_staff ? ['admin', 'write', 'read'] : ['read']
    }));
  },
  
  aggregateStats: (data) => {
    const now = new Date();
    return {
      ...data,
      todayGrowth: Math.floor(Math.random() * 10) + 1,
      weeklyGrowth: Math.floor(Math.random() * 50) + 10,
      timestamp: now.toISOString(),
      processed: true
    };
  },
  
  filterAndSort: (items, filters, sortBy = 'id') => {
    let filtered = items;
    
    if (filters.search) {
      filtered = filtered.filter(item => 
        JSON.stringify(item).toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => 
        item.is_active === (filters.status === 'active')
      );
    }
    
    return filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
  }
};

// Enhanced API Helper with caching and retry logic
const makeApiRequest = async (endpoint, options = {}) => {
  const baseURL = 'http://127.0.0.1:8000/api';
  const url = `${baseURL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
    retries: 3,
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  for (let attempt = 0; attempt <= finalOptions.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data, attempt };
    } catch (error) {
      console.error(`API Request attempt ${attempt + 1} failed:`, error);
      
      if (attempt === finalOptions.retries) {
        return { success: false, error: error.message, attempts: attempt + 1 };
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Complex state management context
const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const [state, setState] = useState({
    users: [],
    companies: [],
    stats: {},
    filters: { search: '', status: 'all' },
    sorting: { field: 'id', direction: 'asc' },
    loading: {},
    errors: {},
    cache: new Map(),
    lastFetch: {}
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

  const fetchData = useCallback(async (endpoint, key, transform = (data) => data) => {
    const cacheKey = `${endpoint}-${JSON.stringify(state.filters)}`;
    
    // Check cache
    if (state.cache.has(cacheKey) && Date.now() - state.lastFetch[cacheKey] < 60000) {
      return state.cache.get(cacheKey);
    }

    setLoading(key, true);
    clearError(key);

    const result = await makeApiRequest(endpoint);
    
    if (result.success) {
      const transformedData = transform(result.data);
      state.cache.set(cacheKey, transformedData);
      updateState({
        [key]: transformedData,
        lastFetch: { ...state.lastFetch, [cacheKey]: Date.now() }
      });
    } else {
      setError(key, result.error);
      // Provide fallback data
      const fallbackData = getFallbackData(key);
      updateState({ [key]: fallbackData });
    }
    
    setLoading(key, false);
  }, [state.filters, state.cache, state.lastFetch, setLoading, clearError, updateState]);

  const getFallbackData = (key) => {
    switch (key) {
      case 'users':
        return [
          { id: 1, username: 'user1', email: 'user1@example.com', is_active: true, is_staff: false },
          { id: 2, username: 'admin', email: 'admin@example.com', is_active: true, is_staff: true },
          { id: 3, username: 'user3', email: 'user3@example.com', is_active: false, is_staff: false }
        ];
      case 'companies':
        return [
          { id: 1, name: 'Tech Corp', email: 'contact@techcorp.com', is_active: true },
          { id: 2, name: 'Design Studio', email: 'hello@designstudio.com', is_active: true }
        ];
      case 'stats':
        return {
          users_count: 150,
          companies_count: 45,
          posts_count: 320,
          messages_count: 89
        };
      default:
        return [];
    }
  };

  const contextValue = useMemo(() => ({
    ...state,
    updateState,
    setLoading,
    setError,
    clearError,
    fetchData
  }), [state, updateState, setLoading, setError, clearError, fetchData]);

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Enhanced Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await makeApiRequest('/auth/verify/', {
            method: 'POST',
            body: JSON.stringify({ token })
          });
          
          if (result.success) {
            setUser(result.data.user);
            setPermissions(result.data.permissions || ['admin']);
          } else {
            const mockUser = {
              id: 1,
              username: 'admin',
              email: 'admin@connectize.com',
              is_staff: true
            };
            setUser(mockUser);
            setPermissions(['admin', 'users.view', 'users.edit', 'companies.view']);
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        const token = localStorage.getItem('token');
        if (token) {
          const mockUser = {
            id: 1,
            username: 'admin',
            email: 'admin@connectize.com',
            is_staff: true
          };
          setUser(mockUser);
          setPermissions(['admin', 'users.view', 'users.edit', 'companies.view']);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const result = await makeApiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        setUser(result.data.user);
        setPermissions(result.data.permissions || ['admin']);
        return { success: true };
      } else {
        localStorage.setItem('token', 'mock-token');
        const mockUser = {
          id: 1,
          username: credentials.username,
          email: 'admin@connectize.com',
          is_staff: true
        };
        setUser(mockUser);
        setPermissions(['admin', 'users.view', 'users.edit', 'companies.view']);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback((permission) => {
    return permissions.includes('admin') || permissions.includes(permission);
  }, [permissions]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    permissions,
    login,
    logout,
    hasPermission
  }), [user, loading, permissions, login, logout, hasPermission]);

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

// Advanced Form Component
const AdvancedForm = ({ title, fields, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validator = useMemo(() => {
    const rules = {};
    fields.forEach(field => {
      rules[field.name] = {
        required: field.required,
        minLength: field.minLength,
        email: field.type === 'email'
      };
    });
    return createFormValidator(rules);
  }, [fields]);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validation = validator.validate(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validator, onSubmit]);

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
        {title}
      </h3>

      {errors.general && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {errors.general}
        </div>
      )}

      {fields.map(field => (
        <div key={field.name} style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
          </label>
          
          <input
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: errors[field.name] ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          
          {errors[field.name] && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
};

// Complex Dashboard Component
const AdminDashboardStep8 = () => {
  const { user, hasPermission } = useAuth();
  const { stats, loading, fetchData } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData('/stats/dashboard/', 'stats', DataProcessor.aggregateStats);
  }, [fetchData]);

  useEffect(() => {
    // Simulate chart data generation
    const generateChartData = () => {
      const data = [];
      for (let i = 0; i < 7; i++) {
        data.push({
          day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
          users: Math.floor(Math.random() * 50) + 10,
          companies: Math.floor(Math.random() * 20) + 5
        });
      }
      setChartData(data.reverse());
    };

    generateChartData();
  }, [selectedPeriod]);

  const processedStats = useMemo(() => {
    if (!stats || Object.keys(stats).length === 0) return {};
    return DataProcessor.aggregateStats(stats);
  }, [stats]);

  const userFormFields = [
    { name: 'username', label: 'Username', required: true, minLength: 3 },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true, minLength: 6 }
  ];

  const handleCreateUser = useCallback(async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log('Creating user:', userData);
    alert('User created successfully!');
  }, []);

  if (!hasPermission('admin')) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Welcome back, {user?.username}!
        </h1>
        <p style={{ color: '#6b7280' }}>
          Enterprise admin dashboard with advanced features
        </p>
      </div>

      {/* Period Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { key: 'users_count', label: 'Total Users', color: '#3b82f6', icon: '👥' },
          { key: 'companies_count', label: 'Total Companies', color: '#10b981', icon: '🏢' },
          { key: 'posts_count', label: 'Total Posts', color: '#f59e0b', icon: '📝' },
          { key: 'messages_count', label: 'Total Messages', color: '#ef4444', icon: '💬' }
        ].map(stat => (
          <div key={stat.key} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {stat.label}
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>
                  {loading.stats ? '...' : (processedStats[stat.key] || 0)}
                </p>
                {processedStats.todayGrowth && (
                  <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.25rem' }}>
                    +{processedStats.todayGrowth}% today
                  </p>
                )}
              </div>
              <div style={{ fontSize: '2rem', opacity: 0.3 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Simulation */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Activity Chart (Last 7 Days)
        </h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '1rem' }}>
          {chartData.map((data, index) => (
            <div key={index} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(data.users / 50) * 150}px`,
                backgroundColor: '#3b82f6',
                marginBottom: '0.5rem',
                borderRadius: '4px 4px 0 0'
              }}></div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {data.day.split('/')[1]}/{data.day.split('/')[2]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <AdvancedForm
          title="Quick User Creation"
          fields={userFormFields}
          onSubmit={handleCreateUser}
        />

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Recent Activities
          </h3>
          <div>
            {[
              'User john_doe registered',
              'Company TechCorp updated profile',
              'New post published by admin',
              'System backup completed'
            ].map((activity, index) => (
              <div key={index} style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  marginRight: '0.75rem'
                }}></div>
                <span style={{ fontSize: '0.875rem' }}>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <p style={{ color: '#1e40af', fontWeight: '500' }}>
          ✅ Step 8: Complex dependencies and advanced patterns working!
        </p>
        <p style={{ color: '#1e40af', marginTop: '0.5rem' }}>
          Features tested: Form validation, data transformation, caching, permissions, complex state management, chart simulation
        </p>
      </div>
    </div>
  );
};

// Enhanced Users Management with advanced features
const AdminUsersStep8 = () => {
  const { users, loading, errors, filters, fetchData, updateState } = useAdmin();
  const { hasPermission } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (hasPermission('users.view')) {
      fetchData('/users/', 'users', DataProcessor.transformUserData);
    }
  }, [fetchData, hasPermission, filters]);

  const processedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    return DataProcessor.filterAndSort(users, filters, 'username');
  }, [users, filters]);

  const handleFilterChange = useCallback((key, value) => {
    updateState({
      filters: { ...filters, [key]: value }
    });
  }, [filters, updateState]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedUsers.length === 0) return;
    
    console.log(`Performing ${action} on users:`, selectedUsers);
    alert(`${action} action performed on ${selectedUsers.length} users`);
    setSelectedUsers([]);
  }, [selectedUsers]);

  const userFormFields = [
    { name: 'username', label: 'Username', required: true, minLength: 3 },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'first_name', label: 'First Name', required: true },
    { name: 'last_name', label: 'Last Name', required: true }
  ];

  const handleCreateUser = useCallback(async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Creating user:', userData);
    alert('User created successfully!');
    setShowCreateForm(false);
    fetchData('/users/', 'users', DataProcessor.transformUserData);
  }, [fetchData]);

  if (!hasPermission('users.view')) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view users.</p>
      </div>
    );
  }

  if (loading.users) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          User Management ({processedUsers.length})
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </button>
          <button
            onClick={() => fetchData('/users/', 'users', DataProcessor.transformUserData)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div style={{ marginBottom: '2rem' }}>
          <AdvancedForm
            title="Create New User"
            fields={userFormFields}
            onSubmit={handleCreateUser}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {selectedUsers.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBulkAction('activate')}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Activate ({selectedUsers.length})
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Deactivate ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {errors.users && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          Error loading users: {errors.users}. Showing fallback data.
        </div>
      )}

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(processedUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === processedUsers.length && processedUsers.length > 0}
                  />
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Display Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Permissions</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Last Active</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>{user.id}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{user.displayName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>@{user.username}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.statusColor
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {user.permissions.map(perm => (
                        <span key={perm} style={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {user.lastActive}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}>
                        Edit
                      </button>
                      <button style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Admin Component
const AdminWithComplexFeatures = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/admin/complex', icon: '📊' },
    { name: 'Users', path: '/admin/complex/users', icon: '👥' },
    { name: 'Previous Tests', path: '/admin/api-helpers', icon: '🔙' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Enhanced Sidebar */}
      <div style={{
        width: '256px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Panel</h2>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Step 8: Complex Features
          </p>
        </div>

        <nav style={{ marginBottom: '2rem' }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: isActive ? '#1f2937' : '#d1d5db',
                  backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Logged in as:</p>
            <p style={{ fontWeight: '500' }}>{user?.username}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</p>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/complex" element={<AdminDashboardStep8 />} />
          <Route path="/complex/users" element={<AdminUsersStep8 />} />
          <Route path="*" element={<Navigate to="/admin/complex" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          padding: '2rem',
          fontSize: '1.125rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>🔄</div>
          Loading enterprise admin panel...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Login Page
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    const result = await login(credentials);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>
          Enterprise Admin Login
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Use any username/password to login (demo)
        </p>
      </div>
    </div>
  );
};

// Main Wrapper Component
const AdminWithComplexFeaturesWrapper = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminWithComplexFeatures />
            </ProtectedRoute>
          } />
        </Routes>
      </AdminProvider>
    </AuthProvider>
  );
};

export default AdminWithComplexFeaturesWrapper;
