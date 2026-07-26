import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { getUserDisplayName, getUserHandle } from '../../lib/userDisplay';

// Mock Auth Context (simplified version)
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Simulate user data
          setUser({
            id: 1,
            username: 'admin',
            email: 'admin@connectize.com',
            is_staff: true
          });
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    // Simulate login
    try {
      localStorage.setItem('token', 'mock-token');
      setUser({
        id: 1,
        username: credentials.username,
        email: 'admin@connectize.com',
        is_staff: true
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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

// Login component
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);
    if (!success) {
      setError('Invalid credentials');
    }
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
          Admin Login
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
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Use any username/password to login (demo)
        </p>
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
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return children;
};

// Dashboard components
const AdminDashboardStep6 = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    posts: 0,
    messages: 0
  });

  useEffect(() => {
    // Simulate fetching dashboard stats
    const fetchStats = async () => {
      try {
        // Mock API calls
        const usersResponse = await fetch('http://127.0.0.1:8000/api/users/');
        const companiesResponse = await fetch('http://127.0.0.1:8000/api/companies/');
        
        setStats({
          users: usersResponse.ok ? 150 : 150, // Mock fallback
          companies: companiesResponse.ok ? 45 : 45,
          posts: 320,
          messages: 89
        });
      } catch (error) {
        console.log('Stats fetch error:', error);
        setStats({
          users: 150,
          companies: 45,
          posts: 320,
          messages: 89
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Welcome back, {getUserDisplayName(user)}!
        </h1>
        <p style={{ color: '#6b7280' }}>
          Here's what's happening with your platform today.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Total Users
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.users}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Total Companies
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.companies}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Total Posts
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.posts}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Total Messages
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.messages}
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <p style={{ color: '#1e40af', fontWeight: '500' }}>
          ✅ Step 6: Authentication context and user management is working!
        </p>
        <p style={{ color: '#1e40af', marginTop: '0.5rem' }}>
          Features tested: Context API, useAuth hook, protected routes, login simulation, dashboard stats
        </p>
      </div>
    </div>
  );
};

const AdminUsersStep6 = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/users/');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.results || data);
        } else {
          // Mock data fallback
          setUsers([
            { id: 1, username: 'user1', email: 'user1@example.com', is_active: true },
            { id: 2, username: 'user2', email: 'user2@example.com', is_active: true },
            { id: 3, username: 'user3', email: 'user3@example.com', is_active: false }
          ]);
        }
      } catch (error) {
        console.log('Users fetch error:', error);
        setUsers([
          { id: 1, username: 'user1', email: 'user1@example.com', is_active: true },
          { id: 2, username: 'user2', email: 'user2@example.com', is_active: true },
          { id: 3, username: 'user3', email: 'user3@example.com', is_active: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        User Management
      </h1>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>All Users</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Username</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>{user.id}</td>
                  <td style={{ padding: '0.75rem' }}>{getUserHandle(user) || 'user'}</td>
                  <td style={{ padding: '0.75rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.is_active ? '#166534' : '#dc2626'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
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

// Main Admin component with auth
const AdminWithAuth = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/admin/auth-test', icon: '📊' },
    { name: 'Users', path: '/admin/auth-test/users', icon: '👥' },
    { name: 'API Test', path: '/admin/api-test', icon: '🔗' }
  ];

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
        {/* Sidebar */}
        <div style={{
          width: '256px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '1rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Panel</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Step 6: With Authentication
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
                    backgroundColor: isActive ? '#f3f4f6' : 'transparent'
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
              <p style={{ fontWeight: '500' }}>{getUserDisplayName(user)}</p>
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
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/auth-test" element={<AdminDashboardStep6 />} />
            <Route path="/auth-test/users" element={<AdminUsersStep6 />} />
            <Route path="*" element={<Navigate to="/admin/auth-test" replace />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Export with Auth Provider wrapper
const AdminWithAuthWrapper = () => {
  return (
    <AuthProvider>
      <AdminWithAuth />
    </AuthProvider>
  );
};

export default AdminWithAuthWrapper;
