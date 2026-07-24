import React, { useState } from 'react';
import subscriptionsApi from '../api-services/subscriptions';
import { loginForTesting, isTestAuthActive } from '../lib/testAuth';
import { getSession } from '../lib/session';

const SubscriptionDebug = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Check session
      results.session = getSession();
      results.isTestAuthActive = isTestAuthActive();

      // Test API call without auth
      try {
        const response = await subscriptionsApi.getCurrentSubscription();
        results.apiResponse = response;
      } catch (error) {
        results.apiError = error.message;
        results.apiStatus = error.response?.status;
      }

      setDebugData(results);
    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableTestAuth = async () => {
    setLoading(true);
    try {
      const success = await loginForTesting();
      console.log('Test auth result:', success);
      await runDebugTests();
    } catch (error) {
      console.error('Test auth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Debug Tool</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button 
            onClick={runDebugTests}
            disabled={loading}
            className="rounded-lg bg-gold px-4 py-2 font-medium text-dark hover:bg-custom_yellow disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Debug Tests'}
          </button>
          
          <button 
            onClick={enableTestAuth}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enable Test Auth & Test'}
          </button>
        </div>

        {debugData && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Debug Results:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDebug;
