import { useState, useEffect, useCallback } from 'react';
import { makeApiRequest } from '../lib/helpers';

/**
 * Custom hook for searching companies for @ mentions
 * Fetches and caches company list for autocomplete
 */
export const useCompanySearch = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch paginated companies
      const response = await makeApiRequest({
        url: '/api/companies/?page_size=100',
        method: 'GET',
      });

      // Transform companies to match mention plugin format
      const transformedCompanies = (response.results || []).map(company => ({
        id: company.id,
        company_name: company.company_name,
        slug: company.slug,
        tag_line: company.tag_line,
        logo: company.logo,
        verified: company.verify,
      }));

      setCompanies(transformedCompanies);
    } catch (err) {
      console.error('Failed to fetch companies for mentions:', err);
      setError(err);
      setCompanies([]); // Fall back to empty array
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, isLoading, error, refetch: fetchCompanies };
};
