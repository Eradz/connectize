import React, { useState, useEffect } from 'react';
import { logisticsAPI } from '../../api-services/logistics';

const LogisticsTestComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testLogistics = async () => {
      try {
        console.log('🧪 Testing logistics API...');
        setLoading(true);
        setError(null);
        
        // Test the same API call that AdminLogistics uses
        const response = await logisticsAPI.getShipmentRequests();
        console.log('✅ Logistics API response:', response);
        
        setData(response);
      } catch (err) {
        console.error('❌ Logistics API error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testLogistics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Logistics API</h1>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          <span>Loading logistics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Logistics API Test - Error</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 rounded-lg bg-gold px-4 py-2 font-medium text-dark hover:bg-custom_yellow"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Logistics API Test - Success!</h1>
      <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
        <p className="text-green-800">✅ Successfully retrieved logistics data</p>
        <p className="text-green-700">Found {data?.count || 0} logistics requests</p>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="font-semibold mb-2">Raw API Response:</h3>
        <pre className="text-sm overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LogisticsTestComponent;
