import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign, Plus,
  Eye, Edit, Trash2, Settings, BarChart3, 
  CheckCircle, AlertCircle, XCircle,
  Search, Filter, Download, UserCheck, ChevronDown, Loader2
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';

const WorkforceMyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null); // registration id being updated

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyCreatedEvents();
      setEvents(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading created events:', err);
      setError('Failed to load your created events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      setLoadingRegistrations(true);
      const response = await workforceAPI.getEventRegistrations(eventId);
      const registrationsData = response.data.results || response.data || [];
      setRegistrations(registrationsData);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId, newStatus) => {
    if (!selectedEvent) return;
    
    try {
      setUpdatingStatus(registrationId);
      await workforceAPI.updateEventRegistration(selectedEvent.id, registrationId, { status: newStatus });
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );
      
      toast.success(`Registration status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating registration status:', err);
      toast.error(err.response?.data?.error || 'Failed to update registration status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleShowRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
    loadRegistrations(event.id);
  };

  const getEventStatus = (event) => {
    if (!event.is_published) return { status: 'draft', label: 'Draft', color: 'gray' };
    if (event.is_cancelled) return { status: 'cancelled', label: 'Cancelled', color: 'red' };
    
    if (!event.start_date) return { status: 'draft', label: 'Draft', color: 'gray' };
    
    const eventDate = new Date(event.start_date);
    const now = new Date();
    const eventEndDate = event.end_date ? new Date(event.end_date) : eventDate;
    
    if (now < eventDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else if (now >= eventDate && now <= eventEndDate) {
      return { status: 'ongoing', label: 'Ongoing', color: 'green' };
    } else {
      return { status: 'completed', label: 'Completed', color: 'slate' };
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

  const filteredEvents = events.filter(event => {
    // Safe access to title with fallback
    const eventTitle = event?.title || '';
    const matchesSearch = eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    
    const eventStatus = getEventStatus(event);
    return matchesSearch && eventStatus.status === filter;
  });

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await workforceAPI.deleteEvent(eventId);
        setEvents(events.filter(e => e.id !== eventId));
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const downloadRegistrations = (event) => {
    if (!registrations || registrations.length === 0) {
      alert('No registrations to export');
      return;
    }
    
    // Create CSV data
    const csvData = registrations.map(reg => ({
      Name: reg.attendee_name || reg.user?.full_name || 'Unknown',
      Email: reg.user?.email || reg.attendee_email || 'Not provided',
      Status: reg.status || 'registered',
      'Registration Date': formatDate(reg.registered_at || reg.created_at)
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = (event?.title || 'event').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${fileName}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your created events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Created Events</h1>
            <p className="mt-2 text-lg text-slate-600">
              Manage your events and track registrations
            </p>
          </div>
          <Link
            to={webRoutes.workforceEventCreate}
            className="mt-4 sm:mt-0 inline-flex items-center bg-gold text-white p-3 sm:px-6 sm:py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Create Event</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your events..."
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
                <option value="draft">Drafts</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
        {filteredEvents.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Events Found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'No events match your current filters.' 
                : 'You haven\'t created any events yet. Start by creating your first event.'
              }
            </p>
            <Link
              to={webRoutes.workforceEventCreate}
              className="inline-flex items-center bg-gold text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          /* Events List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              const StatusIcon = eventStatus.status === 'completed' ? CheckCircle : 
                                eventStatus.status === 'ongoing' ? AlertCircle : 
                                eventStatus.status === 'cancelled' ? XCircle : Clock;

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                  {/* Status Badge */}
                  <div className="px-6 pt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${eventStatus.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                        eventStatus.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        eventStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'}`}>
                      {eventStatus.label}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="px-6 py-3 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Organization/Description */}
                    <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                      {event.description || event.organizer_name || 'Event Details'}
                    </p>

                    {/* Location */}
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 line-clamp-1">
                        {event.is_virtual ? 
                          `Virtual${event.virtual_platform ? ` - ${event.virtual_platform}` : ''}` : 
                          event.venue_name || 'Location TBA'
                        }
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{formatTime(event.start_date)}</span>
                      </div>
                    </div>

                    {/* Theme Tags */}
                    <div className="flex flex-wrap gap-2 mb-3 pt-2">
                      {event.event_type && (
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-md capitalize">
                          {event.event_type}
                        </span>
                      )}
                      {event.is_free ? (
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                          Free
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                          ${event.ticket_price}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 my-3"></div>

                    {/* Registration Info */}
                    <div className="text-xs text-slate-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Registered: {event.attendees_count || 0}/{event.max_attendees || '∞'}</span>
                        <span>{formatDate(event.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-4 pt-2 flex flex-col gap-2">
                    <Link
                      to={`${webRoutes.workforceEventDetail.replace(':id', event.id)}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors text-sm"
                    >
                      View Event Details
                    </Link>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleShowRegistrations(event)}
                        className="flex items-center justify-center px-2 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        title={`${event.attendees_count || 0} registrations`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span className="hidden sm:inline sm:ml-1 text-xs font-medium">Registrations</span>
                      </button>

                      <Link
                        to={`/events/${event.id}/edit`}
                        className="flex items-center justify-center px-2 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Edit event"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline sm:ml-1 text-xs font-medium">Edit</span>
                      </Link>

                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex items-center justify-center px-2 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline sm:ml-1 text-xs font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredEvents.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Management Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{filteredEvents.length}</div>
                <div className="text-sm text-slate-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredEvents.filter(e => getEventStatus(e).status === 'upcoming').length}
                </div>
                <div className="text-sm text-slate-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {filteredEvents.reduce((sum, e) => sum + (e.attendees_count || 0), 0)}
                </div>
                <div className="text-sm text-slate-600">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${filteredEvents.reduce((sum, e) => sum + (e.is_free ? 0 : (e.ticket_price || 0) * (e.attendees_count || 0)), 0).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">Total Revenue</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registrations Modal */}
      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Registrations for "{selectedEvent.title}"
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadRegistrations(selectedEvent)}
                  className="flex items-center px-3 py-2 text-sm bg-gold text-white rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={registrations.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    setShowRegistrations(false);
                    setRegistrations([]);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingRegistrations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
                  <p className="text-slate-600">Loading registrations...</p>
                </div>
              ) : registrations.length > 0 ? (
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{registration.attendee_name || registration.user?.full_name || 'Unknown'}</h4>
                        <p className="text-sm text-slate-600">
                          {registration.user?.email && <span className="mr-3">{registration.user.email}</span>}
                          Registered: {formatDate(registration.registered_at || registration.created_at)}
                        </p>
                        {registration.payment_status && registration.payment_status !== 'not_required' && (
                          <p className="text-xs text-slate-500 mt-1">
                            Payment: {registration.payment_status} 
                            {registration.payment_amount && ` - $${registration.payment_amount}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Status Dropdown */}
                        <div className="relative">
                          <select
                            value={registration.status || 'pending'}
                            onChange={(e) => handleUpdateRegistrationStatus(registration.id, e.target.value)}
                            disabled={updatingStatus === registration.id}
                            className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-sm font-medium cursor-pointer border-0 focus:ring-2 focus:ring-amber-500
                              ${registration.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                registration.status === 'pending_payment' ? 'bg-orange-100 text-orange-800' :
                                registration.status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                                registration.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-slate-100 text-slate-800'}
                              ${updatingStatus === registration.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="waitlisted">Waitlisted</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            {updatingStatus === registration.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No registrations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceMyEvents;