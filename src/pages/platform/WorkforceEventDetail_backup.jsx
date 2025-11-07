import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign, 
  ArrowLeft, Share2, Bookmark, UserCheck, 
  Building, Globe, Award, CheckCircle, XCircle,
  AlertCircle, ExternalLink, Phone, Mail,
  Star, Sparkles, Crown, Eye, Heart,
  ChevronRight, Shield, Target, Zap
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';

const WorkforceEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    loadEventDetail();
  }, [id]);

  const loadEventDetail = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getEvent(id);
      setEvent(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      await workforceAPI.registerForEvent(id, {});
      setIsRegistered(true);
      // Reload event to get updated registration count
      await loadEventDetail();
    } catch (err) {
      console.error('Error registering for event:', err);
      setError('Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
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
      return { status: 'ongoing', label: 'Live Now', color: 'green' };
    } else {
      return { status: 'completed', label: 'Completed', color: 'gray' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-gray-100/40 flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto" style={{borderTopColor: 'rgb(241,198,68)'}}></div>
            <div className="absolute inset-0 rounded-full animate-pulse" style={{background: 'linear-gradient(to right, rgba(241,198,68,0.2), rgba(241,198,68,0.3))'}}></div>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">Loading Event Details</h3>
          <p className="text-gray-600">Please wait while we fetch the event information...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-gray-100/40 flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl max-w-md mx-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-100 to-rose-100 inline-block mb-6">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">Event Not Found</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error || 'The event you are looking for could not be found or may have been removed.'}</p>
          <button
            onClick={() => navigate(webRoutes.workforceEvents)}
            className="group w-full text-black px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style={{backgroundColor: 'rgb(241,198,68)'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(241,198,68,0.9)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(241,198,68)'}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus(event);
  const StatusIcon = eventStatus.status === 'completed' ? CheckCircle : 
                    eventStatus.status === 'ongoing' ? Zap : Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(webRoutes.workforceEvents)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Events</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Hero Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Status and Type */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg
                    ${eventStatus.color === 'green' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' :
                      eventStatus.color === 'blue' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200' :
                      'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200'}`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {eventStatus.label}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200 capitalize">
                    <Target className="w-4 h-4 mr-2" />
                    {event.event_type}
                  </span>
                </div>

                {/* Event Title and Description */}
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-black mb-4 leading-tight">
                    {event.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">{event.description}</p>
                </div>

                {/* Event Image */}
                {event.image && (
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-80 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-black shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">Event Information</h2>
                    <p className="text-gray-600">All the details you need to know</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 transition-shadow">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Event Date</p>
                        <p className="text-slate-600 font-medium">{formatDate(event.start_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 transition-shadow">
                        <Clock className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Event Time</p>
                        <p className="text-slate-600 font-medium">
                          {formatTime(event.start_date)}
                          {event.end_date && ` - ${formatTime(event.end_date)}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 transition-shadow">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Location</p>
                        <p className="text-slate-600 font-medium">
                          {event.is_virtual ? 
                            `Virtual Event${event.virtual_platform ? ` via ${event.virtual_platform}` : ''}` :
                            (event.venue_name || 'Venue to be announced')
                          }
                        </p>
                        {!event.is_virtual && event.venue_address && (
                          <p className="text-sm text-slate-500 mt-1">{event.venue_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 transition-shadow">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Attendance</p>
                        <p className="text-slate-600 font-medium">
                          {event.attendees_count || 0} registered
                          {event.max_attendees && ` of ${event.max_attendees} capacity`}
                        </p>
                      </div>
                    </div>
                    
                    {event.ticket_price && !event.is_free && (
                      <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 transition-shadow">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">Registration Fee</p>
                          <p className="text-slate-600 font-medium">${event.ticket_price} {event.currency}</p>
                        </div>
                      </div>
                    )}
                    
                    {event.organizer_name && (
                      <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-slate-100 to-gray-100 transition-shadow">
                          <Building className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">Organized by</p>
                          <p className="text-slate-600 font-medium">{event.organizer_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Long Description */}
            {event.long_description && (
              <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">About This Event</h2>
                      <p className="text-slate-500">Detailed event information</p>
                    </div>
                  </div>
                  <div className="prose max-w-none text-slate-700 leading-relaxed">
                    <p className="whitespace-pre-wrap text-lg">{event.long_description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional content sections for agenda, speakers, requirements would go here */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Registration</h3>
                    <p className="text-slate-500">Secure your spot</p>
                  </div>
                </div>
                
                {eventStatus.status === 'completed' ? (
                  <div className="text-center py-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-gray-100 inline-block mb-4">
                      <CheckCircle className="w-12 h-12 text-slate-400 mx-auto" />
                    </div>
                    <p className="text-slate-600 font-medium">This event has ended</p>
                    <p className="text-sm text-slate-500 mt-1">Thank you to all who participated</p>
                  </div>
                ) : isRegistered ? (
                  <div className="text-center py-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-green-100 inline-block mb-4">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    </div>
                    <p className="text-emerald-700 font-bold text-lg">You're registered!</p>
                    <p className="text-sm text-slate-600 mt-2">Check your email for event details and updates</p>
                  </div>
                ) : (
                  <div>
                    {event.ticket_price && !event.is_free && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700 font-medium">Registration Fee:</span>
                          <span className="text-2xl font-bold text-green-700">${event.ticket_price} {event.currency}</span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || (event.max_attendees && event.attendees_count >= event.max_attendees)}
                      className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-black font-medium rounded-lg disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isRegistering ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5 mr-3" />
                          Register Now
                        </>
                      )}
                    </button>
                    
                    {event.max_attendees && event.attendees_count >= event.max_attendees && (
                      <p className="text-sm text-red-600 mt-3 text-center font-medium">Event is full - Registration closed</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Event Stats */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Event Stats</h3>
                    <p className="text-slate-500">Key metrics</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium">Registered</span>
                    <span className="font-bold text-slate-900 text-lg">{event.attendees_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium">Capacity</span>
                    <span className="font-bold text-slate-900 text-lg">{event.max_attendees || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium">Event Type</span>
                    <span className="font-bold text-slate-900 text-lg capitalize">{event.event_type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* More Events */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Discover More</h3>
                    <p className="text-slate-500">Explore other events</p>
                  </div>
                </div>
                <Link
                  to={webRoutes.workforceEvents}
                  className="flex items-center justify-center w-full py-4 px-6 border-2 border-slate-300 rounded-2xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                >
                  <ExternalLink className="w-5 h-5 mr-3 transition-transform" />
                  View All Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceEventDetail;
