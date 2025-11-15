import React, { useState, useEffect } from 'react';
import { loginForTesting, isTestAuthActive } from '../../lib/testAuth';
import subscriptionsApi from '../../api-services/subscriptions';

const SubscriptionDataTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Testing authentication...');
      
      if (!isTestAuthActive()) {
        console.log('No active auth found, logging in...');
        await loginForTesting();
      }
      
      console.log('✅ Authentication successful, fetching data...');
      
      const result = await subscriptionsApi.getCurrentSubscription();
      console.log('📊 Subscription data:', result);
      setData(result.data);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Subscription Data Test</h2>
      
      <button 
        onClick={testAuth} 
        disabled={loading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Authentication & Data Fetch'}
      </button>
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px' 
        }}>
          Error: {error}
        </div>
      )}
      
      {data && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px' 
        }}>
          <h3>Success! Data Retrieved:</h3>
          <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDataTest;
