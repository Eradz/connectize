import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Eye,
  Plus,
  Navigation,
  Anchor,
  Plane,
  Train
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import logistics from '../../api-services/logistics';
import { toast } from 'sonner';

const POLL_INTERVAL = 30000; // 30 seconds

const LogisticsTracking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
  const pollRef = useRef(null);

  // Normalize backend Shipment data into a flat tracking-card shape
  const normalizeShipment = (shipment) => {
    const req = shipment.request_details || {};
    const status = shipment.status || 'preparing';
    const shipDate = shipment.actual_pickup_date || req.pickup_date_requested || shipment.created_at;
    const estDelivery = req.delivery_date_requested;
    const actualDelivery = shipment.actual_delivery_date;

    // Derive progress from status
    let progress = 0;
    switch (status) {
      case 'delivered': progress = 100; break;
      case 'at_destination': progress = 90; break;
      case 'in_transit': progress = 50; break;
      case 'picked_up': progress = 20; break;
      case 'exception': progress = 30; break;
      case 'preparing': default: progress = 5; break;
    }

    // Map cargo_type to a rough shipping method for icon display
    const methodMap = {
      'crude_oil': 'ocean_freight',
      'refined_products': 'ocean_freight',
      'natural_gas': 'ocean_freight',
      'pipes': 'road_transport',
      'drilling_equipment': 'road_transport',
      'chemicals': 'road_transport',
      'general_cargo': 'road_transport',
      'project_cargo': 'ocean_freight',
      'hazardous': 'road_transport',
    };

    // Map urgency to priority
    const priorityMap = {
      'emergency': 'urgent',
      'urgent': 'high',
      'standard': 'medium',
    };

    return {
      id: shipment.id,
      tracking_number: shipment.tracking_number || 'N/A',
      shipment_id: shipment.id,
      status,
      shipping_method: methodMap[req.cargo_type] || 'road_transport',
      origin: req.origin_address || 'N/A',
      destination: req.destination_address || 'N/A',
      carrier: shipment.provider_name || 'Unassigned',
      ship_date: shipDate,
      estimated_delivery: estDelivery,
      actual_delivery: actualDelivery,
      progress_percentage: progress,
      cargo_description: req.title || req.cargo_type || 'Shipment',
      weight: req.weight ? Number(req.weight).toFixed(1) : '0.0',
      value: req.budget_max || req.budget_min || 0,
      priority: priorityMap[req.urgency] || 'medium',
      current_location: shipment.current_location || req.origin_address || 'Origin',
      delays_count: shipment.delays_count || 0,
      total_delay_hours: Number(shipment.total_delay_hours) || 0,
      tracking_events_count: shipment.tracking_events_count || 0,
    };
  };

  const loadTrackingData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const data = await logistics.getShipments();
      const results = data?.results || data || [];
      const normalized = Array.isArray(results) ? results.map(normalizeShipment) : [];
      setShipments(normalized);
      if (showToast) toast.success('Tracking data refreshed');
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadTrackingData();

    // Auto-poll every 30s for live-ish updates
    pollRef.current = setInterval(() => {
      loadTrackingData();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadTrackingData]);

  // Filter tracking data
  const filteredData = shipments.filter(item => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !item.tracking_number.toLowerCase().includes(term) &&
        !item.cargo_description.toLowerCase().includes(term) &&
        !item.origin.toLowerCase().includes(term) &&
        !item.destination.toLowerCase().includes(term) &&
        !item.carrier.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedMethod !== 'all' && item.shipping_method !== selectedMethod) return false;

    if (selectedTimeFrame !== 'all' && item.ship_date) {
      const daysDiff = (new Date() - new Date(item.ship_date)) / (1000 * 60 * 60 * 24);
      if (selectedTimeFrame === 'last_7_days' && daysDiff > 7) return false;
      if (selectedTimeFrame === 'last_30_days' && daysDiff > 30) return false;
      if (selectedTimeFrame === 'last_90_days' && daysDiff > 90) return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-cyan-600 bg-cyan-100';
      case 'at_destination': return 'text-emerald-600 bg-emerald-100';
      case 'exception': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'preparing': default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'picked_up': return 'Picked Up';
      case 'at_destination': return 'At Destination';
      case 'exception': return 'Exception';
      case 'cancelled': return 'Cancelled';
      case 'preparing': default: return 'Preparing';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'ocean_freight': return <Anchor className="w-4 h-4" />;
      case 'air_freight': return <Plane className="w-4 h-4" />;
      case 'road_transport': return <Truck className="w-4 h-4" />;
      case 'rail_transport': return <Train className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getDaysInTransit = (shipDate) => {
    if (!shipDate) return 0;
    const days = Math.floor((new Date() - new Date(shipDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Calculate statistics
  const stats = {
    totalShipments: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit' || s.status === 'picked_up').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    delayed: shipments.filter(s => s.status === 'exception' || s.total_delay_hours > 0).length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsDashboard || '/logistics')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shipment Tracking</h1>
                <p className="text-gray-600 mt-1">
                  Live tracking of your cargo shipments
                  <span className="ml-2 text-xs text-gray-400">(auto-refreshes every 30s)</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadTrackingData(true)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate(webRoutes.logisticsShipmentCreate || '/logistics/shipments/create')}
                className="bg-gold hover:bg-custom_yellow text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tracking number, cargo, carrier..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="preparing">Preparing</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="at_destination">At Destination</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="ocean_freight">Ocean Freight</option>
                <option value="air_freight">Air Freight</option>
                <option value="road_transport">Road Transport</option>
                <option value="rail_transport">Rail Transport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
              <select
                value={selectedTimeFrame}
                onChange={(e) => setSelectedTimeFrame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tracking Cards */}
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {shipments.length === 0 ? 'No Shipments Yet' : 'No Matching Shipments'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {shipments.length === 0
                  ? 'Create a shipment request to start tracking your cargo in real-time.'
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {shipments.length === 0 && (
                <button
                  onClick={() => navigate(webRoutes.logisticsRequestCreate || '/logistics/requests/create')}
                  className="bg-gold hover:bg-custom_yellow text-white px-6 py-2.5 rounded-lg inline-flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Shipment Request
                </button>
              )}
            </div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.tracking_number}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item?.priority)}`}>
                          {item?.shipment?.request_details?.urgency?.toUpperCase()}
                        </span>
                        {item.tracking_events_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.tracking_events_count} events
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{item.cargo_description}</p>
                      <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                        <span className="flex items-center">
                          {getMethodIcon(item.shipping_method)}
                          <span className="ml-1">{item.shipping_method.replace(/_/g, ' ').toUpperCase()}</span>
                        </span>
                        <span>&middot;</span>
                        <span>{item.weight} tons</span>
                        {item.value > 0 && (
                          <>
                            <span>&middot;</span>
                            <span>{formatCurrency(item.value)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {item.status !== 'preparing' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Days in Transit</p>
                          <p className="text-lg font-semibold text-gray-900">{getDaysInTransit(item.ship_date)}</p>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/logistics/shipments/${item.shipment_id}`)}
                        className="flex items-center px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Origin</p>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-green-600" />
                        <span className="line-clamp-2">{item.origin}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Current Location</p>
                      <div className="flex items-start text-sm text-gray-600">
                        <Navigation className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-blue-600" />
                        <span className="line-clamp-2">{item.current_location}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Destination</p>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
                        <span className="line-clamp-2">{item.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{item?.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.status === 'delivered' ? 'bg-green-600' :
                          item.status === 'exception' ? 'bg-red-500' :
                          'bg-gold'
                        }`}
                        style={{ width: `${item?.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">Ship Date:</span>
                      <span className="font-medium">{formatDate(item.ship_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {item.status === 'delivered' ? 'Delivered:' : 'Est. Delivery:'}
                      </span>
                      <span className="font-medium">
                        {item.status === 'delivered' && item.actual_delivery
                          ? formatDate(item.actual_delivery)
                          : formatDate(item.estimated_delivery)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">Carrier:</span>
                      <span className="font-medium">{item.carrier}</span>
                    </div>
                  </div>

                  {item.total_delay_hours > 0 && item.status !== 'delivered' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-2 shrink-0" />
                        <p className="text-sm text-orange-700">
                          Delayed: {item.total_delay_hours} hours ({item.delays_count} incident{item.delays_count !== 1 ? 's' : ''})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results count */}
        {!loading && shipments.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredData.length} of {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsTracking;
