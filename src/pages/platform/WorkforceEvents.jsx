import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  ExternalLink,
  User,
  Building,
  Globe,
  Star,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Share2,
  Download,
  Eye,
  UserPlus
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import OngoingEvents from '../../components/events/OngoingEvents';
import UpcomingEvents from '../../components/events/UpcomingEvents';

const WorkforceEvents = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    date: '',
    type: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const getTabCount = (tab) => {
    switch (tab) {
      case 'all':
        return applications.length;
      case 'active':
        return applications.filter(app => ['submitted', 'under_review', 'shortlisted', 'interview_scheduled'].includes(app.status)).length;
      case 'completed':
        return applications.filter(app => ['offer_made', 'hired', 'rejected', 'withdrawn'].includes(app.status)).length;
      case 'interviews':
        return applications.filter(app => app.status === 'interview_scheduled').length;
      default:
        return 0;
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
      const response = await workforceAPI.getEvents();
      const data = response.data?.results || response.data || [];
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.organizer || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event => 
        (event.location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Date filter
    if (filters.date) {
      const today = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date || event.date);
        if (filters.date === 'today') {
          return eventDate.toDateString() === today.toDateString();
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

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      date: '',
      type: '',
      status: ''
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      {/* Header */}
      <div className="">
        <div className="flex flex-col mb-6 ">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Industry Events</h1>
              <p className="text-gray-600 mt-1">Professional development, networking & training opportunities</p>
            </div>
            <div className="flex space-x-3">
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
          <nav className="flex gap-2" aria-label="Tabs">
              {[
                { key: 'all', label: 'Ongoing Events' },
                { key: 'active', label: 'Upcoming Events' },
                { key: 'interviews', label: 'Recent Events' },
              ].map((tab) => ( 
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-transparent bg-[#FFDB76]'
                      : 'border-[#D9D9D9] text-[#495057] hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap p-2 border-2 rounded-full font-medium text-sm flex items-center`}
                >
                  {tab.label}
                  {/* <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                    {getTabCount(tab.key)}
                  </span> */}
                </button>
              ))}
            </nav>
        </div>
      </div>

      <div className="lg:bg-white">
        {/* Search and Filters */}
        <OngoingEvents searchTerm={searchTerm} handleSearchChange={handleSearchChange} setShowFilters={setShowFilters} showFilters={showFilters} handleFilterChange={handleFilterChange} filters={filters} clearFilters={clearFilters} filteredEvents={filteredEvents} />

        {/* Events Grid */}
        <div className='px-2'>
              <h4 className='font-medium text-3xl mb-4'>Upcoming Events</h4>
        <UpcomingEvents filteredEvents={filteredEvents} />
        </div>

        {/* Events Grid */}
        <div className='px-2 py-6'>
              <h4 className='font-medium text-3xl mb-4'>Recent Events</h4>
        <UpcomingEvents filteredEvents={filteredEvents} />
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Load More */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              Load More Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceEvents;
