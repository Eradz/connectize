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
  Plus
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
      case 'posted': return <Clock className="w-5 h-5 text-blue-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsRequests)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {request.title || `${request.cargo_type} Request`}
                  </h1>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
                    {getStatusIcon(request.status)}
                    <span className="text-sm font-medium">{getStatusLabel(request.status)}</span>
                  </div>
                  {userId != null && String(request.requested_by) === String(userId) && (
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">Mine</span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {userId != null && String(request.requested_by) === String(userId) && (request.status === 'draft' || request.status === 'posted' || request.status === 'awarded') && (
                <>
                  <button
                    onClick={() => navigate(`${webRoutes.logisticsRequests}/${request.id}/edit`)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {(request.status === 'draft' || request.status === 'posted') && (
                    <button
                      onClick={handleDeleteRequest}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
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
              </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{request.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cargo Type</label>
                    <p className="text-sm text-gray-900 mt-1">{request.cargo_type?.replace('_', ' ') || 'General Cargo'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Urgency</label>
                    <p className="text-sm text-gray-900 mt-1">{request.urgency || 'Standard'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Weight</label>
                    <p className="text-sm text-gray-900 mt-1">{request.weight || 0} tons</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Volume</label>
                    <p className="text-sm text-gray-900 mt-1">{request.volume || 0} m³</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations & Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <h4 className="font-medium text-gray-900">Pickup Location</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">{request.origin_address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="text-sm">{request.origin_contact_name || 'Contact not specified'}</span>
                    </div>
                    {request.origin_contact_phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{request.origin_contact_phone}</span>
                      </div>
                    )}
                    {request.origin_contact_email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{request.origin_contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <h4 className="font-medium text-gray-900">Delivery Location</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">{request.destination_address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="text-sm">{request.destination_contact_name || 'Contact not specified'}</span>
                    </div>
                    {request.destination_contact_phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{request.destination_contact_phone}</span>
                      </div>
                    )}
                    {request.destination_contact_email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{request.destination_contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Preferred Pickup Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(request.pickup_date_requested)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Requested Delivery Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(request.delivery_date_requested)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotes Section */}
            {quotes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Quotes ({quotes.length})</h3>
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{quote.provider_name}</h4>
                          <p className="text-sm text-gray-600">{quote.service_description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(quote.total_cost, quote.currency)}
                          </p>
                          <p className="text-xs text-gray-500">Valid until {formatDate(quote.valid_until)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>Pickup: {formatDate(quote.estimated_pickup_date)}</div>
                        <div>Delivery: {formatDate(quote.estimated_delivery_date)}</div>
                        <div>Payment: {quote.payment_terms}</div>
                      </div>
                      {userId != null && String(request.requested_by) === String(userId) && request.status === 'quoted' && (
                        <button
                          onClick={() => handleAwardQuote(quote.id)}
                          disabled={awarding}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {awarding ? 'Awarding...' : 'Award This Quote'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Information</h3>
              <div className="space-y-3">
                {request.budget_min && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Minimum Budget</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(request.budget_min, request.currency)}
                    </span>
                  </div>
                )}
                {request.budget_max && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Maximum Budget</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(request.budget_max, request.currency)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="text-sm font-medium text-gray-900">{request.currency || 'USD'}</span>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {request.special_requirements && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.special_requirements}</p>
              </div>
            )}

            {/* Request Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(request.updated_at)}</span>
                </div>
                {request.awarded_to && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Awarded To</span>
                    <span className="text-sm font-medium text-gray-900">{request.awarded_to_name || request.awarded_to}</span>
                  </div>
                )}
                {request.shipment_tracking_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tracking #</span>
                    <span className="text-sm font-medium text-gray-900">{request.shipment_tracking_number}</span>
                  </div>
                )}
                {request.shipment_status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shipment Status</span>
                    <span className="text-sm font-medium text-gray-900">{request.shipment_status.replace('_', ' ')}</span>
                  </div>
                )}
                {request.shipment_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shipment</span>
                    <button
                      onClick={() => navigate(`${webRoutes.logisticsShipments}/${request.shipment_id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View Shipment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Initial Tracking */}
            {request.shipment_id && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Tracking</h3>
                {initialTracking.length === 0 ? (
                  <p className="text-sm text-gray-600">No tracking events yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {initialTracking.slice(0, 3).map((ev) => (
                      <li key={ev.id} className="py-3 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ev.event_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-600">{ev.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{formatDate(ev.timestamp)}</p>
                          {ev.location && <p className="text-xs text-gray-500">{ev.location}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardToProvider}
                disabled={!selectedProvider || awarding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit a Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
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
