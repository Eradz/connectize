import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Award,
  Clock
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import { webRoutes } from '../../lib/webRoutes';

const LogisticsRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading requests...');
      console.log('📋 Session storage:', localStorage.getItem('connectize_session'));
      
      const response = await logisticsAPI.getRequests();
      console.log('📋 Raw API response:', response);
      
      const data = response?.data ?? response;
      console.log('📋 Extracted data:', data);
      
      // Handle different response structures
      const requestsList = Array.isArray(data?.results) 
        ? data.results 
        : Array.isArray(data) 
        ? data 
        : [];
        
      console.log('📋 Final requests list:', requestsList);
      console.log('📋 Number of requests:', requestsList.length);
      setRequests(requestsList);
    } catch (error) {
      console.error('❌ Failed to load requests:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount == null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
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
    const term = searchTerm.trim().toLowerCase();
    const idStr = typeof request.id === 'string' ? request.id.toLowerCase() : '';
    const cargo = request.cargo_type?.toLowerCase?.() || '';
    const origin = request.origin_address?.toLowerCase?.() || '';
    const destination = request.destination_address?.toLowerCase?.() || '';
    const matchesSearch = term === '' ||
      idStr.includes(term) || cargo.includes(term) || origin.includes(term) || destination.includes(term);

    const matchesStatus = statusFilter === 'all' || (request.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (requestId) => {
    navigate(`${webRoutes.logisticsRequests}/${requestId}`);
  };

  const handleAwardRequest = (requestId) => {
    // Navigate to awarding interface on the request detail page
    navigate(`${webRoutes.logisticsRequests}/${requestId}?action=award`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Requests</h1>
          <p className="text-gray-600">Manage your logistics requests and quotes</p>
        </div>
        <Link
          to={webRoutes.logisticsShipmentCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="quoted">Quoted</option>
          <option value="awarded">Awarded</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipment requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first shipment request to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to={webRoutes.logisticsShipmentCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Shipment Request
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        Request #{request.id?.slice(0, 8)}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status || 'pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{request.cargo_type || 'General Cargo'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{request.origin_address || 'Origin'} → {request.destination_address || 'Destination'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.pickup_date_requested)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {request.budget_min != null || request.budget_max != null
                            ? `${request.budget_min != null ? formatCurrency(Number(request.budget_min), request.currency || 'USD') : '—'}
                               – ${request.budget_max != null ? formatCurrency(Number(request.budget_max), request.currency || 'USD') : '—'}`
                            : 'Budget N/A'}
                        </span>
                      </div>
                    </div>

                    {request.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => handleViewRequest(request.id)}
                      className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {['posted', 'quoted', 'draft'].includes((request.status || '').toLowerCase()) && (
                      <button
                        onClick={() => handleAwardRequest(request.id)}
                        className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Award className="w-4 h-4 mr-1" />
                        Award
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsRequests;
