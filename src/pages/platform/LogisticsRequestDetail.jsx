import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

  const parseSpecial = (data) => {
    const sr = data?.special_requirements || data?.request_details?.special_requirements || '';
    if (!sr || typeof sr !== 'string') return {};
    const lines = sr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const out = {};
    for (const ln of lines) {
      const lower = ln.toLowerCase();
      if (lower.startsWith('pickup contact:')) {
        out.origin_contact_raw = ln.replace(/^[^:]*:\s*/, '');
        const parts = out.origin_contact_raw.split('|').map(s => s.trim());
        out.origin_contact_name = parts[0] || undefined;
        out.origin_contact_phone = parts[1] || undefined;
        out.origin_contact_email = parts[2] || undefined;
      } else if (lower.startsWith('delivery contact:')) {
        out.dest_contact_raw = ln.replace(/^[^:]*:\s*/, '');
        const parts = out.dest_contact_raw.split('|').map(s => s.trim());
        out.dest_contact_name = parts[0] || undefined;
        out.dest_contact_phone = parts[1] || undefined;
        out.dest_contact_email = parts[2] || undefined;
      } else if (lower.startsWith('shipping method:')) {
        out.shipping_method = ln.replace(/^[^:]*:\s*/, '');
      } else if (lower.startsWith('preferred carrier:')) {
        out.preferred_carrier = ln.replace(/^[^:]*:\s*/, '');
      }
    }
    return out;
  };

  // Determine if this shipment/request is actually assigned to a provider.
  // Consider it assigned only when there is a concrete assignment signal,
  // not just a "preferred carrier" hint from free text.
  const isAssigned = (() => {
    const status = (request?.status || '').toLowerCase();
    return Boolean(
      request?.provider_name ||
      request?.shipping?.carrier ||
      request?.request_details?.awarded_to ||
      ['awarded', 'assigned'].includes(status)
    );
  })();

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
            className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow"
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
                    className="ml-2 text-sm text-gold hover:text-blue-800 disabled:opacity-50"
                  >
                    {togglingBids ? 'Updating…' : request.allow_bids ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div> */}
              {/* Comprehensive provider comparison system is now integrated below, removing simple assign button */}
              {false && (request.status === 'posted' || request.status === 'quoted') && (
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow flex items-center space-x-2"
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
              <div className="bg-white rounded-xl shadow-sm border py-6 px-4">
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
              <div>
                 <div className="bg-pale_yellow/20 rounded-xl shadow-sm border border-pale_yellow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Truck className="w-5 h-5 text-gold mr-2" />
                        Provider Assignment
                      </h3>
                      <span className="px-3 py-1 border border-gold text-gold text-sm font-medium rounded-full">
                        Assigned
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Logistics Provider</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {request?.provider_name || request?.shipping?.carrier || request?.request_details?.awarded_to_name || 'Assigned Provider'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Service Type</label>
                          <p className="text-sm text-gray-900">
                            {request?.shipping?.method || request?.shipping_method || parseSpecial(request).shipping_method || 'Standard Shipping'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Assignment Date</label>
                          <p className="text-sm text-gray-900">
                            {request?.assigned_at ? new Date(request.assigned_at).toLocaleDateString() : 
                              request?.updated_at ? new Date(request.updated_at).toLocaleDateString() : 'Recently assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Tracking Number</label>
                          <p className="text-sm font-mono bg-white px-3 py-2 rounded border">
                            {request?.tracking_number || `REQ-${request?.id?.slice(0, 8)}`}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Current Status</label>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request?.status)}
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {request?.status?.replace('_', ' ') || 'In Progress'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Provider Contact</label>
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{request?.provider_contact_phone || 'Contact via platform'}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{request?.provider_contact_email || 'Contact via platform'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                        {/* Shipping Information */}
               <div className="pb-6 border-b border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Method</p>
                    <p className="text-sm text-gray-900">{request?.shipping?.method || request?.shipping_method || parseSpecial(request).shipping_method || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Current Location</p>
                    <p className="text-sm text-gray-600">{request?.current_location || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Vessel/Flight Info</p>
                    <p className="text-sm text-gray-600">
                       {request?.shipping?.vessel_name ? `${request.shipping.vessel_name}` : 
                       request?.shipping?.flight_number ? `Flight ${request.shipping.flight_number}` : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Transit Time</p>
                    <p className="text-sm text-gray-600">
                      {request?.timeline?.transit_time || request?.urgency || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Container/Booking Ref</p>
                    <p className="text-sm text-gray-600">
                       {request?.shipping?.container_number || request?.shipping?.booking_reference || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Delays</p>
                    <p className="text-sm text-gray-600">
                      {request?.delays_count || 0} events{request?.total_delay_hours ? ` • ${request.total_delay_hours}h` : ''}
                    </p>
                  </div>
                </div>
              </div> 
              </div>

            )}

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(request?.documents || []).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Download className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
                {/* Render file fields from API if present */}
                {(request?.bill_of_lading || request?.delivery_receipt || request?.customs_documents) && (
                  <>
                    {request?.bill_of_lading && (
                      <a href={request.bill_of_lading} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bill of Lading</p>
                            <p className="text-xs text-gray-500">BOL</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">available</span>
                      </a>
                    )}
                    {request?.delivery_receipt && (
                      <a href={request.delivery_receipt} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivery Receipt</p>
                            <p className="text-xs text-gray-500">POD</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">available</span>
                      </a>
                    )}
                    {request?.customs_documents && (
                      <a href={request.customs_documents} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Customs Documents</p>
                            <p className="text-xs text-gray-500">CD</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">available</span>
                      </a>
                    )}
                  </>
                )}
                {(!request?.documents || request.documents.length === 0) && !request?.bill_of_lading && !request?.delivery_receipt && !request?.customs_documents && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No documents available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">
            {/* Provider Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 text-gold mr-2" />
                  Provider Status
                </h3>
                {isAssigned ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-pale_yellow/20 rounded-lg border border-pale_yellow">
                      <div className="text-lg font-bold text-gold">
            {request?.provider_name || request?.shipping?.carrier || request?.request_details?.awarded_to_name || 'Assigned Provider'}
                      </div>
                      <div className="text-sm text-gold mt-1">
                        {request?.shipping?.method || request?.shipping_method || parseSpecial(request).shipping_method || 'Logistics Provider'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assignment Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Service Level</span>
                      <span className="font-medium text-gray-900">
                        {request?.urgency || 'Standard'}
                      </span>
                    </div>
                    {request?.tracking_number && (
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-1">Tracking Reference</div>
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                          {request.tracking_number}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-lg font-bold text-yellow-900">
                        Pending Assignment
                      </div>
                      <div className="text-sm text-yellow-600 mt-1">
                        Awaiting provider selection
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quotes Received</span>
                      <span className="font-medium text-gray-900">{request?.quotes_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-gray-900 capitalize">{request?.status || 'Open'}</span>
                    </div>
                    {/* {request?.status === 'posted' && (
                      <div className="pt-3 border-t">
                        <Link
                          to={`${webRoutes.logisticsRequestDetail.replace(':id', request?.id)}`}
                        >
                          <button  className="inline-flex items-center justify-center w-full px-3 py-2 border border-gold shadow-sm text-sm font-medium rounded-md text-gold hover:bg-pale_yellow/30">
                          <Truck className="w-4 h-4 mr-2" />
                          Assign Provider
                          </button>
                        </Link>
                      </div>
                    )} */}
                  </div>
                )}
              </div>

                     {/* Key Information */}
                     <div className="bg-white rounded-xl shadow-sm border p-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Details</h3>
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Request ID</span>
                           <span className="text-sm font-mono font-medium text-gray-900">
                             {`REQ-${request?.id?.slice(0, 8)}` || 'Not assigned'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Pickup Date</span>
                           <span className="text-sm font-medium text-gray-900">
                             {request?.actual_pickup_date
                               ? new Date(request.actual_pickup_date).toLocaleDateString()
                               : request?.pickup_date_requested 
                                 ? new Date(request.pickup_date_requested).toLocaleDateString()
                                 : request?.timeline?.pickup_date 
                                   ? new Date(request.timeline.pickup_date).toLocaleDateString()
                                   : 'Not specified'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Est. Delivery</span>
                           <span className="text-sm font-medium text-gray-900">
                             {request?.actual_delivery_date
                               ? new Date(request.actual_delivery_date).toLocaleDateString()
                               : request?.delivery_date_requested 
                                 ? new Date(request.delivery_date_requested).toLocaleDateString()
                                 : request?.timeline?.estimated_delivery 
                                   ? new Date(request.timeline.estimated_delivery).toLocaleDateString()
                                   : 'Not specified'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Transit Time</span>
                           <span className="text-sm font-medium text-gray-900">
                             {request?.timeline?.transit_time || request?.urgency || 'Not specified'}
                           </span>
                         </div>
                       </div>
                     </div>
         
                     {/* Origin & Destination */}
                     <div className="bg-white rounded-xl shadow-sm border p-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations</h3>
                       <div className="space-y-6">
                         <div>
                           <h4 className="text-sm font-medium text-gray-900 mb-2">Origin</h4>
                           <div className="text-sm space-y-1">
                             <p className="font-medium">{request?.origin?.name || 'Origin Location'}</p>
                             <p className="text-gray-600">{request?.origin_address || 'Address not specified'}</p>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <User className="w-3 h-3" />
                               <span>{request?.origin?.contact_name || request?.origin_contact_name || parseSpecial(request).origin_contact_name || 'Contact not specified'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Phone className="w-3 h-3" />
                               <span>{request?.origin?.contact_phone || request?.origin_contact_phone || parseSpecial(request).origin_contact_phone || 'Phone not specified'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Mail className="w-3 h-3" />
                               <span>{request?.origin?.contact_email || request?.origin_contact_email || parseSpecial(request).origin_contact_email || 'Email not specified'}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="border-t border-gray-200 pt-6">
                           <h4 className="text-sm font-medium text-gray-900 mb-2">Destination</h4>
                           <div className="text-sm space-y-1">
                             <p className="font-medium">{request?.destination?.name || 'Destination Location'}</p>
                             <p className="text-gray-600">{request?.destination_address || 'Address not specified'}</p>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <User className="w-3 h-3" />
                               <span>{request?.destination?.contact_name || request?.destination_contact_name || parseSpecial(request).dest_contact_name || 'Contact not specified'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Phone className="w-3 h-3" />
                               <span>{request?.destination?.contact_phone || request?.destination_contact_phone || parseSpecial(request).dest_contact_phone || 'Phone not specified'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Mail className="w-3 h-3" />
                               <span>{request?.destination?.contact_email || request?.destination_contact_email || parseSpecial(request).dest_contact_email || 'Email not specified'}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
         
                     {/* Cost Breakdown */}
                     <div className="bg-white rounded-xl shadow-sm border p-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
                         {request?.costs ? 'Cost Breakdown' : 'Budget Information'}
                       </h3>
                       <div className="space-y-3">
                         {request?.costs ? (
                           <>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Freight</span>
                               <span className="text-sm font-medium text-gray-900">{formatCurrency(request.costs.freight)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Insurance</span>
                               <span className="text-sm font-medium text-gray-900">{formatCurrency(request.costs.insurance)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Handling</span>
                               <span className="text-sm font-medium text-gray-900">{formatCurrency(request.costs.handling)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Customs</span>
                               <span className="text-sm font-medium text-gray-900">{formatCurrency(request.costs.customs)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Fuel Surcharge</span>
                               <span className="text-sm font-medium text-gray-900">{formatCurrency(request.costs.fuel_surcharge)}</span>
                             </div>
                             <div className="border-t border-gray-200 pt-3">
                               <div className="flex items-center justify-between">
                                 <span className="text-sm font-medium text-gray-900">Total</span>
                                 <span className="text-sm font-bold text-gray-900">{formatCurrency(request.costs.total)}</span>
                               </div>
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Budget Range</span>
                               <span className="text-sm font-medium text-gray-900">
                                 {request?.budget_min && request?.budget_max 
                                   ? `${formatCurrency(request.budget_min)} - ${formatCurrency(request.budget_max)}`
                                   : request?.budget ? formatCurrency(request.budget) : 'Not specified'
                                 }
                               </span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Currency</span>
                               <span className="text-sm font-medium text-gray-900">{request?.currency || 'USD'}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Quotes Received</span>
                               <span className="text-sm font-medium text-gray-900">{request?.quotes_count || 0}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">Status</span>
                               <span className="text-sm font-medium text-gray-900 capitalize">{request?.status || 'Posted'}</span>
                             </div>
                           </>
                         )}
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
