import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Plus, 
  Search,  
  FileText, 
  Users, 
  MapPin,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { dealRoomService } from '../../api-services/oilgas';
import GridIcon from '../../icon/GridIcon';
import ListIcon from '../../icon/ListIcon';
import BigDealRoom from '../../icon/BigDealRoom';
import { DealRoomListItem } from './DealRoomListItem';
import { DealRoomCard } from './DealRoomCard';

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
      const params = {
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        deal_type: filterType !== 'all' ? filterType : undefined,
        ordering: sortBy.startsWith('-') ? sortBy : `-${sortBy}`
      };
      
      const response = await dealRoomService.getAll(1, 50, params);
      // Backend returns data directly for list views, results for paginated
      const rooms = response?.results || response?.data || response || [];
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

  

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deal Rooms</h1>
              <p className="text-gray-600 mt-1">Secure collaboration spaces for oil & gas deals</p>
            </div>
            <Link
              to={webRoutes.dealRoomCreate}
              className="bg-pale_yellow  text-white px-4 py-2 rounded-lg hover:bg-[#E5A800] flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Deal Room
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-2">
        {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row lg:items-center  space-y-4 lg:space-y-0 gap-2 w-full">
            <form onSubmit={handleSearch} className="w-[25%]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Deal Rooms..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex gap-2 items-center">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 w-[80%] rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div className="bg-white flex border border-gray-300 rounded-lg ">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'text-[#E5A800]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className='flex items-center gap-1 cursor-pointer'>
                        <GridIcon fill={viewMode === 'grid' ? "#E5A800" : "#374957"} />
                        <span>Grid</span>
                    </div>
                </button>
                <span className='w-[1px] h-[40px] bg-[#00000033]'></span>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'text-[#E5A800]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                 <div className='flex items-center gap-1 cursor-pointer'>
                        <ListIcon fill={viewMode === 'list' ? "#E5A800" : "#374957"} />
                        <span>List</span>
                    </div>
                </button>
              </div>
            </div>
          </div>
       

        {/* Deal Rooms Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : dealRooms.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <BigDealRoom/>
            <h3 className="mt-2 text-2xl font-medium text-gray-900">No Deal room found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first deal room.
            </p>
            <div className="mt-6">
              <Link
                to={webRoutes.dealRoomCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pale_yellow  hover:bg-[#E5A800]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deal Room
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
