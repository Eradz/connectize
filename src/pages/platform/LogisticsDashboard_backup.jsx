import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck,
  Package,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Eye,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Globe,
  Warehouse,
  Ship
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsShipmentService, logisticsInventoryService } from '../../api-services/oilgas';
import InventoryDashboardWidget from '../../components/dashboard/InventoryDashboardWidget';

const LogisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    shipments: { total: 0, data: [] },
    inventory: { total: 0, data: [] },
    analytics: {
      totalShipments: 0,
      onTimeDelivery: 0,
      costSavings: 0,
      activeRoutes: 0
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from APIs
      const [shipmentsResponse, inventoryResponse] = await Promise.all([
        logisticsShipmentService.getAll(),
        logisticsInventoryService.getAll()
      ]);

      // Calculate analytics from real data
      const totalShipments = shipmentsResponse.length;
      const deliveredShipments = shipmentsResponse.filter(s => s.status === 'delivered');
      const onTimeDelivery = deliveredShipments.length > 0 
        ? ((deliveredShipments.length / totalShipments) * 100).toFixed(1)
        : 0;
      
      const totalValue = shipmentsResponse.reduce((sum, shipment) => sum + (parseFloat(shipment.value) || 0), 0);
      const costSavings = totalValue * 0.15; // Estimated 15% savings
      const activeRoutes = shipmentsResponse.filter(s => ['in_transit', 'picked_up'].includes(s.status)).length;
      
      const monthlyGrowth = 8.5; // This would come from analytics service

      setDashboardData({
        shipments: {
          total: totalShipments,
          data: shipmentsResponse
        },
        inventory: {
          total: inventoryResponse.length,
          data: inventoryResponse
        },
        analytics: {
          totalShipments,
          onTimeDelivery: parseFloat(onTimeDelivery),
          costSavings,
          activeRoutes,
          monthlyGrowth,
          totalValue
        }
      });
    } catch (error) {
      console.error('Failed to load logistics data:', error);
      // Initialize with empty data instead of mock data
      setDashboardData({
        shipments: { total: 0, data: [] },
        inventory: { total: 0, data: [] },
        analytics: {
          totalShipments: 0,
          onTimeDelivery: 0,
          costSavings: 0,
          activeRoutes: 0,
          monthlyGrowth: 0,
          totalValue: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logistics Hub</h1>
              <p className="text-gray-600 mt-1">Global supply chain & shipment management</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.logisticsShipmentCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Link>
              <button
                onClick={loadDashboardData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.totalShipments}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{dashboardData.analytics.monthlyGrowth}% this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.onTimeDelivery}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Above target
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.analytics.costSavings)}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  YTD savings
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.activeRoutes}</p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Globe className="w-4 h-4 mr-1" />
                  Global network
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'shipments', label: 'Shipments', icon: Truck },
                { key: 'inventory', label: 'Inventory', icon: Package },
                { key: 'tracking', label: 'Live Tracking', icon: MapPin }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Shipments */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
                      <Link 
                        to={webRoutes.logisticsShipments}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.shipments.data.length > 0 ? (
                        dashboardData.shipments.data.slice(0, 5).map((shipment) => (
                          <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(shipment.status)}`}>
                                {getStatusIcon(shipment.status)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                                <p className="text-sm text-gray-600">
                                  {shipment.origin_address || shipment.origin} → {shipment.destination_address || shipment.destination}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shipment.status)}`}>
                                {shipment.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Truck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p>No recent shipments</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                      <Link 
                        to={webRoutes.logisticsInventory}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.inventory.data
                        .filter(item => item.current_stock <= item.reorder_point)
                        .slice(0, 5)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.location || item.warehouse}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-orange-600">
                                {item.current_stock} remaining
                              </p>
                              <p className="text-xs text-gray-500">
                                Reorder at {item.reorder_point}
                              </p>
                            </div>
                          </div>
                        ))}
                      {dashboardData.inventory.data.filter(item => item.current_stock <= item.reorder_point).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          No low stock alerts
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Inventory Dashboard Widget */}
                <InventoryDashboardWidget className="col-span-full" />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to={webRoutes.logisticsShipmentCreate}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="text-center">
                      <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Create Shipment</h3>
                      <p className="mt-1 text-sm text-gray-500">Schedule new cargo shipment</p>
                    </div>
                  </Link>

                  <Link
                    to={webRoutes.logisticsInventory}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
                  >
                    <div className="text-center">
                      <Warehouse className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Inventory</h3>
                      <p className="mt-1 text-sm text-gray-500">Update stock levels</p>
                    </div>
                  </Link>

                  <Link
                    to={webRoutes.logisticsTracking}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="text-center">
                      <MapPin className="mx-auto h-8 w-8 text-gray-400 group-hover:text-purple-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Track Shipments</h3>
                      <p className="mt-1 text-sm text-gray-500">Real-time location tracking</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'shipments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Shipments</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search shipments..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {dashboardData.shipments.data.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Tracking #</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Route</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Cargo</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">ETA</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.shipments.data.map((shipment) => (
                          <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <Link 
                                to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                                className="font-medium text-blue-600 hover:text-blue-700"
                              >
                                {shipment.tracking_number}
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{shipment.origin_address || shipment.origin}</p>
                                <p className="text-sm text-gray-600">→ {shipment.destination_address || shipment.destination}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{shipment.cargo_type}</p>
                                <p className="text-sm text-gray-600">{shipment.weight} tons</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shipment.status)}`}>
                                {shipment.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {shipment.value ? formatCurrency(shipment.value) : 'N/A'}
                            </td>
                            <td className="py-4 px-4">
                              <Link
                                to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Shipments</h3>
                      <p className="text-gray-500 mb-4">You haven't created any shipments yet</p>
                      <Link
                        to={webRoutes.logisticsShipmentCreate}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Shipment
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search inventory..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.inventory.data.length > 0 ? (
                    dashboardData.inventory.data.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Available:</span>
                            <span className={`font-medium ${item.current_stock <= item.reorder_point ? 'text-orange-600' : 'text-gray-900'}`}>
                              {item.current_stock}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min Stock:</span>
                            <span className="text-gray-900">{item.minimum_stock}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900">{item.location || item.warehouse || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Cost:</span>
                            <span className="text-gray-900">${item.unit_cost}</span>
                          </div>
                        </div>

                        {item.current_stock <= item.reorder_point && (
                          <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-700">
                            ⚠️ Below reorder level ({item.reorder_point})
                          </div>
                        )}

                        <div className="mt-3 flex space-x-2">
                          <Link
                            to={webRoutes.logisticsInventoryDetail.replace(':id', item.id)}
                            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-custom_yellow"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No inventory items found</p>
                      <p className="text-sm">Add inventory items to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="text-center py-12">
                <Ship className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Live Tracking</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time shipment tracking will be displayed here
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-custom_yellow">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Map
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
