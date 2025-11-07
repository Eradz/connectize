import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign,
  Eye, XCircle, CheckCircle, AlertCircle,
  Building, Filter, Search, SortAsc
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';

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
    
    const eventDate = new Date(event.start_date);
    const now = new Date();
    const eventEndDate = event.end_date ? new Date(event.end_date) : eventDate;
    
    if (now < eventDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else if (now >= eventDate && now <= eventEndDate) {
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
      weekday: 'short',
      month: 'short',
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Registered Events</h1>
          <p className="mt-2 text-lg text-slate-600">
            Track and manage your event registrations
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
              <Filter className="w-5 h-5 text-slate-500" />
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
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
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => {
              // Skip registration if event is undefined
              if (!registration?.event) {
                console.warn('Registration found without event data:', registration);
                return null;
              }

              const eventStatus = getEventStatus(registration.event);
              const regStatus = getRegistrationStatus(registration);
              const StatusIcon = regStatus.icon;
              const EventStatusIcon = eventStatus.status === 'completed' ? CheckCircle : 
                                      eventStatus.status === 'ongoing' ? AlertCircle : Clock;

              return (
                <div key={registration.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${eventStatus.color === 'green' ? 'bg-emerald-100 text-emerald-800' :
                                  eventStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'}`}>
                                <EventStatusIcon className="w-4 h-4 mr-1" />
                                {eventStatus.label}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${regStatus.color === 'green' ? 'bg-emerald-100 text-emerald-800' :
                                  regStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  regStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                  regStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                  'bg-slate-100 text-slate-800'}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {regStatus.label}
                              </span>
                              <span className="text-sm text-slate-500 capitalize">{registration.event?.event_type || 'Event'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                              {registration.event?.title || 'Event Title'}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                            <span>{formatDate(registration.event?.start_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-slate-500" />
                            <span>{formatTime(registration.event?.start_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                            <span>
                              {registration.event?.is_virtual ? 'Virtual Event' : (registration.event?.venue_name || 'TBD')}
                            </span>
                          </div>
                        </div>

                        {/* Registration Details */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <span>
                              Registered: {formatDate(registration.registered_at)}
                            </span>
                            {registration.event?.is_free ? (
                              <span className="text-emerald-600 font-medium">Free Event</span>
                            ) : (
                              <span>
                                Fee: ${registration.event?.ticket_price || 0}
                                {registration.payment_status && (
                                  <span className={`ml-1 ${registration.payment_status === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    ({registration.payment_status})
                                  </span>
                                )}
                              </span>
                            )}
                            <span>
                              Attendees: {registration.event?.attendees_count || 0}
                              {registration.event?.max_attendees && ` / ${registration.event.max_attendees}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`${webRoutes.workforceEventDetail.replace(':id', registration.event?.id || '')}`}
                          className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Event
                        </Link>
                        
                        {registration.status === 'confirmed' && eventStatus.status === 'upcoming' && (
                          <button className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Registration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{filteredRegistrations.length}</div>
                <div className="text-sm text-slate-600">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {filteredRegistrations.filter(r => r.status === 'confirmed').length}
                </div>
                <div className="text-sm text-slate-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredRegistrations.filter(r => getEventStatus(r.event).status === 'upcoming').length}
                </div>
                <div className="text-sm text-slate-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {filteredRegistrations.filter(r => getEventStatus(r.event).status === 'completed').length}
                </div>
                <div className="text-sm text-slate-600">Attended</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceMyRegistrations;
