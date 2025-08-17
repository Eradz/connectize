import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';

const LogisticsRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getRequests();
      const requestData = response?.data || response?.results || response || [];
      setRequests(Array.isArray(requestData) ? requestData : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load shipment requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-500" />;
      case 'posted': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'quoted': return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case 'awarded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cargo_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipment Requests</h1>
              <p className="text-gray-600 mt-1">Manage your logistics requests and quotes</p>
            </div>
            <button
              onClick={() => navigate(webRoutes.logisticsRequestCreate)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="quoted">Quoted</option>
                <option value="awarded">Awarded</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shipment requests found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.' 
                  : 'Get started by creating your first shipment request.'}
              </p>
              <button
                onClick={() => navigate(webRoutes.logisticsRequestCreate)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Request</span>
              </button>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.title || `${request.cargo_type} Shipment`}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusBadgeClass(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span>{getStatusLabel(request.status)}</span>
                        </div>
                        {request.quotes_count > 0 && (
                          <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {request.quotes_count} Quote{request.quotes_count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {request.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`${webRoutes.logisticsRequests}/${request.id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(request.status === 'draft' || request.status === 'posted') && (
                        <button
                          onClick={() => navigate(`${webRoutes.logisticsRequests}/${request.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Request"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Origin & Destination */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="truncate">{request.origin_address || 'Origin not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="truncate">{request.destination_address || 'Destination not specified'}</span>
                    </div>

                    {/* Pickup Date */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Pickup: {formatDate(request.pickup_date_requested)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Cargo Info */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{request.cargo_type?.replace('_', ' ') || 'General Cargo'}</span>
                    </div>

                    {/* Weight & Volume */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>{request.weight || 0}t, {request.volume || 0}m³</span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {request.budget_min && request.budget_max 
                          ? `${formatCurrency(request.budget_min, request.currency)} - ${formatCurrency(request.budget_max, request.currency)}`
                          : request.budget_max 
                            ? `Up to ${formatCurrency(request.budget_max, request.currency)}`
                            : 'Budget not specified'}
                      </span>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{request.origin_contact_name || 'Contact not specified'}</span>
                    </div>
                  </div>

                  {/* Delivery Date & Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Delivery: {formatDate(request.delivery_date_requested)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsRequestList;
