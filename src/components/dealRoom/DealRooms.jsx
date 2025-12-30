import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { dealRoomService } from '../../api-services/oilgas';
import GridIcon from '../../icon/GridIcon';
import ListIcon from '../../icon/ListIcon';
import BigDealRoom from '../../icon/BigDealRoom';
import { DealRoomCard } from './DealRoomCard';
import { DealRoomListItem } from './DealRoomListItem';

const DealRooms = () => {
  const navigate = useNavigate();
  const [dealRooms, setDealRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid');

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
        ordering: sortBy.startsWith('-') ? sortBy : `-${sortBy}`,
        // Scope restricted to the authenticated user's own / participating deal rooms
  // scope: 'mine'
      };
      const response = await dealRoomService.getAll(1, 50, params);
      const rooms = response?.results || response?.data || response || [];
      // console.log("Params:", params);
      // console.log("Rooms:", rooms);
      setDealRooms(Array.isArray(rooms) ? rooms : []);
      // console.log("Deal Rooms:", dealRooms);
    } catch (error) {
      console.error('Failed to load deal rooms:', error);
      setDealRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') loadDealRooms();
  };

  return (
    <div className="min-h-screen ">
      {/* HEADER*/}
      
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-end md:items-center justify-between">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-white p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Deal Room</h1>
                <p className="text-base text-gray-600 mt-1">
                  Secure collaboration space for oil and gas deals
                </p>
              </div>
            </div>
            <Link
              to={webRoutes.dealRoomCreate}
              className="inline-flex items-center gap-3 px-5 py-3 bg-[#FFE8A3] hover:bg-[#FFD700] rounded-xl transition-colors font-medium text-gray-900 text-sm"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="md:flex hidden text-gray-900">New Deal Room</span>
            </Link>
          </div>
        </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="space-y-6">

          {/* FILTERS & SEARCH - Mobile (UNCHANGED) */}
          <div className="block lg:hidden space-y-2">
            <div className="flex flex-wrap  items-center gap-3">
              <div className="flex w-[52%] justify-between bg-white border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-6 py-3 flex items-center gap-2 font-medium text-sm ${viewMode === 'grid' ? 'text-[#E5A800]' : 'text-gray-600'}`}
              >
                <GridIcon fill={viewMode === 'grid' ? '#E5A800' : '#6b7280'} />
                Grid
              </button>
              <div className="w-px bg-gray-300" />
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 flex items-center gap-2 font-medium text-sm ${viewMode === 'list' ? 'text-[#E5A800]' : 'text-gray-600'}`}
              >
                <ListIcon fill={viewMode === 'list' ? '#E5A800' : '#6b7280'} />
                List
              </button>
            </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-[44%] h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E5A800] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="negotiating">Pending</option>
                <option value="due_diligence">Due Diligence</option>
                <option value="closing">Closing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-[44%] h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E5A800] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px]"
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
                className="w-[52%] h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E5A800] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px]"
              >
                <option value="created_at">Newest First</option>
                <option value="estimated_value">Highest Value</option>
                <option value="target_close_date">Closing Soon</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Deal Rooms"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full h-11 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A800]"
                />
              </div>
          </div>

          {/* FILTERS & SEARCH - Desktop (UPDATED WITH MINIMALIST DROPDOWNS) */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            <div className="relative w-1/4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Deal Rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A800]"
              />
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* All Status Dropdown */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-[48px] px-5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-normal focus:outline-none focus:border-gray-300 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="negotiating">Pending</option>
                <option value="due_diligence">Due Diligence</option>
                <option value="closing">Closing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                </select>
                <svg 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* All Types Dropdown */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-[48px] px-5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-normal focus:outline-none focus:border-gray-300 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="acquisition">Acquisition</option>
                  <option value="joint_venture">Joint Venture</option>
                  <option value="service_contract">Service Contract</option>
                  <option value="equipment_lease">Equipment Lease</option>
                  <option value="exploration_rights">Exploration Rights</option>
                </select>
                <svg 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-[48px] px-5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-normal focus:outline-none focus:border-gray-300 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="created_at">Newest First</option>
                  <option value="estimated_value">Highest Value</option>
                  <option value="target_close_date">Closing Soon</option>
                  <option value="title">Alphabetical</option>
                </select>
                <svg 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Grid/List Toggle */}
              <div className="flex bg-white border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 ${viewMode === 'grid' ? 'text-[#E5A800]' : 'text-gray-600'}`}
                >
                  <GridIcon fill={viewMode === 'grid' ? '#E5A800' : '#6b7280'} />
                  <span className="text-sm font-medium">Grid</span>
                </button>
                <div className="w-px bg-gray-300" />
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 ${viewMode === 'list' ? 'text-[#E5A800]' : 'text-gray-600'}`}
                >
                  <ListIcon fill={viewMode === 'list' ? '#E5A800' : '#6b7280'} />
                  <span className="text-sm font-medium">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#E5A800]" />
            </div>
          ) : dealRooms.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16">
              <BigDealRoom />
              <h3 className="mt-6 text-xl font-semibold text-gray-900">No Deal room found</h3>
              <p className="mt-2 text-gray-500">Get started by creating your first deal room.</p>
              <Link
                to={webRoutes.dealRoomCreate}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#E5A800] text-white rounded-xl font-medium hover:bg-[#d49a00]"
              >
                <Plus className="w-5 h-5" />
                New Deal Room
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="md:bg-white border-gray-200 md:px-4  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default DealRooms;