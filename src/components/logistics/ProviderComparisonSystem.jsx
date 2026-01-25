/**
 * Comprehensive Provider Comparison System
 * Allows detailed comparison of logistics providers with rate/pricing, location, and API data
 */
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Truck, Package, Clock, CheckCircle, AlertTriangle, 
  DollarSign, Globe, Star, MapPin, Phone, Award, LogIn,
  TrendingUp, Shield, Zap, Users, Calendar, Info,
  ArrowRight, BarChart3, Filter, RefreshCw, Calculator
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import { getSession } from '../../lib/session';
import { useAuth } from '../../context/userContext';

const ProviderComparisonSystem = ({ shipmentRequest, onProviderSelected, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [rates, setRates] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [calculatingRates, setCalculatingRates] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('overview'); // overview, detailed, rates
  const [sortBy, setSortBy] = useState('rate'); // rate, transit, reliability, location
  const [isCompact, setIsCompact] = useState(true); // Compact list vs Card view
  const [showAllProviders, setShowAllProviders] = useState(false); // Limit initial rows
  const [filterOptions, setFilterOptions] = useState({
    maxRate: null,
    maxTransit: null,
    regions: [],
    services: []
  });
  const [loadError, setLoadError] = useState(null);
  const { user } = useAuth();
  const session = getSession();
  const isOwner = !!(shipmentRequest && (user?.id ?? session?.user?.id) != null && String(shipmentRequest.requested_by) === String(user?.id ?? session?.user?.id));

  useEffect(() => {
    // Check authentication status
    const session = getSession();
    const isAuth = session && session.tokens && session.tokens.access;
    setIsAuthenticated(isAuth);
    
    console.log('🔧 ProviderComparisonSystem Debug:', {
      shipmentRequest_id: shipmentRequest?.id,
      shipmentRequest_status: shipmentRequest?.status,
      shipmentRequest_requested_by: shipmentRequest?.requested_by,
      user_id: user?.id,
      session_user_id: session?.user?.id,
      isOwner,
      isAuthenticated: isAuth,
      shouldLoadData: isAuth && isOwner
    });
    
    if (isAuthenticated && isOwner) {
      loadProvidersAndRates();
    }
  }, [shipmentRequest?.id, isAuthenticated, isOwner]);

  const getProviderKey = (p) => p?.id || p?.slug || p?.provider_name || p?.name || p?.code;
  const getProviderDisplay = (p) => p?.provider_display || p?.display_name || p?.name || (p?.provider_name ? p.provider_name.toUpperCase() : 'Provider');

  const loadProvidersAndRates = async () => {
    if (!shipmentRequest?.id) return;
    
    try {
      setCalculatingRates(true);
      setLoadError(null);
      
      // Load providers with enhanced metadata
      const providersResponse = await logisticsAPI.getAvailableProviders();
      const providersData = providersResponse.data?.providers || providersResponse?.providers || [];
      setProviders(providersData);
      
      // Calculate rates with enhanced options
      const ratesResponse = await logisticsAPI.calculateRates(shipmentRequest.id, {
        force_refresh: true,
        include_metadata: true,
        sort_by: sortBy,
        include_analytics: true
      });
      
      // ratesResponse is already response.data from the API
      console.log('📊 Rates response:', ratesResponse);
      
      if (ratesResponse?.success || ratesResponse?.providers) {
        setRates(ratesResponse);
        setProviders(ratesResponse.providers || providersData || []);
      } else {
        console.error('Failed to get rates:', ratesResponse?.error);
        setLoadError(ratesResponse?.error || 'Failed to fetch rates');
      }
      
    } catch (error) {
      console.error('Failed to load providers and rates:', error);
      setLoadError(error?.response?.data?.error || error.message || 'Failed to load providers and rates');
    } finally {
      setCalculatingRates(false);
    }
  };
  

  const handleProviderSelection = async () => {
    const selectedProviderObj = providers.find(p => getProviderKey(p) === selectedProvider);
    const requiresService = Array.isArray(selectedProviderObj?.rates) && selectedProviderObj.rates.length > 0;
    if (!selectedProvider || (requiresService && !selectedService)) {
      toast.error('Please select a provider' + (requiresService ? ' and service type' : ''));
      return;
    }

    if (!isAuthenticated) {
      window.location.href = '/login?next=' + window.location.pathname;
      return;
    }

    try {
      setLoading(true);
      
      if (onProviderSelected) {
        onProviderSelected({
          provider_name: selectedProvider,
          service_code: selectedService,
          provider_data: selectedProviderObj
        });
      }

      const providerCanonical = selectedProviderObj?.provider_name || selectedProviderObj?.slug || selectedProvider;
      const response = await logisticsAPI.awardToProvider(shipmentRequest.id, {
        provider_name: providerCanonical,
        service_code: selectedService
      });
      
      if (response.data?.success || response?.success) {
        const successData = response.data || response;
        toast.success(successData.message || `Shipment successfully assigned to ${getProviderDisplay(selectedProviderObj)}!`);
        if (onSuccess) {
          onSuccess(successData);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to assign provider');
      }
      
    } catch (error) {
      console.error('Provider assignment error:', error);
      toast.error('Assignment failed', {
        description: error.response?.data?.error || error.message || 'Failed to assign provider'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSortedProviders = () => {
    if (!providers || providers.length === 0) return [];
    
    const sorted = [...providers].sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return (a.cheapest_rate || 0) - (b.cheapest_rate || 0);
        case 'transit':
          return (a.fastest_transit || 999) - (b.fastest_transit || 999);
        case 'reliability':
          return (b.reliability_score || 0) - (a.reliability_score || 0);
        case 'coverage':
          return (b.coverage_countries || 0) - (a.coverage_countries || 0);
        default:
          return 0;
      }
    });

    return sorted;
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

  const getProviderLogo = (logo) => logo || '📦';
  
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

  const sortedProviders = getSortedProviders();

  const selectedProviderObj = useMemo(
    () => providers.find(p => getProviderKey(p) === selectedProvider),
    [providers, selectedProvider]
  );
  const requiresService = useMemo(
    () => Array.isArray(selectedProviderObj?.rates) && selectedProviderObj.rates.length > 0,
    [selectedProviderObj]
  );

  return (
    <div className="space-y-6">
      {/* Header with Comparison Controls */}
      {/* Lightweight provider quote CTA for providers viewing a request */}
      {shipmentRequest && (shipmentRequest.status === 'posted' || shipmentRequest.status === 'quoted') && shipmentRequest.allow_bids && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Are you a provider? Submit a quote for this request.</p>
            </div>
            {/* This button is a hook; actual quote form may be a modal in your provider dashboard */}
            <button
              type="button"
              onClick={() => onProviderSelected && onProviderSelected({ provider_name: 'self', action: 'open-quote-form' })}
              className="px-3 py-2 text-sm bg-gold text-white rounded-lg hover:bg-custom_yellow"
            >
              Submit Quote
            </button>
          </div>
        </div>
      )}
  {isOwner && (
  <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Provider Comparison System</h3>
              <p className="text-sm text-gray-600">Compare rates, services, and capabilities from multiple providers</p>
            </div>
          </div>
          <button
            onClick={loadProvidersAndRates}
            disabled={calculatingRates || !isAuthenticated}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${calculatingRates ? 'animate-spin' : ''}`} />
            <span>Refresh Rates</span>
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['overview', 'detailed', 'rates'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setComparisonMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    comparisonMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'compact', label: 'Compact', value: true },
                { key: 'cards', label: 'Cards', value: false },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setIsCompact(opt.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    isCompact === opt.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="rate">Sort by Rate</option>
              <option value="transit">Sort by Transit Time</option>
              <option value="reliability">Sort by Reliability</option>
              <option value="coverage">Sort by Coverage</option>
            </select>
          </div>
        </div>
  </div>
  )}

      {/* Authentication Check */}
  {!isAuthenticated && (
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <LogIn className="h-6 w-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-2">Demo Mode</h4>
              <p className="text-sm text-yellow-800 mb-4">
                You're viewing demo data. Login to access real provider rates and create shipments.
              </p>
              <button
                onClick={() => window.location.href = '/login?next=' + window.location.pathname}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login for Live Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Calculation Status */}
  {isOwner && calculatingRates && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold"></div>
            <div>
              <h4 className="font-medium text-blue-900">Calculating Shipping Rates</h4>
              <p className="text-sm text-blue-700">Fetching real-time quotes from all available providers...</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Dashboard */}
  {isOwner && rates && !calculatingRates && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-sm font-medium text-blue-800">Available Providers</p>
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Avg. Reliability</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {rates.summary?.average_reliability ? `${rates.summary.average_reliability}/5` : 'N/A'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider List */}
  <div className="space-y-4">
        {/* Compact list view */}
        {(isCompact && isOwner) && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border-b">
              <div className="col-span-5">Provider</div>
              <div className="col-span-2 text-right">Best Rate</div>
              <div className="col-span-2 text-right">Transit</div>
              <div className="col-span-2 text-right">Reliability</div>
              <div className="col-span-1 text-right">Select</div>
            </div>
            <div className="divide-y">
              {(showAllProviders ? sortedProviders : sortedProviders.slice(0, 6)).map((provider, pIdx) => {
                const providerKey = getProviderKey(provider) || `provider-${pIdx}`;
                const isSelected = selectedProvider === providerKey;
                const rs = Array.isArray(provider?.rates) ? provider.rates : [];
                return (
                  <div
                    key={providerKey}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                    onClick={() => {
                      setSelectedProvider(providerKey);
                      setSelectedService('');
                      if (rs.length === 1) setSelectedService(rs[0].service_code);
                    }}
                  >
                    <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                      <span className="text-2xl">{getProviderLogo(provider.logo)}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{getProviderDisplay(provider)}</div>
                        <div className="text-xs text-gray-500 truncate">{provider.service_count || rs.length} services</div>
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-right text-sm font-medium text-gray-900">
                      {provider.cheapest_rate ? formatCurrency(provider.cheapest_rate) : '—'}
                    </div>
                    <div className="col-span-6 md:col-span-2 text-right text-sm text-gray-700">
                      {formatTransitTime(provider.fastest_transit)}
                    </div>
                    <div className="col-span-9 md:col-span-2 text-right">
                      <div className="inline-flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(provider.reliability_score || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-1 text-right">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 inline-block" />
                      ) : (
                        <button
                          type="button"
                          className="px-2 py-1 text-xs border rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          Select
                        </button>
                      )}
                    </div>

                    {/* Inline service selector when selected and multiple rates */}
                    {isSelected && rs.length > 1 && (
                      <div className="col-span-12 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Service:</span>
                          <select
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Select a service</option>
                            {rs.map((rate, rIdx) => (
                              <option key={rate.id || `${providerKey}-rate-${rIdx}`} value={rate.service_code}>
                                {rate.service_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {sortedProviders.length > 6 && (
              <div className="px-4 py-2 bg-gray-50 border-t text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setShowAllProviders((v) => !v)}
                >
                  {showAllProviders ? 'Show less' : `Show all ${sortedProviders.length}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card view (existing) */}
        {!isCompact && sortedProviders.map((provider, pIdx) => {
          const providerKey = getProviderKey(provider) || `provider-${pIdx}`;
          return (
          <div
            key={providerKey}
            className={`border-2 rounded-xl transition-all cursor-pointer ${
              selectedProvider === providerKey
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : `${getProviderColor(provider.color)} hover:border-blue-300 hover:shadow-md`
            }`}
            onClick={() => {
              setSelectedProvider(providerKey);
              setSelectedService('');
              const rs = Array.isArray(provider?.rates) ? provider.rates : [];
              if (rs.length === 1) {
                setSelectedService(rs[0].service_code);
              }
            }}
          >
            <div className="p-6">
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <span className="text-4xl">{getProviderLogo(provider.logo)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{getProviderDisplay(provider)}</h4>
                      {provider.recommended && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>
                    
                    {/* Reliability Score */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.reliability_score || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {provider.reliability_score}/5 • {provider.success_rate} success rate
                      </span>
                    </div>

                    {/* Provider Strengths */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {provider.strengths?.slice(0, 4).map((strength, index) => (
                        <span key={`${providerKey}-strength-${index}`} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="text-right">
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Starting from</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(provider.cheapest_rate)}
                    </p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Fastest transit</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTransitTime(provider.fastest_transit)}
                    </p>
                  </div>
                  {selectedProvider === providerKey && (
                    <div className="bg-blue-600 rounded-full p-1 mt-2 mx-auto w-fit">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Information based on view mode */}
              {comparisonMode === 'detailed' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {/* Location Data */}
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Coverage & Location
                    </h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Hub:</strong> {provider.location_data?.nearest_hub}</p>
                      <p><strong>Countries:</strong> {provider.coverage_countries}</p>
                      <p><strong>Pickup Areas:</strong> {provider.location_data?.pickup_areas?.join(', ')}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Performance
                    </h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>API Response:</strong> {provider.api_response_time}</p>
                      <p><strong>Success Rate:</strong> {provider.success_rate}</p>
                      <p><strong>Services:</strong> {provider.service_count} available</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact & Support
                    </h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Phone:</strong> {provider.contact?.phone}</p>
                      <p><strong>Support:</strong> {provider.contact?.support}</p>
                      <p><strong>Email:</strong> {provider.contact?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              {comparisonMode === 'rates' && provider.pricing_structure && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h6 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Calculator className="w-4 h-4 mr-1" />
                    Pricing Breakdown
                  </h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Base Rate</p>
                      <p className="font-medium">{formatCurrency(provider.pricing_structure.base_rate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fuel Surcharge</p>
                      <p className="font-medium">{provider.pricing_structure.fuel_surcharge}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Security Fee</p>
                      <p className="font-medium">{formatCurrency(provider.pricing_structure.security_fee)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Handling</p>
                      <p className="font-medium">{formatCurrency(provider.pricing_structure.handling_fee)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection for Selected Provider */}
              {selectedProvider === providerKey && provider.rates?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Select Service Type
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {provider.rates.map((rate, rIdx) => (
                      <div
                        key={rate.id || rate.service_code || `${providerKey}-rate-${rIdx}`}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedService === rate.service_code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(rate.service_code);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">{rate.service_name}</h6>
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              <p>Transit: {formatTransitTime(rate.transit_time)}</p>
                              <p>Delivery by: {rate.delivery_by}</p>
                              <p>Tracking: {rate.tracking_updates}</p>
                              {rate.insurance_included && (
                                <p className="text-green-600 flex items-center">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Insurance included
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(rate.cost)}</p>
                            {selectedService === rate.service_code && (
                              <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
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
          );
        })}
      </div>

      {/* No Providers State */}
  {isOwner && sortedProviders.length === 0 && !calculatingRates && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Providers Available</h3>
          <p className="mt-2 text-sm text-gray-500">No configured providers found or rates unavailable.</p>
          {loadError && (
            <p className="mt-2 text-sm text-red-600">{String(loadError)}</p>
          )}
        </div>
      )}

      {/* Shipment Summary */}
  {/* {shipmentRequest && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Shipment Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cargo Type:</span>
              <span className="ml-2 font-medium">{shipmentRequest?.cargo_type || 'General'}</span>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <span className="ml-2 font-medium">{shipmentRequest?.weight || 0} tons</span>
            </div>
            <div>
              <span className="text-gray-600">Volume:</span>
              <span className="ml-2 font-medium">{shipmentRequest?.volume || 0} m³</span>
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
      )} */}

      {/* Action Button */}
  {isOwner ? (
        <button
          onClick={handleProviderSelection}
          disabled={loading || !selectedProvider || (requiresService && !selectedService) || calculatingRates || !isAuthenticated}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Processing Assignment...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5 mr-3" />
              Assign to {selectedProvider ? getProviderDisplay(selectedProviderObj) : 'Selected Provider'}
              {selectedService && ` - ${selectedProviderObj?.rates?.find(r => r.service_code === selectedService)?.service_name || selectedService}`}
            </>
          )}
        </button>
      ) : (
        <div className="text-center text-sm text-gray-500">
          Only the request owner can view market overview or assign a provider. You can still submit a quote if bids are allowed.
        </div>
      )}
    </div>
  );
};

export default ProviderComparisonSystem;
