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
  Ship,
  FileText
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import InventoryDashboardWidget from '../../components/dashboard/InventoryDashboardWidget';

const LogisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    shipments: { total: 0, data: [] },
    inventory: { total: 0, data: [] },
    requests: { total: 0, data: [] },
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
      
      console.log('🔍 Loading logistics dashboard data...');
      console.log('🔑 Checking authentication state...');
      
      // Check localStorage for tokens
      const accessToken = localStorage.getItem('access');
      const refreshToken = localStorage.getItem('refresh');
      console.log('📦 LocalStorage tokens:', { 
        hasAccess: !!accessToken, 
        hasRefresh: !!refreshToken,
        accessPreview: accessToken ? accessToken.substring(0, 30) + '...' : null
      });
      
      // Fetch real data from APIs
      console.log('🚀 Making API calls...');
      const [shipmentsResponse, inventoryResponse, requestsResponse] = await Promise.all([
        logisticsAPI.getShipments(),
        logisticsAPI.getInventoryItems(),
        logisticsAPI.getRequests()
      ]);

      console.log('📊 API responses received:', {
        shipments: shipmentsResponse,
        inventory: inventoryResponse,
        requests: requestsResponse
      });

      // Handle paginated responses
      const shipments = shipmentsResponse.data?.results || shipmentsResponse.data || [];
      const inventory = inventoryResponse.data?.results || inventoryResponse.data || [];
      const requests = requestsResponse.data?.results || requestsResponse.data || [];

      console.log('✅ Processed data:', {
        shipmentsCount: shipments.length,
        inventoryCount: inventory.length,
        requestsCount: requests.length
      });

      // Calculate analytics from real data with corrected field mappings
      const totalShipments = shipments.length;
      const deliveredShipments = shipments.filter(s => s.status === 'delivered');
      const onTimeDelivery = deliveredShipments.length > 0 
        ? ((deliveredShipments.length / totalShipments) * 100).toFixed(1)
        : 0;
      
      // Use corrected field mapping: budget_max from request_details
      const totalValue = shipments.reduce((sum, shipment) => {
        const budgetMax = shipment.request_details?.budget_max || 0;
        return sum + parseFloat(budgetMax);
      }, 0);
      const costSavings = totalValue * 0.15; // Estimated 15% savings
      const activeRoutes = shipments.filter(s => ['in_transit', 'picked_up', 'preparing'].includes(s.status)).length;
      
      const monthlyGrowth = 8.5; // This would come from analytics service

      setDashboardData({
        shipments: {
          total: totalShipments,
          data: shipments
        },
        inventory: {
          total: inventory.length,
          data: inventory
        },
        requests: {
          total: requests.length,
          data: requests
        },
        analytics: {
          totalShipments,
          onTimeDelivery: parseFloat(onTimeDelivery),
          costSavings,
          activeRoutes,
          monthlyGrowth: 8.5, // This would come from analytics service
          totalValue
        }
      });
    } catch (error) {
      console.error('❌ Failed to load logistics data:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.message?.includes('Authentication required')) {
        console.log('🔐 Authentication error detected - user needs to login');
        console.log('🔑 Current tokens:', {
          access: localStorage.getItem('access') ? 'present' : 'missing',
          refresh: localStorage.getItem('refresh') ? 'present' : 'missing'
        });
        // The makeApiRequest will already redirect to login, but we can add additional handling here
        return; // Don't set empty data if redirecting to login
      }
      
      // Initialize with empty data when API calls fail
      setDashboardData({
        shipments: { total: 0, data: [] },
        inventory: { total: 0, data: [] },
        requests: { total: 0, data: [] },
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
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
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
                { key: 'requests', label: 'Shipment Requests', icon: FileText },
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
                  {/* Recent Shipments - CORRECTED FIELD MAPPINGS */}
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
                                <p className="font-medium text-gray-900">{shipment.tracking_number || `SHIP-${shipment.id?.slice(0,8)}`}</p>
                                <p className="text-sm text-gray-600">
                                  {shipment.request_details?.origin_address} → {shipment.request_details?.destination_address}
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

                  {/* Inventory Alerts - CORRECTED FIELD MAPPINGS */}
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
                        .filter(item => item.current_stock <= (item.reorder_point || item.minimum_stock))
                        .slice(0, 5)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.warehouse || item.location || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-orange-600">
                                {item.current_stock} remaining
                              </p>
                              <p className="text-xs text-gray-500">
                                Reorder at {item.reorder_point || item.minimum_stock}
                              </p>
                            </div>
                          </div>
                        ))}
                      {dashboardData.inventory.data.filter(item => item.current_stock <= (item.reorder_point || item.minimum_stock)).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          No low stock alerts
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Requests Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Requests */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Shipment Requests</h3>
                      <Link 
                        to={webRoutes.logisticsRequests}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.requests.data.length > 0 ? (
                        dashboardData.requests.data.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">REQ-{request.id?.slice(0,8)}</p>
                                <p className="text-sm text-gray-600">
                                  {request.origin_address} → {request.destination_address}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  request.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                                  request.status === 'awarded' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {request.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                ${request.budget_max || 'No budget'}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p>No recent shipment requests</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Statistics */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Shipment Request Statistics</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Shipment Requests</span>
                          <span className="text-lg font-semibold text-gray-900">{dashboardData.requests.total}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Quotes</span>
                          <span className="text-lg font-semibold text-yellow-700">
                            {dashboardData.requests.data.filter(r => r.status === 'pending').length}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quoted</span>
                          <span className="text-lg font-semibold text-blue-700">
                            {dashboardData.requests.data.filter(r => r.status === 'quoted').length}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Awarded</span>
                          <span className="text-lg font-semibold text-green-700">
                            {dashboardData.requests.data.filter(r => r.status === 'awarded').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Inventory Dashboard Widget */}
                <InventoryDashboardWidget className="col-span-full" />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                  <Link
                    to={webRoutes.logisticsRequests}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
                  >
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-gray-400 group-hover:text-orange-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">View Requests</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage shipping requests</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Shipment Requests</h3>
                  <div className="flex space-x-2">
                    <Link
                      to={webRoutes.logisticsShipmentCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Shipment Request</span>
                    </Link>
                    <Link
                      to={webRoutes.logisticsRequests}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View All</span>
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {dashboardData.requests.data.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Request ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Route</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Cargo Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.requests.data.slice(0, 10).map((request) => (
                          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <Link 
                                to={webRoutes.logisticsShipmentDetail.replace(':id', request.id)}
                                className="font-medium text-blue-600 hover:text-blue-700"
                              >
                                REQ-{request.id?.slice(0,8)}
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-medium text-gray-900">{request.title}</p>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm text-gray-900">{request.origin_address}</p>
                                <p className="text-sm text-gray-500">→ {request.destination_address}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                {request.cargo_type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  request.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                                  request.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                                  request.status === 'awarded' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                ${request.budget_min} - ${request.budget_max}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-900">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Link
                                  to={webRoutes.logisticsShipmentDetail.replace(':id', request.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No shipment requests found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new shipment request.</p>
                      <div className="mt-6">
                        <Link
                          to={webRoutes.logisticsShipmentCreate}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Shipment Request
                        </Link>
                      </div>
                    </div>
                  )}
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
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
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
                                {shipment.tracking_number || `SHIP-${shipment.id?.slice(0,8)}`}
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{shipment.request_details?.origin_address}</p>
                                <p className="text-sm text-gray-600">→ {shipment.request_details?.destination_address}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{shipment.request_details?.cargo_type?.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-600">{shipment.request_details?.weight} kg</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shipment.status)}`}>
                                {shipment.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {shipment.request_details?.delivery_date_requested ? new Date(shipment.request_details.delivery_date_requested).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {shipment.request_details?.budget_max ? formatCurrency(shipment.request_details.budget_max) : 'N/A'}
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
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                            {item.category?.name || item.category || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Available:</span>
                            <span className={`font-medium ${item.current_stock <= (item.reorder_point || item.minimum_stock) ? 'text-orange-600' : 'text-gray-900'}`}>
                              {item.current_stock} {item.unit}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min Stock:</span>
                            <span className="text-gray-900">{item.minimum_stock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900">{item.warehouse || item.location || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Cost:</span>
                            <span className="text-gray-900">${item.unit_cost}</span>
                          </div>
                        </div>

                        {item.current_stock <= (item.reorder_point || item.minimum_stock) && (
                          <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-700">
                            ⚠️ Below reorder level ({item.reorder_point || item.minimum_stock})
                          </div>
                        )}

                        <div className="mt-3 flex space-x-2">
                          <Link
                            to={webRoutes.logisticsInventoryDetail.replace(':id', item.id)}
                            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
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
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
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
