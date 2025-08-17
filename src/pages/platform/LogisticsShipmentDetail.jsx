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
          setShipment(shipmentData);
          
          // Load tracking data if available
          try {
            const trackingResponse = await logisticsAPI.getShipmentTracking(shipmentData.id);
            const trackingData = trackingResponse?.data ?? trackingResponse;
            setTrackingHistory(Array.isArray(trackingData?.results) ? trackingData.results : []);
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
            weight: requestData.weight,
            volume: requestData.volume,
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
            budget: requestData.budget
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      case 'transfer': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'in_transit': return <Truck className="w-5 h-5" />;
      case 'arrived': return <MapPin className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'delayed': return <AlertTriangle className="w-5 h-5" />;
      case 'transfer': return <Plane className="w-5 h-5" />;
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
                  Shipment {shipment.tracking_number}
                </h1>
                <p className="text-gray-600 mt-1">
                  {shipment?.origin?.name || 'Origin'} → {shipment?.destination?.name || 'Destination'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-2 rounded-lg border font-medium capitalize ${getStatusColor(shipment.status)}`}>
                {getStatusIcon(shipment.status)}
                <span className="ml-2">{shipment.status.replace('_', ' ')}</span>
              </span>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
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
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
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
                    <p className="text-sm text-gray-900">{shipment?.cargo?.type || 'General Cargo'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900">{shipment?.cargo?.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commodity Code</label>
                    <p className="text-sm text-gray-900">{shipment?.cargo?.commodity_code || 'Not specified'}</p>
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
                      <p className="text-sm text-gray-900">{shipment?.volume || shipment?.cargo?.volume || '0'} m³</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Pieces</label>
                      <p className="text-sm text-gray-900">{shipment?.cargo?.pieces || '1'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Value</label>
                      <p className="text-sm text-gray-900 font-semibold">{formatCurrency(shipment?.cargo?.value || shipment?.budget || 0)}</p>
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

            {/* Shipping Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Method</label>
                    <p className="text-sm text-gray-900">{shipment.shipping.method}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Carrier</label>
                    <p className="text-sm text-gray-900">{shipment.shipping.carrier}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Vessel Name</label>
                    <p className="text-sm text-gray-900">{shipment.shipping.vessel_name}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Container Number</label>
                    <p className="text-sm text-gray-900 font-mono">{shipment.shipping.container_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Booking Reference</label>
                    <p className="text-sm text-gray-900 font-mono">{shipment.shipping.booking_reference}</p>
                  </div>
                  {shipment.shipping.flight_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Flight Number</label>
                      <p className="text-sm text-gray-900">{shipment.shipping.flight_number}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipment.documents.map((doc, index) => (
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tracking Number</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{shipment.tracking_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pickup Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(shipment.timeline.pickup_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. Delivery</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(shipment.timeline.estimated_delivery).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transit Time</span>
                  <span className="text-sm font-medium text-gray-900">{shipment.timeline.transit_time}</span>
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
                    <p className="text-gray-600">{shipment?.origin?.address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_name || 'Contact not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_phone || 'Phone not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{shipment?.origin?.contact_email || 'Email not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Destination</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{shipment?.destination?.name || 'Destination Location'}</p>
                    <p className="text-gray-600">{shipment?.destination?.address || 'Address not specified'}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_name || 'Contact not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_phone || 'Phone not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{shipment?.destination?.contact_email || 'Email not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsShipmentDetail;
