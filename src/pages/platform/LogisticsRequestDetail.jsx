import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  User,
  Phone,
  Mail,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  FileText,
  Send,
  Plus,
  AlertTriangle,
  Edit
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';
import ProviderComparisonSystem from '../../components/logistics/ProviderComparisonSystem';
import ProviderQuoteForm from '../../components/logistics/ProviderQuoteForm';
import { getSession } from '../../lib/session';
import { useAuth } from '../../context/userContext';

const LogisticsRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [initialTracking, setInitialTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [togglingBids, setTogglingBids] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { user } = useAuth();
  const session = getSession();
  const userId = user?.id ?? session?.user?.id;

  useEffect(() => {
    if (id) {
      fetchRequestData();
    }
  }, [id]);

  // Debug logging for assignment UI conditions
  useEffect(() => {
    if (request) {
      console.log('🔧 Assignment UI Debug:', {
        request_id: request.id,
        status: request.status,
        awarded_to: request.awarded_to,
        requested_by: request.requested_by,
        userId,
        isOwner: userId != null && String(request.requested_by) === String(userId),
        statusCheck: ['draft', 'posted', 'quoted'].includes(request.status),
        notAwarded: !request.awarded_to,
        shouldShowAssignment: (['draft', 'posted', 'quoted'].includes(request.status)) && !request.awarded_to
      });
    }
  }, [request, userId]);

  const fetchRequestData = async () => {
    try {
      setLoading(true);
      
      // Fetch request details
      const requestResponse = await logisticsAPI.getRequest(id);
      const requestData = requestResponse?.data || requestResponse;
      setRequest(requestData);

      // Fetch quotes for this request
      try {
        const quotesResponse = await logisticsAPI.getRequestQuotes(id);
        const quotesData = quotesResponse?.data || quotesResponse?.results || quotesResponse || [];
        setQuotes(Array.isArray(quotesData) ? quotesData : []);
      } catch (quotesError) {
        console.warn('Failed to load quotes:', quotesError);
        setQuotes([]);
      }

      // Fetch available providers
      try {
        const providersResponse = await logisticsAPI.getAvailableProviders();
        const providersData = providersResponse?.data?.providers || providersResponse?.providers || [];
        setProviders(Array.isArray(providersData) ? providersData : []);
      } catch (providersError) {
        console.warn('Failed to load providers:', providersError);
        setProviders([]);
      }

      // Load initial tracking if a shipment was created
      try {
        if (requestData?.shipment_id) {
          const trackingResp = await logisticsAPI.getShipmentTrackingById(requestData.shipment_id);
          const events = trackingResp?.data || trackingResp || [];
          setInitialTracking(Array.isArray(events) ? events : []);
        } else {
          setInitialTracking([]);
        }
      } catch (trackErr) {
        console.warn('Failed to load tracking:', trackErr);
        setInitialTracking([]);
      }

    } catch (error) {
      console.error('Error fetching request data:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardQuote = async (quoteId) => {
    try {
      setAwarding(true);
      const response = await logisticsAPI.awardRequest(id, { quote_id: quoteId });
      
      if (response?.success !== false) {
        toast.success('Request awarded successfully! Shipment has been created.');
        // Navigate to the created shipment
        if (response?.shipment_id) {
          navigate(`${webRoutes.logisticsShipments}/${response.shipment_id}`);
        } else {
          fetchRequestData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error awarding request:', error);
      toast.error('Failed to award request');
    } finally {
      setAwarding(false);
    }
  };

  const handleAwardToProvider = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    try {
      setAwarding(true);
      const response = await logisticsAPI.awardToProvider(id, {
        provider_name: selectedProvider,
        service_code: selectedService
      });
      
      if (response?.success !== false) {
        toast.success(`Request awarded to ${selectedProvider}! Shipment has been created.`);
        setShowProviderModal(false);
        if (response?.shipment_id) {
          navigate(`${webRoutes.logisticsShipments}/${response.shipment_id}`);
        } else {
          fetchRequestData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error awarding to provider:', error);
      toast.error('Failed to award to provider');
    } finally {
      setAwarding(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      await logisticsAPI.deleteRequest(id);
      toast.success('Request deleted successfully');
      navigate(webRoutes.logisticsRequests);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-5 h-5 text-gray-500" />;
      case 'posted': return <Clock className="w-5 h-5 text-gold" />;
      case 'quoted': return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case 'awarded': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'posted': return 'Posted';
      case 'quoted': return 'Quoted';
      case 'awarded': return 'Awarded';
      case 'completed': return 'Completed';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const toggleAllowBids = async () => {
    if (!request) return;
    try {
      setTogglingBids(true);
      const next = !request.allow_bids;
      await logisticsAPI.patchRequest(request.id, { allow_bids: next });
      setRequest(prev => ({ ...prev, allow_bids: next }));
      toast.success(next ? 'Provider bids enabled' : 'Provider bids disabled');
    } catch (e) {
      console.error('Failed to toggle allow_bids', e);
      toast.error('Failed to update visibility');
    } finally {
      setTogglingBids(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request not found</h2>
          <p className="text-gray-600 mb-4">The shipment request you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(webRoutes.logisticsRequests)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-4">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4">
              <button
                onClick={() => navigate(webRoutes.logisticsRequests)}
                className="bg-pale_yellow hover:bg-gold flex p-2 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Back</span>
              </button>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {request.title || `${request.cargo_type} Request`}
                  </h1>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
                    {getStatusIcon(request.status)}
                    <span className="text-sm font-medium">{getStatusLabel(request.status)}</span>
                  </div>
                  {/* {userId != null && String(request.requested_by) === String(userId) && (
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">Mine</span>
                  )} */}
                </div>
                {/* <p className="text-gray-600 mt-1">Request ID: {request.id}</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {userId != null && String(request.requested_by) === String(userId) && (request.status === 'draft' || request.status === 'posted' || request.status === 'awarded') && (
                <>
                  <button
                    onClick={() => navigate(`${webRoutes.logisticsRequests}/${request.id}/edit`)}
                    className="px-4 py-2 bg-gold rounded-lg hover:bg-custom_yellow flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {(request.status === 'draft' || request.status === 'posted') && (
                    <button
                      onClick={handleDeleteRequest}
                      className="px-4 py-2 bg-[#FF383C] text-white rounded-lg hover:bg-red-400 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}
              {/* <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
                <span className={`w-2 h-2 rounded-full ${request.allow_bids ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm">{request.allow_bids ? 'Bids allowed' : 'Private'}</span>
                {userId != null && String(request.requested_by) === String(userId) && (request.status === 'draft' || request.status === 'posted' || request.status === 'quoted' || request.status === 'awarded') && (
                  <button
                    onClick={toggleAllowBids}
                    disabled={togglingBids}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {togglingBids ? 'Updating…' : request.allow_bids ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div> */}
              {/* Comprehensive provider comparison system is now integrated below, removing simple assign button */}
              {false && (request.status === 'posted' || request.status === 'quoted') && (
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Assign Provider</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="bg-white lg:col-span-2 space-y-6 p-6">
            {/* Tracking History & Status */}
            <div className="">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
              <div className="flex items-center space-x-2">
                <Package className='w-5 h-5 text-gray-700'/>
                <h3 className="text-lg font-semibold text-gray-900">Tracking History</h3>
              </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'posted' ? 'bg-yellow-100 text-yellow-700' :
                  request.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                  request.status === 'awarded' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Origin</p>
                  <p className="text-gray-600">Shipment created with {request.origin_contact_name || 'Shipper'}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(request.created_at)} {formatTime(request.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Cargo Information */}
            <div className="pb-6 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cargo Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Cargo Type</p>
                  <p className="text-sm text-gray-900">{request.cargo_type?.replace('_', ' ') || 'General Cargo'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Value</p>
                  <p className="text-sm text-gray-900">{request.special_requirements?.includes('$') ? 'See description' : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Description</p>
                  <p className="text-sm text-gray-600">{request.description?.split('\n')[0] || 'See full details'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Volume</p>
                  <p className="text-sm text-gray-900">{request.volume || 0} m³</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Commodity Code</p>
                  <p className="text-sm text-gray-900">general</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Weight</p>
                  <p className="text-sm text-gray-900">{request.weight || 0} kg</p>
                </div>
              </div>
            </div>

            {/* Provider Assignment Required */}
            {!request.awarded_to ? (
              <div className="bg-white rounded-lg border-2 border-red-200 p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-semibold text-gray-900">Provider Assignment Required</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  This shipment request has not been assigned to a logistics provider yet. Compare available providers below and select the best option based on rates, transit times, and service quality.
                </p>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Why assign a provider?</p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Economy flight</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>5 nights in standard room</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>All-access summit entry</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Meals + Gala</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Shuttle transport</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Visa assistance</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-gray-600 mb-4">
                  Only the request owner can view market overview or assign a provider. You can still submit a quote if bids are allowed
                </p>

              {/* Comprehensive Provider Assignment System (for unassigned requests) */}
            {(['draft', 'posted', 'quoted'].includes(request.status)) && !request.awarded_to && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <ProviderComparisonSystem
                  shipmentRequest={request}
                  onProviderSelected={(data) => {
                    // If ProviderComparisonSystem triggers quote form open, handle it here
                    if (data?.action === 'open-quote-form') {
                      setShowQuoteModal(true);
                      return;
                    }
                    // Otherwise treat as assignment success (legacy path)
                    if (data?.provider_name) {
                      toast.success(`Provider ${data.provider_name} assigned successfully!`);
                      fetchRequestData();
                    }
                  }}
                  onSuccess={(successData) => {
                    toast.success('Request successfully assigned to provider!');
                    // Reload request data to show updated assignment
                    fetchRequestData();
                  }}
                />
              </div>
            )}
                {/* Shipment Summary */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Shipment summary</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Cargo type</p>
                      <p className="text-sm font-medium text-gray-900">{request.cargo_type?.replace('_', ' ') || 'General cargo'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="text-sm font-medium text-gray-900">{request.weight || 0} tons</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Volume</p>
                      <p className="text-sm font-medium text-gray-900">{request.volume || 0} m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="text-sm font-medium text-gray-900">${request.budget_min}-{request.budget_max}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 space-y-1">
                  <div>• Rates are fetched in real-time from provider APIs</div>
                  <div>• All prices include applicable fees and surcharges</div>
                  <div>• Transit times are business days and may vary based on location</div>
                  <div>• Tracking information will be available immediately after assignment</div>
                </p>
              </div>
            ) : (
              <div className="pb-6 border-b border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Assignment</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Logistics Provider</p>
                    <p className="text-sm text-gray-600">{request.awarded_to_name || 'Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Service Type</p>
                    <p className="text-sm text-gray-600">Air freight</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Assignment Date</p>
                    <p className="text-sm text-gray-600">{request.updated_at ? formatDate(request.updated_at) : 'Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Provider Contact</p>
                    <p className="text-sm text-gray-600">Contact via platform</p>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {/* <div className="pb-6 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Method</p>
                  <p className="text-sm text-gray-900">Air freight</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Current Location</p>
                  <p className="text-sm text-gray-600">{request.origin_address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Vessel/Flight Info</p>
                  <p className="text-sm text-gray-600">Not available</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Transit Time</p>
                  <p className="text-sm text-gray-600">standard</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Container/Booking Ref</p>
                  <p className="text-sm text-gray-600">Not assigned</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Delays</p>
                  <p className="text-sm text-gray-600">0 events - 0.00h</p>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">
            {/* Provider Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Status</h3>
              <p className="text-sm text-gray-600">
                High-performance drilling bit suitable for hard formations. Requires special handling and storage
              </p>
            </div>

            {/* Stock Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Stock</span>
                  <span className="font-medium text-gray-900">5 pieces</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Stock</span>
                  <span className="font-medium text-gray-900">2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max Stock</span>
                  <span className="font-medium text-gray-900">10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reorder</span>
                  <span className="font-medium text-gray-900">2</span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unit Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(request.budget_min, request.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-medium text-gray-900">{formatCurrency(request.budget_max, request.currency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Based on current stock of 5 pieces</p>
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Movements</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Received</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">+5</span>
                    <span className="text-gray-500">{formatDate(request.created_at)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Issued</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">-2</span>
                    <span className="text-gray-500">{formatDate(new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Purchase Date</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">{formatDate(request.pickup_date_requested)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Warranty Expiry</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{formatDate(request.delivery_date_requested)}</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Expiring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Assignment Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign to Provider</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provider *
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                >
                  <option value="">Choose a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.name} value={provider.name}>
                      {provider.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProvider && providers.find(p => p.name === selectedProvider)?.service_types && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="">Standard Service</option>
                    {providers.find(p => p.name === selectedProvider)?.service_types.map((service) => (
                      <option key={service.code} value={service.code}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardToProvider}
                disabled={!selectedProvider || awarding}
                className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {awarding ? 'Assigning...' : 'Assign Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Quote Submission Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  h-[90vh] overflow-y-scroll rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit a Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover"
              >
                Close
              </button>
            </div>
            <ProviderQuoteForm
              requestId={request?.id}
              onSuccess={() => {
                setShowQuoteModal(false);
                // Refresh quotes and request (status may change to quoted)
                fetchRequestData();
              }}
              onCancel={() => setShowQuoteModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsRequestDetail;
