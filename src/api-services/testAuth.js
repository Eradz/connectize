// Test authentication utility for API requests
let testUser = null;

export const setTestUser = (user) => {
  testUser = user;
};

export const getTestUser = () => {
  return testUser;
};

export const clearTestUser = () => {
  testUser = null;
};

// Mock authentication headers for testing
export const getTestAuthHeaders = () => {
  if (!testUser) return {};
  
  // For testing purposes, we'll simulate the user context
  // In a real app, this would be a proper JWT token
  return {
    'X-Test-User-ID': testUser.id,
    'X-Test-User-Email': testUser.email
  };
};

// Function to simulate API calls with test user data
export const simulateAuthenticatedCall = async (apiCall, mockDataGenerator) => {
  try {
    // Try the real API call first
    return await apiCall();
  } catch (error) {
    // Handle authentication errors, CORS errors, or when we have a test user
    const isAuthError = error.response?.status === 401;
    const isCorsError = error.message?.includes('CORS') || error.message?.includes('Access-Control');
    const hasNetworkError = !error.response;
    
    if ((isAuthError || isCorsError || hasNetworkError) && testUser) {
      // If we have any API access issues but we have a test user, return mock data
      console.log('API call failed, using test data for user:', testUser.name, '| Error:', error.message);
      return { data: mockDataGenerator(testUser) };
    }
    throw error;
  }
};
