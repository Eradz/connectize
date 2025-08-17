import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Truck,
  Ship,
  Plane,
  Package,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Eye,
  Edit,
  MoreHorizontal,
  Globe
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';

const LogisticsShipments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [ordering, setOrdering] = useState('-created_at');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadShipments();
  }, [currentPage, statusFilter, searchTerm, ordering]);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, methodFilter, dateRange]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        ordering
      };

      const response = await logisticsAPI.getShipments(params);
      // api.get returns { data }, DRF pagination returns { results, count }
      const data = response?.data ?? response;
      const list = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      setShipments(list);
      setTotalCount(typeof data?.count === 'number' ? data.count : list.length);
      
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast.error('Failed to load shipments');
      // Initialize with empty data instead of mock data
      setShipments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEditShipment = (shipmentId) => {
    // Navigate to shipment edit page
    navigate(webRoutes.logisticsShipmentEdit.replace(':id', shipmentId));
  };

  const filterShipments = () => {
    // Ensure shipments is always an array
    if (!Array.isArray(shipments)) {
      setFilteredShipments([]);
      return;
    }

  // Work on a copy to avoid accidental mutation
  let filtered = Array.isArray(shipments) ? [...shipments] : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        (shipment.tracking_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.request_details?.origin_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.request_details?.destination_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.request_details?.cargo_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.provider_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    // Method filter - map to transport types
    if (methodFilter !== 'all') {
      filtered = filtered.filter(shipment => 
        (shipment.provider_name || '').toLowerCase().includes(methodFilter.toLowerCase()) ||
        (shipment.request_details?.cargo_type || '').toLowerCase().includes(methodFilter.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const daysAgo = {
        'today': 1,
        'week': 7,
        'month': 30,
        'quarter': 90
      }[dateRange];
      
      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(shipment => 
          new Date(shipment.created_at) >= cutoffDate
        );
      }
    }

    setFilteredShipments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
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
      case 'cancelled': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Ocean Freight': return <Ship className="w-4 h-4" />;
      case 'Air Freight': return <Plane className="w-4 h-4" />;
      case 'Road Transport': return <Truck className="w-4 h-4" />;
      case 'Rail Transport': return <Truck className="w-4 h-4" />;
      case 'Multimodal': return <Globe className="w-4 h-4" />;
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

  const getDateDifference = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your cargo shipments globally
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <Link
                to={webRoutes.logisticsShipmentCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number, origin, destination, cargo type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="Ocean Freight">Ocean Freight</option>
                <option value="Air Freight">Air Freight</option>
                <option value="Road Transport">Road Transport</option>
                <option value="Rail Transport">Rail Transport</option>
                <option value="Multimodal">Multimodal</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredShipments.length} of {Array.isArray(shipments) ? shipments.length : 0} shipments</span>
            <div className="flex items-center space-x-4">
              <span>Sort by:</span>
              <select 
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="-created_at">Most Recent</option>
                <option value="created_at">Oldest First</option>
                <option value="status">Status</option>
                <option value="-value">Value (High to Low)</option>
                <option value="value">Value (Low to High)</option>
                <option value="estimated_delivery">Delivery Date</option>
                <option value="-estimated_delivery">Delivery Date (Desc)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(shipments) ? shipments.length : 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(shipments) ? shipments.filter(s => s.status === 'in_transit').length : 0}
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
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(shipments) ? shipments.filter(s => s.status === 'delivered').length : 0}
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    (Array.isArray(shipments) ? shipments : []).reduce((sum, s) => {
                      const budgetMax = s?.request_details?.budget_max;
                      const value = budgetMax ? parseFloat(budgetMax) : 0;
                      return sum + (isNaN(value) ? 0 : value);
                    }, 0)
                  )}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first shipment'}
              </p>
              {!(searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all') && (
                <div className="mt-6">
                  <Link
                    to={webRoutes.logisticsShipmentCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Shipment
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Tracking #</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Route</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Cargo</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Method</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Delivery</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Value</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(Array.isArray(filteredShipments) ? filteredShipments : []).map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <Link 
                            to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {shipment.tracking_number}
                          </Link>
                          <p className="text-sm text-gray-500">{shipment.provider_name || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{shipment.request_details?.origin_address || 'N/A'}</p>
                              <div className="flex items-center text-gray-500">
                                <ArrowRight className="w-3 h-3 mx-1" />
                                <span>{shipment.request_details?.destination_address || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{shipment.request_details?.cargo_type?.replace('_', ' ')?.toUpperCase() || 'N/A'}</p>
                            <p className="text-gray-500">{shipment.request_details?.weight ? `${shipment.request_details.weight} kg` : 'N/A'}</p>
                          </div>
                          {shipment.dangerous_goods && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                              DG
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(shipment.provider_name || 'General')}
                            <span className="text-sm text-gray-900">{shipment.provider_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1">{shipment.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {shipment.request_details?.delivery_date_requested ? 
                                new Date(shipment.request_details.delivery_date_requested).toLocaleDateString() : 
                                'N/A'
                              }
                            </p>
                            <p className="text-gray-500">
                              {shipment.request_details?.delivery_date_requested ?
                                getDateDifference(shipment.request_details.delivery_date_requested) :
                                'N/A'
                              }
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">
                            {shipment.request_details?.budget_max ? 
                              formatCurrency(parseFloat(shipment.request_details.budget_max)) : 
                              'N/A'
                            }
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            shipment.request_details?.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                            shipment.request_details?.urgency === 'standard' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {shipment.request_details?.urgency || 'standard'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleEditShipment(shipment.id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Edit Shipment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-700 p-1">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {(Array.isArray(filteredShipments) ? filteredShipments : []).map((shipment) => (
                  <div key={shipment.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Link 
                        to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {shipment.tracking_number}
                      </Link>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(shipment.status)}`}>
                        {getStatusIcon(shipment.status)}
                        <span className="ml-1">{shipment.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="text-gray-900">
                          {shipment.request_details?.origin_address || 'N/A'} → {shipment.request_details?.destination_address || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cargo:</span>
                        <span className="text-gray-900">
                          {shipment.request_details?.cargo_type?.replace('_', ' ')?.toUpperCase() || 'N/A'} ({shipment.request_details?.weight ? `${shipment.request_details.weight} kg` : 'N/A'})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Method:</span>
                        <div className="flex items-center space-x-1">
                          {getMethodIcon(shipment.provider_name || 'General')}
                          <span className="text-gray-900">{shipment.provider_name || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="text-gray-900">
                          {shipment.request_details?.delivery_date_requested ? 
                            new Date(shipment.request_details.delivery_date_requested).toLocaleDateString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium text-gray-900">
                          {shipment.request_details?.budget_max ? 
                            formatCurrency(parseFloat(shipment.request_details.budget_max)) : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{shipment.provider_name || 'N/A'}</span>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={webRoutes.logisticsShipmentDetail.replace(':id', shipment.id)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleEditShipment(shipment.id)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Edit Shipment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalCount > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                .filter(pageNum => 
                  pageNum === 1 || 
                  pageNum === Math.ceil(totalCount / itemsPerPage) ||
                  Math.abs(pageNum - currentPage) <= 1
                )
                .map((pageNum, index, array) => (
                  <React.Fragment key={pageNum}>
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))
              }
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsShipments;
