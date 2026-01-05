import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  MapPin,
  Globe,
  Clock,
  Users,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Eye,
  DollarSign
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { toast } from 'sonner';

const WorkforceMyBookmarks = () => {
  const [loading, setLoading] = useState(true);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);

  useEffect(() => {
    loadBookmarkedEvents();
  }, []);

  const loadBookmarkedEvents = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyBookmarkedEvents();
      const data = response.data?.results || response.data || [];
      setBookmarkedEvents(data);
    } catch (error) {
      console.error('Failed to load bookmarked events:', error);
      toast.error('Failed to load bookmarked events');
      setBookmarkedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (eventId) => {
    try {
      await workforceAPI.bookmarkEvent(eventId);
      toast.success('Bookmark removed');
      // Remove from local state
      setBookmarkedEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const getEventStatus = (event) => {
    if (!event) return 'unknown';
    if (event.is_cancelled) return 'cancelled';
    const now = new Date();
    const start = event.start_date ? new Date(event.start_date) : null;
    const end = event.end_date ? new Date(event.end_date) : null;
    if (event.max_attendees && event.attendees_count >= event.max_attendees) return 'sold_out';
    if (start && start > now) return 'upcoming';
    if (start && end && now >= start && now <= end) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'sold_out': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'past': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={webRoutes.workforceEvents}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookmarkCheck className="w-8 h-8 text-[#FFC000]" />
                My Bookmarked Events
              </h1>
              <p className="text-gray-600 mt-1">
                Events you've saved for later ({bookmarkedEvents.length})
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {bookmarkedEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookmarked events yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start bookmarking events to keep track of them easily
            </p>
            <Link
              to={webRoutes.workforceEvents}
              className="inline-flex items-center px-6 py-3 bg-[#FFC000] text-gray-900 font-semibold rounded-lg hover:bg-[#FFD43B] transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative h-48">
                  <img
                    src={event.image || 'https://picsum.photos/seed/energy-events/800/400'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(getEventStatus(event))}`}>
                      {getEventStatus(event).replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(event.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors group"
                    title="Remove bookmark"
                  >
                    <BookmarkCheck className="w-5 h-5 text-[#FFC000] group-hover:text-red-500" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Organizer */}
                  <p className="text-sm text-gray-600 mb-4">
                    by {event.organizer_name || 'Organizer'}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {event.is_virtual ? (
                        <>
                          <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Virtual Event</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {event.venue_name || event.venue_address || 'Venue TBA'}
                          </span>
                        </>
                      )}
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {event.attendees_count || 0} / {event.max_attendees} attendees
                        </span>
                      </div>
                    )}
                    {!event.is_free && event.ticket_price && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {event.currency} {event.ticket_price}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Topics */}
                  {Array.isArray(event.topics) && event.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.topics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={webRoutes.workforceEventDetail.replace(':id', event.id)}
                    className="block w-full bg-[#FFC000] text-center text-gray-900 font-semibold py-3 rounded-lg hover:bg-[#FFD43B] transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceMyBookmarks;
