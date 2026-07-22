import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Deal Rooms | Connectize - Oil & Gas Transactions",
    description: "Create and manage secure deal rooms for oil and gas business negotiations. Collaborate, share documents, and track deal progress.",
  keywords: "deal rooms, oil and gas deals, business transactions, collaboration, negotiations",
  });

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign,
  MapPin,
  Eye,
  Lock,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Download,
  Share2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { dealRoomService } from '../../api-services/oilgas';
import { formatCompactNumber } from "../../utils/formatNumber";

const DealRooms = () => {
  const [dealRooms, setDealRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const navigate = useNavigate();

  useEffect(() => {
    loadDealRooms();
  }, [filterStatus, filterType, sortBy]);

  const loadDealRooms = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading deal rooms...');
      
      const params = {
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        deal_type: filterType !== 'all' ? filterType : undefined,
  ordering: sortBy.startsWith('-') ? sortBy : `-${sortBy}`,
  // Scope restricted to the authenticated user's own / participating deal rooms
  scope: 'mine'
      };
      
      console.log('📋 Request params:', params);
      
  let response = await dealRoomService.getAll(1, 50, params);
      console.log('📨 API Response:', response);
      
      // Backend returns data directly for list views, results for paginated
      const rooms = response?.results || response?.data || response || [];
      console.log('🏠 Processed rooms:', rooms);
      console.log('📊 Rooms count:', Array.isArray(rooms) ? rooms.length : 'Not an array');
      
  setDealRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error('Failed to load deal rooms:', error);
      setDealRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDealRooms();
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDealTypeIcon = (type) => {
    switch (type) {
      case 'acquisition': return <TrendingUp className="w-4 h-4" />;
      case 'joint_venture': return <Users className="w-4 h-4" />;
      case 'service_contract': return <FileText className="w-4 h-4" />;
      case 'equipment_lease': return <AlertCircle className="w-4 h-4" />;
      case 'exploration_rights': return <MapPin className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const DealRoomCard = ({ deal }) => (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              {getDealTypeIcon(deal.deal_type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{deal.title}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {deal.deal_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {deal.is_confidential && <Lock className="w-4 h-4 text-orange-500" />}
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated Value</span>
            <span className="font-semibold text-gray-900">
              {formatCompactNumber(deal.estimated_value)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Target Close</span>
            <span className="text-gray-700">
              {new Date(deal.target_close_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.status)}`}>
              {deal.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {deal.participants_count || 0}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {deal.documents_count || 0}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {deal.milestones_count || 0}
            </div>
          </div>
          <Link
            to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>

      {deal.recent_activities && deal.recent_activities.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Last activity: {deal.recent_activities[0]?.description}
            </span>
            <span className="text-gray-400">
              {getTimeAgo(deal.recent_activities[0]?.timestamp)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const DealRoomListItem = ({ deal }) => (
    <div className="bg-white border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="bg-blue-100 p-2 rounded-lg">
            {getDealTypeIcon(deal.deal_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900 text-lg">{deal.title}</h3>
              {deal.is_confidential && <Lock className="w-4 h-4 text-orange-500" />}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.status)}`}>
                {deal.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{deal.description}</p>
            <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
              <span className="capitalize">{deal.deal_type?.replace('_', ' ')}</span>
              <span>{formatCompactNumber(deal.estimated_value)}</span>
              <span>Due: {new Date(deal.target_close_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {deal.participants_count || 0}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {deal.documents_count || 0}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {deal.milestones_count || 0}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <Link
              to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deal Rooms</h1>
              <p className="text-gray-600 mt-1">Secure collaboration spaces for oil & gas deals</p>
            </div>
            <Link
              to={webRoutes.dealRoomCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Deal Room
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deal rooms..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="negotiating">Pending</option>
                <option value="due_diligence">Due Diligence</option>
                <option value="closing">Closing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="acquisition">Acquisition</option>
                <option value="joint_venture">Joint Venture</option>
                <option value="service_contract">Service Contract</option>
                <option value="equipment_lease">Equipment Lease</option>
                <option value="exploration_rights">Exploration Rights</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Newest First</option>
                <option value="estimated_value">Highest Value</option>
                <option value="target_close_date">Closing Soon</option>
                <option value="title">Alphabetical</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Rooms Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : dealRooms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deal rooms found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first deal room.
            </p>
            <div className="mt-6">
              <Link
                to={webRoutes.dealRoomCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-custom_yellow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Deal Room
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealRooms.map((deal) => (
              <DealRoomCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {dealRooms.map((deal) => (
              <DealRoomListItem key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealRooms;
