import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Truck, 
  MapPin, 
  Calendar, 
  Package,
  DollarSign,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Plane,
  Ship,
  Info
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';
import ProviderComparisonSystem from '../../components/logistics/ProviderComparisonSystem';

const LogisticsShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);

  useEffect(() => {
    loadShipmentDetail();
  }, [id]);

  const loadShipmentDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading shipment detail for ID:', id);
      
      // Try to fetch shipment by ID first
      try {
        console.log('📦 Attempting to fetch as shipment...');
        const response = await logisticsAPI.getShipment(id);
        const shipmentData = response?.data ?? response;
        console.log('✅ Shipment data:', shipmentData);
        
        // Check if we got valid shipment data
        if (shipmentData && shipmentData.id) {
          // Normalize shipment by flattening request_details fields used by the UI
          const rd = shipmentData.request_details || {};
          const normalizedShipment = {
            ...shipmentData,
            // Mirror request fields at top-level so UI reads consistent keys
            title: shipmentData.title || rd.title || shipmentData.tracking_number || shipmentData.id,
            cargo_type: shipmentData.cargo_type || rd.cargo_type,
            description: shipmentData.description || rd.description,
            origin_address: shipmentData.origin_address || rd.origin_address,
            destination_address: shipmentData.destination_address || rd.destination_address,
            origin_contact_name: shipmentData.origin_contact_name || rd.origin_contact_name,
            origin_contact_phone: shipmentData.origin_contact_phone || rd.origin_contact_phone,
            origin_contact_email: shipmentData.origin_contact_email || rd.origin_contact_email,
            destination_contact_name: shipmentData.destination_contact_name || rd.destination_contact_name,
            destination_contact_phone: shipmentData.destination_contact_phone || rd.destination_contact_phone,
            destination_contact_email: shipmentData.destination_contact_email || rd.destination_contact_email,
            weight: shipmentData.weight || rd.weight,
            volume: shipmentData.volume || rd.volume,
            dimensions: shipmentData.dimensions || rd.dimensions,
            pickup_date_requested: shipmentData.pickup_date_requested || rd.pickup_date_requested,
            delivery_date_requested: shipmentData.delivery_date_requested || rd.delivery_date_requested,
            urgency: shipmentData.urgency || rd.urgency,
            budget: shipmentData.budget || rd.budget,
            budget_min: shipmentData.budget_min || rd.budget_min,
            budget_max: shipmentData.budget_max || rd.budget_max,
            currency: shipmentData.currency || rd.currency,
            quotes_count: shipmentData.quotes_count || rd.quotes_count,
          };
          setShipment(normalizedShipment);
          
          // Load tracking data if available
          try {
            const trackingResponse = await logisticsAPI.getShipmentTrackingById(shipmentData.id);
            const trackingData = trackingResponse?.data ?? trackingResponse;
            const events = Array.isArray(trackingData)
              ? trackingData
              : Array.isArray(trackingData?.results)
                ? trackingData.results
                : [];
            setTrackingHistory(events);
          } catch (trackingError) {
            console.warn('Failed to load tracking data:', trackingError);
            setTrackingHistory([]);
          }
          return;
        }
      } catch (shipmentError) {
        console.warn('Shipment fetch failed:', shipmentError.message);
      }
      
      // Fallback: try to fetch as request ID
      try {
        console.log('📋 Attempting to fetch as request...');
        const requestResponse = await logisticsAPI.getRequest(id);
        const requestData = requestResponse?.data ?? requestResponse;
        console.log('✅ Request data:', requestData);
        
        if (requestData && requestData.id) {
          // Normalize request data for display
          const normalizedRequest = {
            id: requestData.id,
            tracking_number: null,
            status: requestData.status,
            provider_name: requestData.awarded_to_name || null,
            request: requestData.id,
            request_details: requestData,
            // Direct fields mirrored from API for exact mapping in UI
            title: requestData.title,
            cargo_type: requestData.cargo_type,
            description: requestData.description,
            origin_contact_name: requestData.origin_contact_name,
            origin_contact_phone: requestData.origin_contact_phone,
            origin_contact_email: requestData.origin_contact_email,
            destination_contact_name: requestData.destination_contact_name,
            destination_contact_phone: requestData.destination_contact_phone,
            destination_contact_email: requestData.destination_contact_email,
            weight: requestData.weight,
            volume: requestData.volume,
            dimensions: requestData.dimensions,
            pickup_date_requested: requestData.pickup_date_requested,
            delivery_date_requested: requestData.delivery_date_requested,
            urgency: requestData.urgency,
            budget: requestData.budget,
            budget_min: requestData.budget_min,
            budget_max: requestData.budget_max,
            currency: requestData.currency,
            quotes_count: requestData.quotes_count,
            current_location: null,
            created_at: requestData.created_at,
            updated_at: requestData.updated_at,
            // Add missing fields that the component expects
            origin: requestData.origin || {
              name: requestData.origin_name || 'Origin Location',
              address: requestData.origin_address || 'Address not specified',
              contact_name: requestData.origin_contact_name || 'Contact not specified',
              contact_phone: requestData.origin_contact_phone || 'Phone not specified',
              contact_email: requestData.origin_contact_email || 'Email not specified'
            },
            destination: requestData.destination || {
              name: requestData.destination_name || 'Destination Location', 
              address: requestData.destination_address || 'Address not specified',
              contact_name: requestData.destination_contact_name || 'Contact not specified',
              contact_phone: requestData.destination_contact_phone || 'Phone not specified',
              contact_email: requestData.destination_contact_email || 'Email not specified'
            },
            cargo: requestData.cargo || {
              type: requestData.cargo_type || 'General Cargo',
              description: requestData.description || 'No description',
              value: requestData.cargo_value || 0,
              dangerous_goods: requestData.dangerous_goods || false
            },
            // Add other expected fields
            pickup_date: requestData.pickup_date,
            delivery_date: requestData.requested_delivery_date,
            shipping_method: requestData.shipping_method,
            special_instructions: requestData.special_instructions,
            special_requirements: requestData.special_requirements
          };
          
          console.log('🔄 Using normalized request data');
          setShipment(normalizedRequest);
          setTrackingHistory([]);
          return;
        }
      } catch (requestError) {
        console.warn('Request fetch also failed:', requestError.message);
      }
      
      // Final fallback: generate mock data
      console.warn('Both API calls failed, using mock data');
      const mockShipment = generateMockShipmentDetail(id);
      setShipment(mockShipment);
      setTrackingHistory(mockShipment.tracking_history);
      
    } catch (error) {
      toast.error('Failed to load shipment details');
      console.error('Error loading shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockShipmentDetail = (shipmentId) => {
    const statuses = ['pending', 'in_transit', 'delivered', 'delayed'];
    const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: shipmentId,
      tracking_number: `TRK${String(shipmentId).padStart(6, '0')}`,
      status: currentStatus,
      origin: {
        name: 'Houston Supply Terminal',
        address: '8200 Westpark Dr, Houston, TX 77063',
        contact: 'John Martinez',
        phone: '+1-713-555-0123',
        email: 'operations@houston-terminal.com'
      },
      destination: {
        name: 'North Sea Platform Alpha',
        address: 'North Sea, 200km offshore Aberdeen',
        contact: 'Sarah Thompson',
        phone: '+44-1224-555-0456',
        email: 'platform@northsea-alpha.com'
      },
      cargo: {
        type: 'Drilling Equipment',
        description: 'Advanced drilling bits and safety equipment for offshore operations',
        weight: 45.2,
        volume: 125.8,
        pieces: 156,
        dangerous_goods: true,
        value: 2450000,
        commodity_code: 'DRL-001-ADV'
      },
      shipping: {
        method: 'Ocean Freight + Air Freight',
        carrier: 'Global Logistics Solutions',
        vessel_name: 'MV Ocean Pioneer',
        flight_number: 'GLS-4829',
        container_number: 'GLSU1234567',
        booking_reference: 'BK-789654123'
      },
      timeline: {
        pickup_date: '2024-01-10T08:00:00Z',
        estimated_delivery: '2024-01-18T16:00:00Z',
        actual_delivery: currentStatus === 'delivered' ? '2024-01-17T14:30:00Z' : null,
        transit_time: '8 days'
      },
      costs: {
        freight: 125000,
        insurance: 24500,
        handling: 8500,
        customs: 3200,
        fuel_surcharge: 15600,
        total: 176800
      },
      documents: [
        { name: 'Bill of Lading', type: 'BOL', status: 'completed', url: '#' },
        { name: 'Commercial Invoice', type: 'CI', status: 'completed', url: '#' },
        { name: 'Packing List', type: 'PL', status: 'completed', url: '#' },
        { name: 'Certificate of Origin', type: 'CO', status: 'completed', url: '#' },
        { name: 'Dangerous Goods Declaration', type: 'DGD', status: 'completed', url: '#' },
        { name: 'Customs Declaration', type: 'CD', status: 'pending', url: '#' }
      ],
      tracking_history: [
        {
          timestamp: '2024-01-10T08:00:00Z',
          location: 'Houston, TX, USA',
          status: 'picked_up',
          description: 'Cargo picked up from warehouse',
          type: 'pickup'
        },
        {
          timestamp: '2024-01-10T14:30:00Z',
          location: 'Houston Port, TX, USA', 
          status: 'in_transit',
          description: 'Loaded onto vessel MV Ocean Pioneer',
          type: 'loading'
        },
        {
          timestamp: '2024-01-11T09:15:00Z',
          location: 'Gulf of Mexico',
          status: 'in_transit',
          description: 'Vessel departed Houston Port',
          type: 'departure'
        },
        {
          timestamp: '2024-01-14T16:45:00Z',
          location: 'Atlantic Ocean',
          status: 'in_transit',
          description: 'Crossing Atlantic - on schedule',
          type: 'checkpoint'
        },
        {
          timestamp: '2024-01-16T08:20:00Z',
          location: 'Aberdeen Port, Scotland',
          status: 'arrived',
          description: 'Arrived at Aberdeen Port',
          type: 'arrival'
        },
        {
          timestamp: '2024-01-16T12:00:00Z',
          location: 'Aberdeen Airport, Scotland',
          status: 'transfer',
          description: 'Transferred to air freight for final delivery',
          type: 'transfer'
        }
      ]
    };
  };

  const getStatusColor = (code) => {
    const s = (code || '').toLowerCase();
    switch (s) {
      // Shipment status
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at_destination': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'exception': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-200 text-gray-700 border-gray-300';
      // Tracking event types
      case 'created': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'arrived_facility': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'departed_facility': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customs_clearance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'out_for_delivery': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (code) => {
    const s = (code || '').toLowerCase();
    switch (s) {
      case 'preparing': return <Clock className="w-5 h-5" />;
      case 'picked_up': return <Truck className="w-5 h-5" />;
      case 'in_transit': return <Truck className="w-5 h-5" />;
      case 'at_destination': return <MapPin className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'exception': return <AlertTriangle className="w-5 h-5" />;
      case 'cancelled': return <AlertTriangle className="w-5 h-5" />;
      case 'created': return <Package className="w-5 h-5" />;
      case 'arrived_facility': return <MapPin className="w-5 h-5" />;
      case 'departed_facility': return <Plane className="w-5 h-5" />;
      case 'customs_clearance': return <Info className="w-5 h-5" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5" />;
      case 'delayed': return <AlertTriangle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute a robust volume for display: prefer API volume if > 0; else compute from dimensions; else default to 1
  const getDisplayVolume = (data) => {
    if (!data) return '1';
    const toNum = (v) => {
      const n = typeof v === 'string' ? parseFloat(v) : Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    // 1) Direct volume from API
    const vol = toNum(data.volume || data.request_details?.volume);
    if (vol > 0) return vol.toFixed(2).replace(/\.00$/, '');
    // 2) Sum item volumes if structured dimensions exist
    const items = data.dimensions?.items || data.request_details?.dimensions?.items;
    if (Array.isArray(items) && items.length > 0) {
      const total = items.reduce((sum, item) => {
        const dims = item.dimensions || item?.dimensions?.dimensions || {}; // support nested shape just in case
        const L = toNum(dims.length);
        const W = toNum(dims.width);
        const H = toNum(dims.height);
        const qty = toNum(item.quantity) || 1;
        const v = L * W * H * qty;
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0);
      if (total > 0) return total.toFixed(2).replace(/\.00$/, '');
      // If items exist but dimensions are zero, default to 1 m³
      return '1';
    }
    // 3) Final fallback
    return '1';
  };

  // Extract optional contact/method hints from special_requirements free text
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

  const handleDownload = async () => {
    if (!shipment?.id) {
      toast.error('Cannot download shipment: No shipment data available');
      return;
    }

    try {
      toast.loading('Generating shipment document...');
      
      // Call download API
      const blob = await logisticsAPI.downloadShipment(shipment.id);
      
      // Validate blob
      if (!blob || !(blob instanceof Blob)) {
        console.error('Invalid blob response:', blob);
        toast.dismiss();
        toast.error('Failed to download: Invalid response from server');
        return;
      }

      // Check if blob is actually an error response (HTML)
      if (blob.type === 'text/html') {
        console.error('Received HTML instead of CSV');
        toast.dismiss();
        toast.error('Server error: Please restart the backend server');
        return;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with tracking number or ID
      const filename = shipment.tracking_number 
        ? `shipment_${shipment.tracking_number}.csv`
        : `shipment_${shipment.id}.csv`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Shipment document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      
      if (error.response?.status === 500) {
        toast.error('Server error: Please restart the backend server');
      } else if (error.response?.status === 404) {
        toast.error('Download endpoint not found. Please restart the backend server.');
      } else {
        toast.error('Failed to download shipment document');
      }
    }
  };

  const handleShare = async () => {
    if (!shipment?.id) {
      toast.error('Cannot share shipment: No shipment data available');
      return;
    }

    const shareUrl = window.location.href;
    const shareText = `Shipment ${shipment.tracking_number || shipment.id} - ${shipment.status}`;

    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `Track shipment: ${shipment.tracking_number || shipment.id}`,
          url: shareUrl,
        });
        toast.success('Shared successfully');
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
          // Fall back to clipboard
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch((error) => {
          console.error('Clipboard error:', error);
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    // Create a temporary textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link');
      }
    } catch (error) {
      console.error('Fallback copy error:', error);
      toast.error('Failed to copy link');
    }

    document.body.removeChild(textArea);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Shipment not found</h3>
          <p className="mt-1 text-sm text-gray-500">The shipment you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to={webRoutes.logisticsDashboard}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Logistics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this shipment/request is actually assigned to a provider.
  // Consider it assigned only when there is a concrete assignment signal,
  // not just a "preferred carrier" hint from free text.
  const isAssigned = (() => {
    const status = (shipment?.status || '').toLowerCase();
    return Boolean(
      shipment?.provider_name ||
      shipment?.shipping?.carrier ||
      shipment?.request_details?.awarded_to ||
      ['awarded', 'assigned'].includes(status)
    );
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsDashboard)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {shipment?.title || `Request REQ-${shipment?.id?.slice(0, 8)}`}
                </h1>
                <p className="text-gray-600 mt-1">
                  {shipment?.origin_address || shipment?.origin?.name || 'Origin'} → {shipment?.destination_address || shipment?.destination?.name || 'Destination'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-2 rounded-lg border font-medium capitalize ${getStatusColor(shipment.status)}`}>
                {getStatusIcon(shipment.status)}
                <span className="ml-2">{shipment.status.replace('_', ' ')}</span>
              </span>
              <button 
                onClick={handleShare}
                disabled={!shipment?.id}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button 
                onClick={handleDownload}
                disabled={!shipment?.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
              <div className="space-y-6">
                {trackingHistory.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.event_type || event.status)}`}>
                      {getStatusIcon(event.event_type || event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(event.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cargo Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cargo Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cargo Type</label>
                    <p className="text-sm text-gray-900">{shipment?.cargo_type?.replace('_', ' ') || 'General Cargo'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900">{shipment?.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commodity Code</label>
                    <p className="text-sm text-gray-900">{shipment?.dimensions?.items?.[0]?.commodity_code || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-sm text-gray-900">{shipment?.weight || shipment?.cargo?.weight || '0'} kg</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Volume</label>
                      <p className="text-sm text-gray-900">{getDisplayVolume(shipment)} m³</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Pieces</label>
                      <p className="text-sm text-gray-900">{shipment?.dimensions?.items?.[0]?.quantity || '1'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Value</label>
                      <p className="text-sm text-gray-900 font-semibold">{formatCurrency(shipment?.dimensions?.items?.[0]?.value || 0)}</p>
                    </div>
                  </div>
                  {shipment?.cargo?.dangerous_goods && (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Dangerous Goods</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Assignment (if shipment has been assigned) */}
            {isAssigned && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 text-blue-600 mr-2" />
                    Provider Assignment
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Assigned
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Logistics Provider</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {shipment?.provider_name || shipment?.shipping?.carrier || shipment?.request_details?.awarded_to_name || 'Assigned Provider'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Service Type</label>
                      <p className="text-sm text-gray-900">
                        {shipment?.shipping?.method || shipment?.shipping_method || parseSpecial(shipment).shipping_method || 'Standard Shipping'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Assignment Date</label>
                      <p className="text-sm text-gray-900">
                        {shipment?.assigned_at ? new Date(shipment.assigned_at).toLocaleDateString() : 
                         shipment?.updated_at ? new Date(shipment.updated_at).toLocaleDateString() : 'Recently assigned'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Tracking Number</label>
                      <p className="text-sm font-mono bg-white px-3 py-2 rounded border">
                        {shipment?.tracking_number || `REQ-${shipment?.id?.slice(0, 8)}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Current Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(shipment?.status)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {shipment?.status?.replace('_', ' ') || 'In Progress'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Provider Contact</label>
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{shipment?.provider_contact_phone || 'Contact via platform'}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{shipment?.provider_contact_email || 'Contact via platform'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Selection System (if shipment is not yet assigned) */}
            {!isAssigned && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    Provider Assignment Required
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                    Pending Assignment
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-700 mb-4">
                    This shipment request has not been assigned to a logistics provider yet. 
                    Compare available providers and select the best option based on rates, transit times, and service quality.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <h4 className="font-medium text-gray-900 mb-3">Why assign a provider?</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Get real-time tracking information</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Lock in competitive shipping rates</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Access provider-specific services</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Enable automated status updates</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Comprehensive Provider Comparison System */}
                <ProviderComparisonSystem
                  shipmentRequest={shipment}
                  onProviderSelected={(assignmentData) => {
                    toast.success(`Provider ${assignmentData.provider_name} assigned successfully!`);
                    // Reload shipment data to show updated assignment
                    loadShipmentDetail();
                  }}
                  onSuccess={(successData) => {
                    toast.success('Shipment successfully assigned to provider!');
                    // Reload shipment data to show updated assignment
                    loadShipmentDetail();
                  }}
                />
              </div>
            )}

            {/* Shipping Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Method</label>
                    <p className="text-sm text-gray-900">{shipment?.shipping?.method || shipment?.shipping_method || parseSpecial(shipment).shipping_method || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Vessel/Flight Info</label>
                    <p className="text-sm text-gray-900">
                      {shipment?.shipping?.vessel_name ? `${shipment.shipping.vessel_name}` : 
                       shipment?.shipping?.flight_number ? `Flight ${shipment.shipping.flight_number}` : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Container/Booking Ref</label>
                    <p className="text-sm text-gray-900">
                      {shipment?.shipping?.container_number || shipment?.shipping?.booking_reference || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Current Location</label>
                    <p className="text-sm text-gray-900">{shipment?.current_location || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Transit Time</label>
                    <p className="text-sm text-gray-900">{shipment?.timeline?.transit_time || shipment?.urgency || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Delays</label>
                    <p className="text-sm text-gray-900">{shipment?.delays_count || 0} events{shipment?.total_delay_hours ? ` • ${shipment.total_delay_hours}h` : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(shipment?.documents || []).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Download className="w-4 h-4 text-blue-600" />
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
                {(shipment?.bill_of_lading || shipment?.delivery_receipt || shipment?.customs_documents) && (
                  <>
                    {shipment?.bill_of_lading && (
                      <a href={shipment.bill_of_lading} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bill of Lading</p>
                            <p className="text-xs text-gray-500">BOL</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">available</span>
                      </a>
                    )}
                    {shipment?.delivery_receipt && (
                      <a href={shipment.delivery_receipt} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivery Receipt</p>
                            <p className="text-xs text-gray-500">POD</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">available</span>
                      </a>
                    )}
                    {shipment?.customs_documents && (
                      <a href={shipment.customs_documents} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4 text-blue-600" />
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
                {(!shipment?.documents || shipment.documents.length === 0) && !shipment?.bill_of_lading && !shipment?.delivery_receipt && !shipment?.customs_documents && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No documents available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 text-blue-600 mr-2" />
                Provider Status
              </h3>
              {isAssigned ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">
          {shipment?.provider_name || shipment?.shipping?.carrier || shipment?.request_details?.awarded_to_name || 'Assigned Provider'}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {shipment?.shipping?.method || shipment?.shipping_method || parseSpecial(shipment).shipping_method || 'Logistics Provider'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Assignment Status</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Service Level</span>
                    <span className="font-medium text-gray-900">
                      {shipment?.urgency || 'Standard'}
                    </span>
                  </div>
                  {shipment?.tracking_number && (
                    <div className="pt-3 border-t">
                      <div className="text-sm text-gray-600 mb-1">Tracking Reference</div>
                      <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                        {shipment.tracking_number}
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
                    <span className="font-medium text-gray-900">{shipment?.quotes_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-gray-900 capitalize">{shipment?.status || 'Open'}</span>
                  </div>
                  {shipment?.status === 'posted' && (
                    <div className="pt-3 border-t">
                      <Link
                        to={`${webRoutes.logisticsRequestDetail.replace(':id', shipment?.id)}`}
                        className="inline-flex items-center justify-center w-full px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Assign Provider
                      </Link>
                    </div>
                  )}
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
                    {`REQ-${shipment?.id?.slice(0, 8)}` || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pickup Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {shipment?.actual_pickup_date
                      ? new Date(shipment.actual_pickup_date).toLocaleDateString()
                      : shipment?.pickup_date_requested 
                        ? new Date(shipment.pickup_date_requested).toLocaleDateString()
                        : shipment?.timeline?.pickup_date 
                          ? new Date(shipment.timeline.pickup_date).toLocaleDateString()
                          : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. Delivery</span>
                  <span className="text-sm font-medium text-gray-900">
                    {shipment?.actual_delivery_date
                      ? new Date(shipment.actual_delivery_date).toLocaleDateString()
                      : shipment?.delivery_date_requested 
                        ? new Date(shipment.delivery_date_requested).toLocaleDateString()
                        : shipment?.timeline?.estimated_delivery 
                          ? new Date(shipment.timeline.estimated_delivery).toLocaleDateString()
                          : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transit Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {shipment?.timeline?.transit_time || shipment?.urgency || 'Not specified'}
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
                    <p className="font-medium">{shipment?.origin?.name || 'Origin Location'}</p>
                    <p className="text-gray-600">{shipment?.origin_address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_name || shipment?.origin_contact_name || parseSpecial(shipment).origin_contact_name || 'Contact not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_phone || shipment?.origin_contact_phone || parseSpecial(shipment).origin_contact_phone || 'Phone not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_email || shipment?.origin_contact_email || parseSpecial(shipment).origin_contact_email || 'Email not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Destination</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{shipment?.destination?.name || 'Destination Location'}</p>
                    <p className="text-gray-600">{shipment?.destination_address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_name || shipment?.destination_contact_name || parseSpecial(shipment).dest_contact_name || 'Contact not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_phone || shipment?.destination_contact_phone || parseSpecial(shipment).dest_contact_phone || 'Phone not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_email || shipment?.destination_contact_email || parseSpecial(shipment).dest_contact_email || 'Email not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {shipment?.costs ? 'Cost Breakdown' : 'Budget Information'}
              </h3>
              <div className="space-y-3">
                {shipment?.costs ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Freight</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shipment.costs.freight)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Insurance</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shipment.costs.insurance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Handling</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shipment.costs.handling)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customs</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shipment.costs.customs)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fuel Surcharge</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shipment.costs.fuel_surcharge)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Total</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(shipment.costs.total)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Budget Range</span>
                      <span className="text-sm font-medium text-gray-900">
                        {shipment?.budget_min && shipment?.budget_max 
                          ? `${formatCurrency(shipment.budget_min)} - ${formatCurrency(shipment.budget_max)}`
                          : shipment?.budget ? formatCurrency(shipment.budget) : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="text-sm font-medium text-gray-900">{shipment?.currency || 'USD'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quotes Received</span>
                      <span className="text-sm font-medium text-gray-900">{shipment?.quotes_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{shipment?.status || 'Posted'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsShipmentDetail;
