import React, { createContext, useContext, useState } from 'react';

const TestAuthContext = createContext();

export const useTestAuth = () => {
  const context = useContext(TestAuthContext);
  if (!context) {
    throw new Error('useTestAuth must be used within a TestAuthProvider');
  }
  return context;
};

export const TestAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Test users for demonstration
  const testUsers = {
    organizer1: {
      id: 123,
      email: 'organizer1@example.com',
      name: 'John Smith',
      role: 'organizer'
    },
    attendee1: {
      id: 125, 
      email: 'attendee1@example.com',
      name: 'Mike Chen',
      role: 'attendee'
    }
  };

  const loginAsTestUser = (userKey) => {
    const testUser = testUsers[userKey];
    if (testUser) {
      setUser(testUser);
      setIsAuthenticated(true);
      // Store in localStorage for persistence
      localStorage.setItem('testUser', JSON.stringify(testUser));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('testUser');
  };

  // Check for existing test user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('testUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loginAsTestUser,
    logout,
    testUsers
  };

  return (
    <TestAuthContext.Provider value={value}>
      {children}
    </TestAuthContext.Provider>
  );
};
