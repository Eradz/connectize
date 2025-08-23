/**
 * Enhanced Multi-Provider Integration Component
 * Automatically fetches rates and displays provider comparison
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Truck, Package, Clock, CheckCircle, AlertTriangle, 
  DollarSign, Globe, Star, MapPin, Phone, Award, LogIn
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import { getSession } from '../../lib/session';

const EnhancedMultiProviderIntegration = ({ shipmentRequest, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [rates, setRates] = useState(null);
  const [calculatingRates, setCalculatingRates] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const session = getSession();
    const isAuth = session && session.tokens && session.tokens.access;
    setIsAuthenticated(isAuth);
    
    // Add mock data for testing when API is not available
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        providers: [
          {
            provider_name: 'dhl',
            provider_display: 'DHL Express',
            logo: '🔴',
            color: 'red',
            recommended: true,
            strengths: ['International Express', 'Real-time Tracking', 'Global Coverage'],
            contact: {
              phone: '+1-800-CALL-DHL',
              support: '24/7 Support'
            },
            service_count: 3,
            cheapest_rate: 89.99,
            fastest_transit: 2,
            rates: [
              {
                service_code: 'express',
                service_name: 'DHL Express Worldwide',
                cost: 89.99,
                transit_time: 2
              },
              {
                service_code: 'economy',
                service_name: 'DHL Economy Select',
                cost: 65.50,
                transit_time: 5
              }
            ]
          },
          {
            provider_name: 'fedex',
            provider_display: 'FedEx',
            logo: '🟣',
            color: 'purple',
            recommended: false,
            strengths: ['Fast Delivery', 'Reliable Service', 'US Coverage'],
            contact: {
              phone: '+1-800-GO-FEDEX',
              support: 'Mon-Fri 8AM-8PM'
            },
            service_count: 4,
            cheapest_rate: 75.25,
            fastest_transit: 1,
            rates: [
              {
                service_code: 'overnight',
                service_name: 'FedEx Priority Overnight',
                cost: 125.00,
                transit_time: 1
              },
              {
                service_code: 'ground',
                service_name: 'FedEx Ground',
                cost: 75.25,
                transit_time: 3
              }
            ]
          },
          {
            provider_name: 'ups',
            provider_display: 'UPS',
            logo: '🟤',
            color: 'yellow',
            recommended: false,
            strengths: ['Cost Effective', 'B2B Solutions', 'Logistics Expertise'],
            contact: {
              phone: '+1-800-PICK-UPS',
              support: 'Mon-Fri 8AM-6PM'
            },
            service_count: 3,
            cheapest_rate: 68.75,
            fastest_transit: 1,
            rates: [
              {
                service_code: 'next_day',
                service_name: 'UPS Next Day Air',
                cost: 98.50,
                transit_time: 1
              },
              {
                service_code: 'ground',
                service_name: 'UPS Ground',
                cost: 68.75,
                transit_time: 4
              }
            ]
          }
        ],
        summary: {
          cheapest_rate: 68.75,
          total_providers: 3,
          rate_range: {
            min: 65.50,
            max: 125.00
          }
        }
      };
      
      // Simulate loading delay
      setTimeout(() => {
        setRates(mockData);
        setProviders(mockData.providers);
        setCalculatingRates(false);
        if (mockData.providers[0]) {
          setSelectedProvider(mockData.providers[0].provider_name);
        }
      }, 2000);
      
      return;
    }
    
    // Only try to load real data if authenticated, otherwise fall back to mock data
    if (isAuthenticated) {
      loadProvidersAndRates();
    } else if (process.env.NODE_ENV === 'development') {
      // Show mock data in development even without authentication
      // This allows testing the UI without needing to log in
      // The mock data setup is already above
    }
  }, [shipmentRequest?.id, isAuthenticated]);

  const loadProvidersAndRates = async () => {
    if (!shipmentRequest?.id) return;
    
    try {
      setCalculatingRates(true);
      
      // Load providers first
      const providersResponse = await logisticsAPI.getAvailableProviders();
      const providersData = providersResponse.data?.providers || providersResponse?.providers || [];
      setProviders(providersData);
      
      // Set default provider
      const defaultProvider = providersData.find(p => p.is_default);
      if (defaultProvider) {
        setSelectedProvider(defaultProvider.name);
      }
      
      // Automatically calculate rates for all providers
      const ratesResponse = await logisticsAPI.calculateRates(shipmentRequest.id, {
        force_refresh: false
      });
      
      if (ratesResponse.data?.success || ratesResponse.data?.providers) {
        setRates(ratesResponse.data);
      } else {
        console.error('Failed to get rates:', ratesResponse.data?.error);
      }
      
    } catch (error) {
      console.error('Failed to load providers and rates:', error);
      
      // Handle specific authentication errors
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('💡 Authentication required for logistics providers');
        toast.error('Login required', {
          description: 'Please log in to view shipping rates and create shipments'
        });
      } else if (process.env.NODE_ENV === 'development') {
        console.log('💡 API Error - This is normal in development without backend auth.');
        console.log('   The component will show mock data for testing.');
        toast.error('Backend connection failed - showing demo data', {
          description: 'Configure backend authentication to see real provider data'
        });
      } else {
        toast.error('Failed to load shipping rates');
      }
    } finally {
      setCalculatingRates(false);
    }
  };

  const handleProviderSubmit = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    if (!selectedService) {
      toast.error('Please select a service type');
      return;
    }

    try {
      setLoading(true);
      
      const response = await logisticsAPI.awardToProvider(shipmentRequest.id, {
        provider_name: selectedProvider,
        service_code: selectedService
      });
      
      if (response.data?.success || response?.success) {
        const successData = response.data || response;
        toast.success(successData.message || `Shipment successfully created with ${selectedProvider.toUpperCase()}!`);
        if (onSuccess) {
          onSuccess(successData);
        }
      } else {
        throw new Error(response.data?.error || response?.error || 'Failed to create shipment');
      }
      
    } catch (error) {
      console.error('Provider integration error:', error);
      console.log('Full error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        const errorDetail = error.response?.data?.detail || error.response?.data?.error || '';
        console.log('403 Error detail:', errorDetail);
        
        if (errorDetail.includes('permission') || errorDetail.includes('not allowed')) {
          toast.error('Permission denied', {
            description: 'Your account does not have permission to create shipments. Please contact support.'
          });
        } else if (errorDetail.includes('CSRF') || errorDetail.includes('csrf')) {
          toast.error('Security token issue', {
            description: 'Please refresh the page and try again.'
          });
        } else {
          toast.error('Access denied', {
            description: errorDetail || 'You do not have permission to perform this action'
          });
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again to continue'
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Invalid request data';
        console.log('400 Error details:', error.response?.data);
        toast.error('Request failed', {
          description: errorMessage
        });
      } else if (error.response?.status === 404) {
        toast.error('Endpoint not found', {
          description: 'The logistics service may not be configured correctly'
        });
      } else if (error.response?.status === 500) {
        toast.error('Server error', {
          description: 'Provider service temporarily unavailable'
        });
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to create shipment';
        toast.error('Shipment creation failed', {
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getProviderLogo = (logo) => {
    return logo || '📦';
  };

  const getProviderColor = (color) => {
    const colors = {
      red: 'border-red-200 bg-red-50',
      purple: 'border-purple-200 bg-purple-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      orange: 'border-orange-200 bg-orange-50',
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50'
    };
    return colors[color] || 'border-gray-200 bg-gray-50';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatTransitTime = (days) => {
    if (!days) return 'N/A';
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const sortedProviders = rates?.providers || [];

  return (
    <div className="space-y-6">
      {/* Authentication Check */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <LogIn className="h-6 w-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-2">Login Required</h4>
              <p className="text-sm text-yellow-800 mb-4">
                You need to be logged in to view shipping rates and create shipments with logistics providers.
              </p>
              <button
                onClick={() => window.location.href = '/login?next=' + window.location.pathname}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login to Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Calculation Status */}
      {calculatingRates && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <h4 className="font-medium text-blue-900">Calculating Shipping Rates</h4>
              <p className="text-sm text-blue-700">Getting quotes from all available providers...</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Summary */}
      {rates && !calculatingRates && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Best Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {rates.summary?.cheapest_rate ? formatCurrency(rates.summary.cheapest_rate) : 'N/A'}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Providers</p>
                  <p className="text-2xl font-bold text-blue-900">{rates.summary?.total_providers || 0}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Rate Range</p>
                  <p className="text-lg font-bold text-purple-900">
                    {rates.summary?.rate_range?.min && rates.summary?.rate_range?.max
                      ? `${formatCurrency(rates.summary.rate_range.min)} - ${formatCurrency(rates.summary.rate_range.max)}`
                      : 'N/A'
                    }
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select Logistics Provider</h3>
              <p className="text-sm text-gray-600">Compare rates and select your preferred shipping provider</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedProviders.map((provider) => (
            <div
              key={provider.provider_name}
              className={`border-2 rounded-lg transition-all cursor-pointer ${
                selectedProvider === provider.provider_name
                  ? 'border-blue-500 bg-blue-50'
                  : `${getProviderColor(provider.color)} hover:border-blue-300`
              }`}
              onClick={() => setSelectedProvider(provider.provider_name)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{getProviderLogo(provider.logo)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{provider.provider_display}</h4>
                        {provider.recommended && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      
                      {/* Provider Strengths */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {provider.strengths?.slice(0, 3).map((strength, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      {provider.contact && (
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                          {provider.contact.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{provider.contact.phone}</span>
                            </div>
                          )}
                          {provider.contact.support && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{provider.contact.support}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Service Count */}
                      <p className="text-sm text-gray-600">
                        {provider.service_count} service{provider.service_count !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Pricing */}
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Starting from</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(provider.cheapest_rate)}
                      </p>
                    </div>
                    
                    {/* Transit Time */}
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Fastest transit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTransitTime(provider.fastest_transit)}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {selectedProvider === provider.provider_name && (
                      <div className="bg-blue-600 rounded-full p-1 mt-2">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Selection for Selected Provider */}
                {selectedProvider === provider.provider_name && provider.rates?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Select Service Type</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {provider.rates.map((rate) => (
                        <div
                          key={rate.service_code}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedService === rate.service_code
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedService(rate.service_code)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium text-gray-900">{rate.service_name}</h6>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatTransitTime(rate.transit_time)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(rate.cost)}</p>
                              {selectedService === rate.service_code && (
                                <CheckCircle className="w-4 h-4 text-blue-600 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedProviders.length === 0 && !calculatingRates && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No providers available</h3>
            <p className="mt-1 text-sm text-gray-500">No configured providers found or rates unavailable.</p>
          </div>
        )}
      </div>

      {/* Shipment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Shipment Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cargo:</span>
            <span className="ml-2 font-medium">{shipmentRequest?.cargo_type}</span>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium">{shipmentRequest?.weight} tons</span>
          </div>
          <div>
            <span className="text-gray-600">Volume:</span>
            <span className="ml-2 font-medium">{shipmentRequest?.volume} m³</span>
          </div>
          <div>
            <span className="text-gray-600">Budget:</span>
            <span className="ml-2 font-medium">
              {shipmentRequest?.budget_min && shipmentRequest?.budget_max 
                ? `${formatCurrency(shipmentRequest.budget_min)} - ${formatCurrency(shipmentRequest.budget_max)}`
                : 'Not specified'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleProviderSubmit}
        disabled={loading || !selectedProvider || calculatingRates || !isAuthenticated}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {!isAuthenticated ? (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login Required to Create Shipment
          </>
        ) : loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Creating Shipment...
          </>
        ) : (
          <>
            <Package className="w-4 h-4 mr-2" />
            Create Shipment with {selectedProvider ? selectedProvider.toUpperCase() : 'Provider'}
          </>
        )}
      </button>

      <div className="text-xs text-gray-500">
        <p>• Rates are automatically fetched from all available providers</p>
        <p>• Real-time tracking will be available after shipment creation</p>
        <p>• You'll receive notifications for status updates</p>
      </div>
    </div>
  );
};

export default EnhancedMultiProviderIntegration;
