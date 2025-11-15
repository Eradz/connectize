/**
 * Provider Selection Component
 * Simplified provider picker for quick selection
 */
import React, { useState, useEffect } from 'react';
import { Check, Truck, Settings, Star } from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';

const ProviderSelector = ({ selectedProvider, onProviderChange, showRates = false, shipmentRequest = null }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({});

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (showRates && shipmentRequest?.id) {
      calculateRates();
    }
  }, [showRates, shipmentRequest?.id]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getProviders();
      setProviders(response.data?.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRates = async () => {
    try {
      const response = await logisticsAPI.calculateRates(shipmentRequest.id, {
        providers: providers.map(p => p.name)
      });
      setRates(response.data?.rates || {});
    } catch (error) {
      console.error('Failed to calculate rates:', error);
    }
  };

  const getProviderLogo = (providerType, providerName) => {
    const logos = {
      dhl: '🔴',
      fedex: '🟣',
      ups: '🟤',
      aramex: '🟠',
      custom: '📦'
    };
    return logos[providerType] || '🚛';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <div
          key={provider.name}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedProvider === provider.name
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => onProviderChange(provider.name)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {getProviderLogo(provider.type, provider.name)}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {provider.name}
                  </h4>
                  {provider.is_default && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {provider.service_types?.length || 0} services available
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Rate Display */}
              {showRates && rates[provider.name] && !rates[provider.name].error && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(rates[provider.name].estimated_cost || 0)}
                  </p>
                  <p className="text-xs text-gray-500">Estimated</p>
                </div>
              )}

              {showRates && rates[provider.name]?.error && (
                <div className="text-right">
                  <p className="text-sm text-red-600">Rate N/A</p>
                  <p className="text-xs text-gray-500">Check config</p>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedProvider === provider.name && (
                <div className="bg-blue-600 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Provider Status */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                provider.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {provider.is_active ? 'Active' : 'Inactive'}
              </span>
              <span>Last used: {provider.last_used || 'Never'}</span>
            </div>
            {provider.success_rate && (
              <div className="text-xs text-gray-600">
                Success rate: {(provider.success_rate * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      ))}

      {providers.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No providers available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact your administrator to configure logistics providers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;
