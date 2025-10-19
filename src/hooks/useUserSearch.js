import { useState, useEffect, useCallback } from 'react';
import { makeApiRequest } from '../lib/helpers';

/**
 * Custom hook for searching users for @ mentions
 * Fetches and caches user list for autocomplete
 */
export const useUserSearch = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching users for mentions...');
      // Fetch paginated users - adjust page_size as needed
      const response = await makeApiRequest({
        url: 'api/users/?page_size=100', // Get first 100 users
        method: 'GET',
      });

      // Transform users to match mention plugin format
      const transformedUsers = (response.results || []).map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: user.avatar,
        username: user.first_name?.toLowerCase() || user.email?.split('@')[0]
      }));

      console.log('✅ Users fetched for mentions:', transformedUsers.length);
      console.log('Sample user:', transformedUsers[0]);
      setUsers(transformedUsers);
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
      setError(err);
      setUsers([]); // Fall back to empty array
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
};
