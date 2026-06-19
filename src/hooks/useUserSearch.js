import { useState, useEffect, useCallback } from 'react';
import { makeApiRequest } from '../lib/helpers';
import { useAuth } from '../context/userContext';
import { getUserDisplayName, getUserHandle } from '../lib/userDisplay';

/**
 * Custom hook for searching users for @ mentions
 * Fetches and caches user list for autocomplete
 * Only fetches when user is authenticated
 */
export const useUserSearch = ({ enabled = true } = {}) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!enabled) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch paginated users - use relative URL without leading slash to go through baseURL
      const response = await makeApiRequest({
        url: 'api/users/?page_size=100',
        method: 'GET',
      });

      // Transform users to match mention plugin format
      const transformedUsers = (response.results || []).map(user => {
        const displayName = getUserDisplayName(user);
        const username = getUserHandle(user);
        
        return {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name || displayName,
          display_name: user.display_name,
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
  }, [enabled, user, authLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
};
