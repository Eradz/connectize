import { useState, useEffect, useCallback } from 'react';
import { makeApiRequest } from '../lib/helpers';

/**
 * Custom hook to fetch companies owned by the current user
 * @param {number|null} userId - The ID of the current user
 * @returns {Object} - { companies, loading, error, refetch }
 */
export function useUserCompanies(userId) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserCompanies = useCallback(async () => {
    if (!userId) {
      setCompanies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🏢 Fetching companies for user:', userId);
      
      // Fetch companies where user is the profile (owner)
      const response = await makeApiRequest({
        url: `api/companies/?profile=${userId}`,
        method: 'GET',
      });

      const userCompanies = response.results || [];
      console.log('✅ User companies fetched:', userCompanies.length);
      
      setCompanies(userCompanies);
    } catch (err) {
      console.error('❌ Failed to fetch user companies:', err);
      setError(err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserCompanies();
  }, [fetchUserCompanies]);

  return {
    companies,
    loading,
    error,
    refetch: fetchUserCompanies,
  };
}
