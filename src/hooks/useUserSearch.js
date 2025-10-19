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
      // Fetch paginated users
      const response = await makeApiRequest({
        url: '/api/users/?page_size=100',
        method: 'GET',
      });

      // Transform users to match mention plugin format
      const transformedUsers = (response.results || []).map(user => {
        // Create username from first_name and last_name, or email
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const emailPrefix = user.email?.split('@')[0] || '';
        
        // Username format: firstname-lastname or email prefix
        const username = firstName && lastName 
          ? `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/\s+/g, '-')
          : emailPrefix.toLowerCase();
        
        return {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email,
          avatar: user.avatar,
          username: username
        };
      });

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Failed to fetch users for mentions:', err);
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
