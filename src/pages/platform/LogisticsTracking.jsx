import React, { useState, useEffect } from 'react';
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
  Filter,
  RefreshCw,
  Eye,
  Plus,
  Navigation,
  Anchor,
  Plane,
  Train
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsTrackingService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const LogisticsTracking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');

  // Generate comprehensive mock tracking data
  const generateMockTrackingData = () => {
    const statuses = ['in_transit', 'delivered', 'delayed', 'pending_pickup', 'customs_clearance', 'exception'];
    const methods = ['ocean_freight', 'air_freight', 'road_transport', 'rail_transport'];
    const origins = ['Houston, TX', 'Aberdeen, UK', 'Singapore', 'Dubai, UAE', 'Rio de Janeiro, Brazil', 'Calgary, Canada'];
    const destinations = ['North Sea Platform A', 'Gulf of Mexico Rig 7', 'Brazil Offshore Site', 'Norway Facility', 'Qatar Terminal', 'Angola Platform'];
    const carriers = ['Global Marine Transport', 'Sky Cargo Express', 'Ocean Logistics Co', 'FastTrack Shipping', 'International Freight'];

    const shipments = Array.from({ length: 25 }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const origin = origins[Math.floor(Math.random() * origins.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      
      const shipDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const estimatedDelivery = new Date(shipDate.getTime() + (Math.random() * 21 + 3) * 24 * 60 * 60 * 1000);
      const actualDelivery = status === 'delivered' ? 
        new Date(shipDate.getTime() + (Math.random() * 18 + 3) * 24 * 60 * 60 * 1000) : null;

      // Generate realistic tracking events
      const events = [];
      const baseTime = shipDate.getTime();
      
      events.push({
        timestamp: new Date(baseTime).toISOString(),
        location: origin,
        description: 'Shipment picked up from origin',
        status: 'pickup',
        coordinates: { lat: 29.7604 + Math.random() * 10, lng: -95.3698 + Math.random() * 10 }
      });

      if (method === 'ocean_freight') {
        events.push({
          timestamp: new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Port of Houston',
          description: 'Container loaded onto vessel',
          status: 'loaded',
          coordinates: { lat: 29.7604, lng: -95.3698 }
        });
        
        events.push({
          timestamp: new Date(baseTime + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Gulf of Mexico',
          description: 'Vessel departed port',
          status: 'departed',
          coordinates: { lat: 28.5, lng: -90.0 }
        });
      }

      if (status === 'customs_clearance') {
        events.push({
          timestamp: new Date(baseTime + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'International Port',
          description: 'Shipment held for customs inspection',
          status: 'customs',
          coordinates: { lat: 25.2048, lng: 55.2708 }
        });
      }

      if (status === 'in_transit') {
        events.push({
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          location: 'En Route',
          description: 'Shipment in transit to destination',
          status: 'in_transit',
          coordinates: { lat: 30 + Math.random() * 20, lng: -80 + Math.random() * 40 }
        });
      }

      if (status === 'delivered') {
        events.push({
          timestamp: actualDelivery.toISOString(),
          location: destination,
          description: 'Shipment delivered successfully',
          status: 'delivered',
          coordinates: { lat: 60 + Math.random() * 10, lng: 5 + Math.random() * 10 }
        });
      }

      // Calculate progress percentage
      let progress = 0;
      if (status === 'delivered') progress = 100;
      else if (status === 'in_transit') progress = 30 + Math.random() * 50;
      else if (status === 'customs_clearance') progress = 60 + Math.random() * 20;
      else if (status === 'delayed') progress = 20 + Math.random() * 40;
      else if (status === 'pending_pickup') progress = 0;
      else if (status === 'exception') progress = Math.random() * 80;

      return {
        id: `TRK${String(index + 1).padStart(6, '0')}`,
        tracking_number: `TRK${Date.now().toString().slice(-6)}${index}`,
        shipment_id: `SHP-${String(index + 1).padStart(3, '0')}`,
        status,
        shipping_method: method,
        origin,
        destination,
        carrier,
        ship_date: shipDate.toISOString(),
        estimated_delivery: estimatedDelivery.toISOString(),
        actual_delivery: actualDelivery?.toISOString() || null,
        progress_percentage: Math.round(progress),
        events: events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        cargo_description: [
          'Drilling Equipment Package',
          'Safety Supply Kit',
          'Maintenance Tools Set',
          'Technical Components',
          'Emergency Supplies',
          'Chemical Materials',
          'Spare Parts Package',
          'Instrumentation Kit'
        ][Math.floor(Math.random() * 8)],
        weight: (Math.random() * 50 + 5).toFixed(1),
        value: Math.floor(Math.random() * 500000) + 50000,
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        service_type: ['standard', 'express', 'priority', 'next_day'][Math.floor(Math.random() * 4)],
        current_location: events[events.length - 1]?.location || origin,
        next_milestone: status === 'delivered' ? 'Completed' : [
          'Port Arrival', 'Customs Clearance', 'Final Transit', 'Delivery'
        ][Math.floor(Math.random() * 4)],
        estimated_delay: status === 'delayed' ? Math.floor(Math.random() * 72) + 24 : 0
      };
    });

    return shipments;
  };

  const [trackingData, setTrackingData] = useState([]);

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await logisticsTrackingService.getTrackingData();
        setTrackingData(data);
      } catch (error) {
        // Use mock data for demo
        console.warn('API call failed, using mock data:', error.message);
        const mockData = generateMockTrackingData();
        setTrackingData(mockData);
      }
      
    } catch (error) {
      toast.error('Failed to load tracking data');
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tracking data
  const filteredData = trackingData.filter(item => {
    if (searchTerm && !item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.cargo_description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.origin.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.destination.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    if (selectedMethod !== 'all' && item.shipping_method !== selectedMethod) {
      return false;
    }
    if (selectedTimeFrame !== 'all') {
      const shipDate = new Date(item.ship_date);
      const now = new Date();
      const daysDiff = (now - shipDate) / (1000 * 60 * 60 * 24);
      
      switch (selectedTimeFrame) {
        case 'last_7_days':
          if (daysDiff > 7) return false;
          break;
        case 'last_30_days':
          if (daysDiff > 30) return false;
          break;
        case 'last_90_days':
          if (daysDiff > 90) return false;
          break;
      }
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'delayed': return 'text-orange-600 bg-orange-100';
      case 'pending_pickup': return 'text-gray-600 bg-gray-100';
      case 'customs_clearance': return 'text-purple-600 bg-purple-100';
      case 'exception': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getDaysInTransit = (shipDate) => {
    const days = Math.floor((new Date() - new Date(shipDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Calculate statistics
  const stats = {
    totalShipments: trackingData.length,
    inTransit: trackingData.filter(item => item.status === 'in_transit').length,
    delivered: trackingData.filter(item => item.status === 'delivered').length,
    delayed: trackingData.filter(item => item.status === 'delayed' || item.status === 'exception').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logistics)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shipment Tracking</h1>
                <p className="text-gray-600 mt-1">Real-time tracking of your cargo shipments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadTrackingData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate(webRoutes.logisticsShipmentCreate)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
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
                  placeholder="Tracking number, cargo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="pending_pickup">Pending Pickup</option>
                <option value="customs_clearance">Customs Clearance</option>
                <option value="exception">Exception</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.tracking_number}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{item.cargo_description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        {getMethodIcon(item.shipping_method)}
                        <span className="ml-1 mr-4">{item.shipping_method.replace('_', ' ').toUpperCase()}</span>
                        <span className="mr-4">{item.weight} tons</span>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Days in Transit</p>
                        <p className="text-lg font-semibold text-gray-900">{getDaysInTransit(item.ship_date)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`${webRoutes.logisticsShipments}/${item.shipment_id}`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Origin</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-green-600" />
                        {item.origin}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Current Location</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Navigation className="w-4 h-4 mr-1 text-blue-600" />
                        {item.current_location}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Destination</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-red-600" />
                        {item.destination}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{item.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.status === 'delivered' ? 'bg-green-600' :
                          item.status === 'delayed' || item.status === 'exception' ? 'bg-orange-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: `${item.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Ship Date</p>
                      <p className="font-medium">{formatDate(item.ship_date)}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">
                        {item.status === 'delivered' ? 'Delivered' : 'Est. Delivery'}
                      </p>
                      <p className="font-medium">
                        {item.status === 'delivered' && item.actual_delivery ? 
                          formatDate(item.actual_delivery) : 
                          formatDate(item.estimated_delivery)
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Carrier</p>
                      <p className="font-medium">{item.carrier}</p>
                    </div>
                  </div>

                  {item.estimated_delay > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                        <p className="text-sm text-orange-700">
                          Estimated delay: {item.estimated_delay} hours
                        </p>
                      </div>
                    </div>
                  )}

                  {item.next_milestone && item.status !== 'delivered' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-700">
                          Next milestone: {item.next_milestone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No shipments found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsTracking;
