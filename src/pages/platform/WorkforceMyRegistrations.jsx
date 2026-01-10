import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign,
  Eye, XCircle, CheckCircle, AlertCircle,
  Building, Filter, Search, SortAsc,
  User2,
  Users2,
  ClockPlus,
  CheckSquare,
  CheckSquare2,
  ClockPlusIcon,
  CheckCircle2,
  ClockCheck,
  Globe,
  Share2,
  ClockFading,
  Plus
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';
import BackArrowButton from "../../components/BackArrowButton"

const WorkforceMyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, confirmed, pending
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMyRegistrations();
  }, []);

  const loadMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyEventRegistrations();
      setRegistrations(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load your event registrations. Please try again.');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

   const getEventStatus = (event) => {
    if (!event || !event.start_date) return { status: 'upcoming', label: 'Upcoming', color: 'blue' };

    const now = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;

    if (start > now) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else if (end && now <= end) {
      return { status: 'ongoing', label: 'Ongoing', color: 'green' };
    } else {
      return { status: 'completed', label: 'Completed', color: 'gray' };
    }
  };

  const getRegistrationStatus = (registration) => {
    switch (registration.status) {
      case 'confirmed':
        return { icon: CheckCircle, label: 'Confirmed', color: 'green' };
      case 'pending':
        return { icon: AlertCircle, label: 'Pending Approval', color: 'yellow' };
      case 'pending_payment':
        return { icon: DollarSign, label: 'Pending Payment', color: 'orange' };
      case 'waitlisted':
        return { icon: Clock, label: 'Waitlisted', color: 'orange' };
      case 'cancelled':
        return { icon: XCircle, label: 'Cancelled', color: 'red' };
      default:
        return { icon: AlertCircle, label: 'Unknown', color: 'gray' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredRegistrations = registrations.filter(registration => {
    // Safe access to event and title with fallbacks
    const eventTitle = registration?.event?.title || '';
    const matchesSearch = eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'upcoming') {
      const eventStatus = getEventStatus(registration.event);
      return matchesSearch && eventStatus.status === 'upcoming';
    }
    if (filter === 'past') {
      const eventStatus = getEventStatus(registration.event);
      return matchesSearch && eventStatus.status === 'completed';
    }
    if (filter === 'confirmed' || filter === 'pending') {
      return matchesSearch && registration.status === filter;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your event registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className=" px-4 md:px-0">
        {/* Header */}
        <div className="mb-8 mt-4">
          <div className='flex justify-between items-end md:items-start '>
            <div className='flex flex-col md:flex-row md:w-[70%]'>
                <BackArrowButton  />
              <div className='flex flex-col'>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Registered Events</h1>
                <p className="mt-2 text-sm md:text-lg text-slate-600">
                  Track and manage your event registrations
                </p>
              </div>
            </div>
            <div className="flex h-[50%]">
               <Link
               to={webRoutes.workforceEventCreate}
               className="bg-pale_yellow px-4 py-2 rounded-lg hover:bg-gold flex items-center"
               >
                <Plus className="w-4 h-4 md:mr-2 " />
                <p className='hidden md:flex'>
                Create Event
                </p>
               </Link>
               </div>
          </div>
           <nav className="flex gap-2 mt-4" aria-label="Tabs">
              {[
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`${
                    filter === tab.key
                      ? 'border-transparent bg-[#FFDB76]'
                      : 'border-[#D9D9D9] text-[#495057] hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-6 border-2 rounded-full font-medium text-sm flex items-center`}
                >
                  {tab.label}
                  {/* <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                    {getTabCount(tab.key)}
                  </span> */}
                </button>
              ))}
            </nav>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-[#FFF1C6] rounded-lg">
                        <Users2 className="w-6 h-6" />
                      </div>
                      <div className="">
                        <p className="text-2xl font-bold text-gray-900"> {filteredRegistrations.length}</p>
                        <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-[#FFF1C6] rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="">
                        <p className="text-2xl font-bold text-gray-900">
                           {filteredRegistrations.filter(r => r.status === 'confirmed').length}
                        </p>
                        <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-[#FFF1C6] rounded-lg">
                        <ClockPlus className="w-6 h-6" />
                      </div>
                      <div className="">
                        <p className="text-2xl font-bold text-gray-900">
                          {filteredRegistrations.filter(r => getEventStatus(r.event).status === 'upcoming').length}
                        </p>
                        <p className="text-sm font-medium text-gray-600">Upcoming</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-[#FFF1C6] rounded-lg">
                        <CheckSquare2 className="w-6 h-6" />
                      </div>
                      <div className="">
                        <p className="text-2xl font-bold text-gray-900">
                          {filteredRegistrations.filter(r => getEventStatus(r.event).status === 'completed').length}
                        </p>
                        <p className="text-sm font-medium text-gray-600">Attended</p>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        )}


        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRegistrations.length === 0 && !loading ? (
          <div className="bg-transparent md:bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Event Registrations</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'No registrations match your current filters.' 
                : 'You haven\'t registered for any events yet.'
              }
            </p>
            <Link
              to={webRoutes.workforceEvents}
              className="inline-flex items-center bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          /* Registration List */
          <div className='bg-transparent md:bg-white p-4'>
            <p className='capitalize text-3xl font-medium pb-4'>{filter}</p>
          <div className="flex flex-wrap gap-4 md:gap-2">
            {filteredRegistrations.map((registration) => {
              // Skip registration if event is undefined
              if (!registration?.event) {
                console.warn('Registration found without event data:', registration);
                return null;
              }
                const getLongestString = (themes) => {
                  const longestStringArr = themes.sort((a, b) => a.length - b.length).reverse();
                  return longestStringArr;
                };
              const eventStatus = getEventStatus(registration.event);
              const regStatus = getRegistrationStatus(registration);
              const StatusIcon = regStatus.icon;
              const EventStatusIcon = eventStatus.status === 'completed' ? CheckCircle : 
                                      eventStatus.status === 'ongoing' ? AlertCircle : Clock;

              return (
                <div key={registration.id} className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] p-[0.9px] rounded-xl  w-full md:w-[49%]">
                <div className="bg-white rounded-xl border h-full">
                  {/* Registration Top */}
                  <div className="p-4 pb-1 h-[70%]">
                    {/* Organizer */}
                    <div className='flex justify-between text-[12px] mb-3'>
                      <div className='flex gap-3 '>
                        <span className='bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full text-white px-2 py-1 capitalize'>{eventStatus?.status}</span>
                        <span className={`flex items-center gap-2 rounded-full px-2 py-1 ${
                          regStatus?.color === 'green' ? 'bg-green-100 text-green-700' :
                          regStatus?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          regStatus?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          regStatus?.color === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                              {regStatus?.label}
                        </span>
                      </div>
                      {registration.event.is_free || !registration.event.ticket_price ? (
                        <span className='bg-gradient-to-br from-[#258B00] to-[#53FF09] rounded-full text-white px-2 py-1'>Free Event</span>
                      ) : (
                        <span className='bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full text-white px-2 py-1'>
                          ${parseFloat(registration.event.ticket_price).toFixed(2)} {registration.event.currency || 'USD'}
                        </span>
                      )}
                    </div>
                     {/* Title */}
                    <h3 className="font-semibold text-gray-900 pb-4 line-clamp-2">
                      {registration.event.title}
                    </h3>
                     <div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <Building className="w-5 h-5 mr-1" />
                      {registration.event.organizer_name || 'Organizer'}
                    </p>
    
                    {/* Location & Time */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-5 h-5 mr-2" />
                        {registration.event.is_virtual ? 'Online' : (registration.event.venue_name || registration.event.venue_address || 'Venue TBA').slice(0, 20) + "..."}
                      </div>
                      <div className='flex justify-between items-center text-sm text-gray-600 gap-2'>
                        <span className='flex'>
                            <Calendar className="w-5 h-5 mr-2" />
                          <p className='mr-1'>Date:</p>
                            {registration.event.start_date ? formatDate(registration.event.start_date) : 'TBD'}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                            <ClockCheck className="w-5 h-5 mr-2" />
                            <p className='mr-1'>Time:</p>
                            {registration.event.start_date ? new Date(registration.event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                      </div>
                    </div>

                     </div>
    
                    <div>
                        <div className='flex justify-between gap-6 mb-2'>
                            <h4 className="font-semibold text-gray-900">Event Type:</h4>
                            <div className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full p-[1px] text-xs font-medium text-gray-700 flex items-center">
                                <div className='bg-white flex items-center px-[10px] py-[7px] rounded-full'>
                                        {/* {getTypeIcon(registration.event.is_virtual, registration.event.registration.event_type)} */}
                                        <Globe className="w-4 h-4 text-[#FFC000]" />
                                <span className="flex ml-1 bg-gradient-to-br from-[#FFC000] to-[#FF8400] bg-clip-text text-transparent capitalize">{registration.event.is_virtual ? 'Virtual' : registration.event.event_type}</span>
                                </div>
                            </div>
                        </div>

                          <div className='flex gap-4'>
                            <h4 className="font-semibold text-gray-900 mb-2">Theme:</h4>
                            {/* Topics (if any) */}
                            {Array.isArray(registration.event.topics) && 
                             registration.event.topics.filter(t => t && t !== '[]' && t.trim() !== '').length > 0 ? (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {getLongestString(registration.event.topics.filter(t => t && t !== '[]' && t.trim() !== '').slice(0, 3)).map((t, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-[12px] px-2 py-1 rounded-full">{t}</span>
                                ))}
                            </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </div>
                    </div>
    
                  </div>
                            {/* Registration Details and Attendees */}
                  <div className='flex gap-2 py-3 h-[12%] text-[14px] font-medium text-gray-600 justify-center border-t border-gray-300 '>
                        <div className='flex' >
                          <p className="mr-1">Registration On:</p>
                          <p className="">{formatDate(registration.registered_at)}</p>
                        </div>
                        <span className='w-[1px] h-full bg-gray-300'></span>
                        <div className='flex'>
                          <p className="mr-1">Attendees:</p>
                          <p className="">{registration.event?.attendees_count || 0}
                              {registration.event?.max_attendees && ` / ${registration.event.max_attendees}`}</p>
                        </div>
                  </div>
                    {/* Actions */}
                  <div className="rounded-b-xl flex justify-end space-x-2 py-3 px-2 border-t border-gray-300">
                      <Link
                        to={`${webRoutes.workforceEventDetail.replace(':id', registration?.event?.id)}`}
                        className="bg-pale_yellow text-white text-center py-2 rounded-lg px-2 hover:bg-gold transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Event Details
                      </Link>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        

        
      </div>
    </div>
  );
};

export default WorkforceMyRegistrations;
