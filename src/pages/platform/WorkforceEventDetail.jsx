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
      return { status: 'live', label: 'Live Now', color: 'green' };
    } else {
      return { status: 'ended', label: 'Ended', color: 'gray' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Event Not Found</h3>
          <p className="text-slate-600 mb-6">{error || 'This event could not be found or may have been removed.'}</p>
          <Link
            to={webRoutes.workforceEvents}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.color === 'green' 
                  ? 'bg-emerald-100 text-emerald-700'
                  : status.color === 'blue'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {status.label}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                {event.event_type}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{event.title}</h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {event.description}
                </p>
              </div>

              {event.image && (
                <div className="lg:col-span-1">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Event Details</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Date</p>
                  <p className="text-slate-600">
                    {formatDate(event.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Time</p>
                  <p className="text-slate-600">
                    {formatTime(event.start_date)}
                    {event.end_date && ` - ${formatTime(event.end_date)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Location</p>
                  <p className="text-slate-600">
                    {event.is_virtual ? 
                      `Virtual Event` :
                      event.location
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Capacity</p>
                  <p className="text-slate-600">
                    {event.registered_count || 0} / {event.max_attendees || 'Unlimited'} registered
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Price</p>
                  <p className="text-slate-600">
                    {event.is_free ? 'Free' : `${event.ticket_price} ${event.currency || 'USD'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                <Building className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Organizer</p>
                  <p className="text-slate-600">{event.organizer || 'Event Organizer'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Register for this Event</h3>
                <p className="text-slate-600">
                  {event.is_free ? 'Free' : `${event.ticket_price} ${event.currency || 'USD'}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {!isRegistered ? (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || (event.max_attendees && event.registered_count >= event.max_attendees)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Register Now
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    Registered
                  </div>
                )}
              </div>
            </div>
          </div>

          {(event.contact_email || event.contact_phone) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {event.contact_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a 
                      href={`mailto:${event.contact_email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a 
                      href={`tel:${event.contact_phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {event.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Explore More Events</h3>
                <p className="text-slate-600">Discover other workforce development opportunities</p>
              </div>
              <Link
                to={webRoutes.workforceEvents}
                className="flex items-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-3 transition-transform" />
                View All Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceEventDetail;
