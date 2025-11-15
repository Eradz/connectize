import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../../api-services/workforce';

const JobsTest = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Testing API call...');
        setLoading(true);
        const response = await workforceAPI.getJobs();
        console.log('🧪 API Response:', response);
        setJobs(response.data?.results || response.data || response || []);
        setError(null);
      } catch (err) {
        console.error('🧪 API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div>
      <h1>Jobs Test Component</h1>
      <p>Found {jobs.length} jobs</p>
      <ul>
        {jobs.slice(0, 5).map((job, index) => (
          <li key={job.id || index}>
            {job.title} at {job.company_name} - {job.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobsTest;
