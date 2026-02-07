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
  Eye,
  Edit,
  Pen
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';
import { getSession } from '../../lib/session';
import { useAuth } from '../../context/userContext';
import { DocumentIcon } from '../../components/ui/ModernIcon';
import BackArrowButton from '../../components/BackArrowButton';

const LogisticsRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMineOnly, setShowMineOnly] = useState(false);
  const { user } = useAuth();
  const session = getSession();
  const userId = user?.id ?? session?.user?.id;

  useEffect(() => {
    fetchRequests();
  }, [showMineOnly, statusFilter, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getRequests({
        mine: showMineOnly ? 'true' : undefined,
        status: statusFilter,
        search: searchTerm || undefined,
      });
      
      
      // Handle paginated and non-paginated responses
      const data = response?.data ?? response;
      const requestsList = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
          
      console.log('📋 Processed requests:', requestsList.length, requestsList.map(r => ({
        id: r.id,
        requested_by: r.requested_by,
        status: r.status,
        title: r.title
      })));
      
      setRequests(requestsList);
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
      case 'posted': return 'bg-green-200 text-green-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-900';
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
    const isOwner = userId != null && String(request.requested_by) === String(userId);
    const matchesSearch = !searchTerm || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cargo_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    // When "My Requests" is selected, the API already filters by owner.
    // Avoid client-side owner filtering to prevent hiding results when userId isn't loaded yet.
    const matchesOwner = true;
    
    return matchesSearch && matchesStatus && matchesOwner;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!userId && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm">
            You're viewing public requests. Log in again to see "My Requests". If you just logged in, wait a moment and refresh.
          </div>
        </div>
      )}
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className='flex items-center'>
            <BackArrowButton className={"md:w-fit w-fit"} />
            <div className='ml-2 md:ml-0'>
              <h1 className="text-2xl font-bold text-gray-900">Shipment Requests</h1>
              <p className="text-gray-600 mt-1">Manage your marketplace orders</p>
            </div>
          </div>
            <button
              onClick={() => navigate(webRoutes.logisticsRequestCreate)}
              className="w-fit ml-[56%] md:ml-0 bg-custom_yellow px-4 py-2 rounded-lg hover:bg-yellow-500 flex items-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className='text-[12px] md:text-base'>New Request</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 bg-white space-y-4">
        {/* Filters */}
        <div className="">
          <div className="w-full flex flex-col md:flex-row gap-3 items-center">
            <div className="flex items-center space-x-2 w-full md:w-[70%]">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  />
                </div>
              </div>
              {/* <Filter className="w-4 h-4 text-gray-500" /> */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="quoted">Quoted</option>
                <option value="awarded">Awarded</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center w-full md:w-[30%]">
              <div className="bg-gray-100 rounded-lg p-1 flex w-full">
                <button
                  onClick={() => setShowMineOnly(false)}
                  className={`w-[50%] px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!showMineOnly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Requests
                </button>
                <button
                  onClick={() => setShowMineOnly(true)}
                  className={`w-[50%] px-3 py-1.5 rounded-md text-sm font-medium transition-all ${showMineOnly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  My Requests
                </button>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-medium text-gray-900">{showMineOnly ? 'My Requests' : 'All Requests'}</h1>

        {/* Request Grid */}
        {filteredRequests.length === 0 ? (
          <div className=" rounded-lg shadow-sm border p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipment requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'Get started by creating your first shipment request.'}
            </p>
            <button
              onClick={() => navigate(webRoutes.logisticsRequestCreate)}
              className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-yellow-500 inline-flex items-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Request</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5 capitalize">
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between mb-2 border-b border-gray-200 pb-3">
                    <div className="flex-1 pr-3">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {request.title || `Marketplace Order #ORD-${request.id}`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {`${request.description}` || 'No description provided'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(webRoutes.logisticsRequestEdit.replace(':id', request.id))}
                      className="flex items-center bg-pale_yellow p-2 hover:bg-gold rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pen className="w-4 h-4" />
                      {/* <span>Edit</span> */}
                    </button>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${getStatusBadgeClass(request.status)}`}>
                      <span>{getStatusLabel(request.status)}</span>
                    </div>
                    {request.quotes_count > 0 && (
                      <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                        {request.quotes_count} Quote{request.quotes_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Location Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{request.destination_address || 'Destination not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{request.cargo_type?.replace('_', ' ') || 'General Cargo'}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>
                        {request.budget_min && request.budget_max 
                          ? `${formatCurrency(request.budget_min, request.currency)} - ${formatCurrency(request.budget_max, request.currency)}`
                          : request.budget_max 
                            ? `Up to ${formatCurrency(request.budget_max, request.currency)}`
                            : 'Budget not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Cargo Details */}
                  <div className="mb-4 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{request.destination_contact_name || 'Name not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{request.weight || 0}t, {request.volume || 0}m³</span>
                    </div>
                  </div>

                  {/* Dates and Budget */}
                  <div className="flex justify-between mb-4 text-xs text-gray-600 border-y border-gray-200 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span> <b>Pickup:</b> {formatDate(request.pickup_date_requested)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span><b>Delivery:</b> {formatDate(request.delivery_date_requested)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Date and View Details Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`${webRoutes.logisticsRequests}/${request.id}`)}
                      className="flex items-center space-x-1 bg-pale_yellow px-3 py-2 rounded-lg hover:bg-gold text-xs font-medium transition-colors"
                    >
                      <DocumentIcon/>
                      <span>View Details</span>
                    </button>
                    <div className="text-xs text-gray-400">
                      Created {formatDate(request.created_at)}
                    </div>
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

export default LogisticsRequestList;
