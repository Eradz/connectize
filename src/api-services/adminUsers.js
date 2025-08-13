import { makeApiRequest } from "../lib/helpers";

// Get all users with admin filtering
export const getAllUsersAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    return await makeApiRequest({
      url: `api/admin/users/?${queryParams}`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    // Return mock data for development
    return { results: generateMockUsers() };
  }
};

// Get specific user by ID
export const getUserById = async (userId) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Update user status (active/inactive/suspended)
export const updateUserStatus = async (userId, status) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/status/`,
      method: 'PATCH',
      data: { status }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Suspend user account
export const suspendUser = async (userId, reason) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/suspend/`,
      method: 'POST',
      data: { reason }
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

// Reactivate suspended user
export const reactivateUser = async (userId) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/reactivate/`,
      method: 'POST'
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
};

// Delete user account
export const deleteUser = async (userId) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/`,
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get user activity logs
export const getUserActivityLogs = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    return await makeApiRequest({
      url: `api/admin/users/${userId}/activity/?${queryParams}`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
};

// Bulk operations on users
export const bulkUpdateUsers = async (userIds, action, data = {}) => {
  try {
    return await makeApiRequest({
      url: 'api/admin/users/bulk/',
      method: 'POST',
      data: {
        user_ids: userIds,
        action: action,
        data: data,
      }
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    throw error;
  }
};

// Export user data
export const exportUsers = async (format = 'csv', filters = {}) => {
  try {
    const queryParams = new URLSearchParams({ format, ...filters }).toString();
    return await makeApiRequest({
      url: `api/admin/users/export/?${queryParams}`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    throw error;
  }
};

// User verification actions
export const verifyUser = async (userId, verificationData) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/verify/`,
      method: 'POST',
      data: verificationData
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

// Send notification to user
export const sendUserNotification = async (userId, notification) => {
  try {
    return await makeApiRequest({
      url: `api/admin/users/${userId}/notify/`,
      method: 'POST',
      data: notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Generate mock user data for development
function generateMockUsers() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Amanda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const companies = ['TechOil Corp', 'Energy Solutions', 'Industrial Partners', 'Oil & Gas Ltd', 'Equipment Pro'];
  const userTypes = ['individual', 'company'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
    
    return {
      id: i + 1,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone_number: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      user_type: userType,
      is_active: Math.random() > 0.1, // 90% active
      is_verified: Math.random() > 0.2, // 80% verified
      profile_picture: Math.random() > 0.5 ? `https://i.pravatar.cc/150?img=${i + 1}` : null,
      date_joined: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      last_login: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      company_name: userType === 'company' ? companies[Math.floor(Math.random() * companies.length)] : null,
      total_posts: Math.floor(Math.random() * 50),
      total_products: userType === 'company' ? Math.floor(Math.random() * 20) : 0,
      total_services: userType === 'company' ? Math.floor(Math.random() * 15) : 0,
    };
  });
}

// Export functions
export default {
  getAllUsersAdmin,
  getUserById,
  updateUserStatus,
  suspendUser,
  reactivateUser,
  deleteUser,
  getUserActivityLogs,
  bulkUpdateUsers,
  exportUsers,
  verifyUser,
  sendUserNotification,
};
