import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  MapPin,
  Plus,
  Globe,
  Clock,
  Zap,
  SearchIcon,
  Settings2,
  Bookmark,
  UserCircle,
  CalendarCheck,
  DollarSign,
} from 'lucide-react';
import SEO from '../../components/SEO';
import { getSEOConfig } from '../../lib/seoConfig';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import OngoingEvents from '../../components/events/OngoingEvents';
import UpcomingEvents from '../../components/events/UpcomingEvents';
import Scroll from '../../components/Scroll';
import BackArrowButton from '../../components/BackArrowButton';

const WorkforceEvents = () => {
  const seoData = getSEOConfig("workforceEvents");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',        // event_type: conference, workshop, training, seminar, etc.
    location: '',    // venue_name or venue_address
    format: '',      // virtual or in_person
    date: '',        // today, this_week, this_month
    price: ''        // free or paid
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    upcoming: { page: 1, hasMore: false, nextUrl: null },
    ongoing: { page: 1, hasMore: false, nextUrl: null },
    past: { page: 1, hasMore: false, nextUrl: null }
  });

  // Helper function to apply filters to a specific event list
  const applyFiltersToEvents = useCallback((eventList) => {
    let filtered = eventList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.organizer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.topics || []).some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Event Type filter (conference, workshop, training, seminar, etc.)
    if (filters.type) {
      filtered = filtered.filter(event => event.event_type === filters.type);
    }

    // Location filter - check venue_name and venue_address (virtual events may not have these)
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(event => 
        (event.venue_name || '').toLowerCase().includes(locationTerm) ||
        (event.venue_address || '').toLowerCase().includes(locationTerm) ||
        (event.is_virtual && 'virtual'.includes(locationTerm)) ||
        (event.virtual_platform || '').toLowerCase().includes(locationTerm)
      );
    }

    // Virtual/In-Person filter
    if (filters.format) {
      if (filters.format === 'virtual') {
        filtered = filtered.filter(event => event.is_virtual === true);
      } else if (filters.format === 'in_person') {
        filtered = filtered.filter(event => event.is_virtual === false);
      }
    }

    // Date filter
    if (filters.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0);
        
        if (filters.date === 'today') {
          return eventDate.getTime() === today.getTime();
        }
        if (filters.date === 'this_week') {
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDate >= today && eventDate <= weekFromNow;
        }
        if (filters.date === 'this_month') {
          return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    // Price filter
    if (filters.price) {
      if (filters.price === 'free') {
        filtered = filtered.filter(event => event.is_free === true);
      } else if (filters.price === 'paid') {
        filtered = filtered.filter(event => event.is_free === false);
      }
    }

    return filtered;
  }, [searchTerm, filters]);

  const getTabCount = (tab) => {
    // Return filtered count if any filters are active
    const hasActiveFilters = searchTerm || filters.type || filters.location || filters.format || filters.date || filters.price;
    
    if (hasActiveFilters) {
      switch (tab) {
        case 'ongoing':
          return applyFiltersToEvents(ongoingEvents).length;
        case 'upcoming':
          return applyFiltersToEvents(upcomingEvents).length;
        case 'recent':
          return applyFiltersToEvents(pastEvents).length;
        default:
          return 0;
      }
    }
    
    // Return unfiltered count when no filters are active
    switch (tab) {
      case 'ongoing':
        return ongoingEvents.length;
      case 'upcoming':
        return upcomingEvents.length;
      case 'recent':
        return pastEvents.length;
      default:
        return 0;
    }
  };
  
  const getEventSchedule = (tab) => {
    switch (tab) {
      case 'ongoing':
        return applyFiltersToEvents(ongoingEvents);
      case 'upcoming':
        return applyFiltersToEvents(upcomingEvents);
      case 'recent':
        return applyFiltersToEvents(pastEvents);
      default:
        return [];
    }
  };
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, filters, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch all event types in parallel
      const [upcomingResponse, ongoingResponse, pastResponse] = await Promise.all([
        workforceAPI.getUpcomingEvents(),
        workforceAPI.getOngoingEvents(),
        workforceAPI.getPastEvents()
      ]);
      
      const upcomingData = upcomingResponse.data?.results || upcomingResponse.data || [];
      const ongoingData = ongoingResponse.data?.results || ongoingResponse.data || [];
      const pastData = pastResponse.data?.results || pastResponse.data || [];
      
      setUpcomingEvents(upcomingData);
      setOngoingEvents(ongoingData);
      setPastEvents(pastData);
      
      // Update pagination info
      setPagination({
        upcoming: { 
          page: 1, 
          hasMore: !!upcomingResponse.data?.next, 
          nextUrl: upcomingResponse.data?.next 
        },
        ongoing: { 
          page: 1, 
          hasMore: !!ongoingResponse.data?.next, 
          nextUrl: ongoingResponse.data?.next 
        },
        past: { 
          page: 1, 
          hasMore: !!pastResponse.data?.next, 
          nextUrl: pastResponse.data?.next 
        }
      });
      
      // Combine all events for filtering/search purposes
      const allEvents = [...upcomingData, ...ongoingData, ...pastData];
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      setUpcomingEvents([]);
      setOngoingEvents([]);
      setPastEvents([]);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load more events for the current tab
  const loadMoreEvents = async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      const tabToApiMap = {
        'upcoming': { api: workforceAPI.getUpcomingEvents, setter: setUpcomingEvents, state: upcomingEvents },
        'ongoing': { api: workforceAPI.getOngoingEvents, setter: setOngoingEvents, state: ongoingEvents },
        'recent': { api: workforceAPI.getPastEvents, setter: setPastEvents, state: pastEvents }
      };
      
      const currentTab = activeTab === 'all' ? 'upcoming' : activeTab;
      const paginationKey = currentTab === 'recent' ? 'past' : currentTab;
      const { api, setter, state } = tabToApiMap[currentTab] || tabToApiMap['upcoming'];
      const currentPagination = pagination[paginationKey];
      
      if (!currentPagination?.hasMore) return;
      
      const nextPage = currentPagination.page + 1;
      const response = await api({ page: nextPage });
      
      const newData = response.data?.results || response.data || [];
      
      // Append new events to existing
      setter(prev => [...prev, ...newData]);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        [paginationKey]: {
          page: nextPage,
          hasMore: !!response.data?.next,
          nextUrl: response.data?.next
        }
      }));
      
      // Update combined events
      setEvents(prev => [...prev, ...newData]);
      
    } catch (error) {
      console.error('Failed to load more events:', error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Check if there are more events to load for current tab
  const hasMoreEvents = () => {
    if (activeTab === 'all') {
      return pagination.upcoming.hasMore || pagination.ongoing.hasMore || pagination.past.hasMore;
    }
    const paginationKey = activeTab === 'recent' ? 'past' : activeTab;
    return pagination[paginationKey]?.hasMore || false;
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.organizer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.topics || []).some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Event Type filter (conference, workshop, training, seminar, etc.)
    if (filters.type) {
      filtered = filtered.filter(event => event.event_type === filters.type);
    }

    // Location filter - check venue_name and venue_address (virtual events may not have these)
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(event => 
        (event.venue_name || '').toLowerCase().includes(locationTerm) ||
        (event.venue_address || '').toLowerCase().includes(locationTerm) ||
        (event.is_virtual && 'virtual'.includes(locationTerm)) ||
        (event.virtual_platform || '').toLowerCase().includes(locationTerm)
      );
    }

    // Virtual/In-Person filter
    if (filters.format) {
      if (filters.format === 'virtual') {
        filtered = filtered.filter(event => event.is_virtual === true);
      } else if (filters.format === 'in_person') {
        filtered = filtered.filter(event => event.is_virtual === false);
      }
    }

    // Date filter
    if (filters.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0);
        
        if (filters.date === 'today') {
          return eventDate.getTime() === today.getTime();
        }
        if (filters.date === 'this_week') {
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDate >= today && eventDate <= weekFromNow;
        }
        if (filters.date === 'this_month') {
          return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    // Price filter
    if (filters.price) {
      if (filters.price === 'free') {
        filtered = filtered.filter(event => event.is_free === true);
      } else if (filters.price === 'paid') {
        filtered = filtered.filter(event => event.is_free === false);
      }
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      format: '',
      date: '',
      price: ''
    });
    setSearchTerm('');
  };

  // Derive a status label from backend fields
  const getEventStatus = (event) => {
    if (!event) return 'unknown';
    if (event.is_cancelled) return 'cancelled';
    const now = new Date();
    const start = event.start_date ? new Date(event.start_date) : null;
    const end = event.end_date ? new Date(event.end_date) : null;
    // Sold out when max_attendees present and reached
    if (event.max_attendees && event.attendees_count >= event.max_attendees) return 'sold_out';
    if (start && start > now) return 'upcoming';
    if (start && end && now >= start && now <= end) return 'open';
    return 'past';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'sold_out': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'past': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (isVirtual, _eventType) => {
    if (isVirtual) return <Globe className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvailableSpots = (event) => {
    if (!event) return 0;
    const cap = event.max_attendees ?? null;
    const reg = event.attendees_count ?? 0;
    return cap ? Math.max(cap - reg, 0) : 0;
  };

  const scrollToId = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 lg:px-0">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      {/* Header */}
      <div className="pt-2 md:py-6 flex flex-col md:flex-row">
        <BackArrowButton  className={"w-fit"}/>
        <div className="flex flex-col ">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Industry Events</h1>
              <p className="text-gray-600 mt-1">Professional development, networking & training opportunities</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.workforceMyBookmarks}
                className="hidden md:flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                My Bookmarks
              </Link>
              <Link
                to={webRoutes.workforceMyEvents}
                className="hidden md:flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                My Events
              </Link>
              <Link
                to={webRoutes.workforceCompanyEarnings}
                className="hidden md:flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Earnings
              </Link>
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
          
          {/* Mobile Quick Access Menu */}
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
            <Link
              to={webRoutes.workforceMyBookmarks}
              className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Bookmarks
            </Link>
            <Link
              to={webRoutes.workforceMyEvents}
              className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4 mr-1" />
              My Events
            </Link>
            <Link
              to={webRoutes.workforceMyRegistrations}
              className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <UserCircle className="w-4 h-4 mr-1" />
              Registrations
            </Link>
            <Link
              to={webRoutes.workforceCompanyEarnings}
              className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Earnings
            </Link>
          </div>

          <Scroll>
              <nav className="flex gap-2 min-w-min" aria-label="Tabs">

                  {[
                    { key: 'ongoing', label: 'Ongoing Events' },
                    { key: 'upcoming', label: 'Upcoming Events' },
                    { key: 'recent', label: 'Past Events' },
                  ].map((tab) => ( 
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); scrollToId(tab.key); }}
                      className={`${
                        activeTab === tab.key
                        ? 'border-transparent bg-[#FFDB76]'
                        : 'border-[#D9D9D9] text-[#495057] hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap p-2 border-2 rounded-full font-medium text-sm flex items-center`}
                    >
                      {tab.label}
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                        {getTabCount(tab.key)}
                      </span>
                    </button>
                  ))}
                </nav>
            </Scroll>
        </div>
      </div>

      <div className="lg:bg-white py-4">
        {/* Ongoing Events */}
        <div className='px-2' id='ongoing'>
          <div className="flex justify-between lg:items-center flex-col-reverse lg:flex-row gap-4 pb-4">
                <span className="flex h-fit gap-2 ">
                            <h3 className='text-2xl font-medium  '>Ongoing Events</h3>
                            <span className={`ml-1 md:h-[50%] mt-2 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                              {getTabCount('ongoing')}
                            </span>
                          </span>
                <div className='flex gap-4 lg:w-[50%]'>
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events by title, organizer, or topic..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    Filter
                    <Settings2 className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
    
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="training">Training</option>
                        <option value="seminar">Seminar</option>
                        <option value="networking">Networking</option>
                        <option value="webinar">Webinar</option>
                        <option value="exhibition">Exhibition</option>
                        <option value="job_fair">Job Fair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="City, venue name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.format}
                        onChange={(e) => handleFilterChange('format', e.target.value)}
                      >
                        <option value="">All Formats</option>
                        <option value="virtual">Virtual</option>
                        <option value="in_person">In-Person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                      >
                        <option value="">Any Time</option>
                        <option value="today">Today</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.price}
                        onChange={(e) => handleFilterChange('price', e.target.value)}
                      >
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={clearFilters}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
          {getEventSchedule('ongoing').length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center mb-8 border border-gray-200">
              <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ongoing Events</h3>
              <p className="text-gray-600 mb-6">There are no events happening right now. Check back soon or browse upcoming events!</p>
              <button
                onClick={() => { setActiveTab('upcoming'); scrollToId('upcoming'); }}
                className="inline-flex items-center bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Upcoming Events
              </button>
            </div>
          ) : (
            <OngoingEvents events={events} searchTerm={searchTerm} handleSearchChange={handleSearchChange} setShowFilters={setShowFilters} showFilters={showFilters} handleFilterChange={handleFilterChange} filters={filters} clearFilters={clearFilters} filteredEvents={getEventSchedule('ongoing')} />
          )}
        </div>

        {/* Events Grid */}
        <div className='px-2' id='upcoming'>
          <span className="flex h-fit gap-2">
              <h4 className='font-medium text-3xl mb-4'>Upcoming Events</h4>
              <span className={`ml-1 h-[50%] mt-2 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                    {getTabCount('upcoming')}
              </span>
          </span>
          {getEventSchedule('upcoming').length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center mb-8 border border-gray-200">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600 mb-6">There are no scheduled events in the future. Check back later or create your own event!</p>
              <Link
                to={webRoutes.workforceEventCreate}
                className="inline-flex items-center bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create an Event
              </Link>
            </div>
          ) : (
            <UpcomingEvents filteredEvents={getEventSchedule('upcoming')} />
          )}
        </div>

        {/* Events Grid */}
        <div className='px-2 py-6' id='recent'>
          <span className="flex ">
            <h4 className='font-medium text-3xl mb-4'>Past Events</h4>
            <span className={`ml-1 h-[50%] mt-2 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
              {getTabCount('recent')}
            </span>
          </span>
          {getEventSchedule('recent').length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center mb-8 border border-gray-200">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Events</h3>
              <p className="text-gray-600 mb-6">You haven't attended any events recently. Explore upcoming events to get started!</p>
              <button
                onClick={() => { setActiveTab('upcoming'); scrollToId('upcoming'); }}
                className="inline-flex items-center bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Browse Events
              </button>
            </div>
          ) : (
            <UpcomingEvents filteredEvents={getEventSchedule('recent')} />
          )}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Load More */}
        {filteredEvents.length > 0 && hasMoreEvents() && (
          <div className="text-center mt-8">
            <button 
              onClick={loadMoreEvents}
              disabled={loadingMore}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </>
              ) : (
                'Load More Events'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceEvents;
