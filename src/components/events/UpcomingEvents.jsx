import React from 'react'
import { webRoutes } from '../../lib/webRoutes';
import { Bookmark, Building, Calendar, Clock, ClockCheck, Eye, Globe, MapPin, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import OngoingEventsCarousel from './OngoingEventsCarousel';
import UpcomingEventContent from './UpcomingEventContent';
import Scroll from '../Scroll';
import { workforceAPI } from '../../api-services/workforce';
import { toast } from 'sonner';

const UpcomingEvents = ({filteredEvents}) => {
    const [events, setEvents] = React.useState(filteredEvents);

    React.useEffect(() => {
      setEvents(filteredEvents);
    }, [filteredEvents]);

    const handleBookmark = async (eventId, e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await workforceAPI.bookmarkEvent(eventId);
        const isBookmarked = response?.data?.bookmarked ?? false;
        
        // Update local state
        setEvents(prev => prev.map(ev => 
          ev.id === eventId ? { ...ev, is_bookmarked: isBookmarked } : ev
        ));
        
        toast.success(isBookmarked ? 'Event bookmarked!' : 'Bookmark removed');
      } catch (error) {
        console.error('Failed to bookmark event:', error);
        toast.error('Failed to update bookmark');
      }
    };

    const handleShare = async (event, e) => {
      e.preventDefault();
      e.stopPropagation();
      const shareUrl = `${window.location.origin}${webRoutes.workforceEventDetail.replace(':id', event.id)}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: event.title,
            text: event.description,
            url: shareUrl,
          });
          toast.success('Event shared successfully!');
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error);
            copyToClipboard(shareUrl);
          }
        }
      } else {
        copyToClipboard(shareUrl);
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Link copied to clipboard!');
      }).catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link');
      });
    };

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
    console.log(filteredEvents);
      const getStatusColor = (status) => {
        switch (status) {
          case 'upcoming': return 'bg-gradient-to-br from-[#FFC000] to-[#FF8400]  text-white';
          case 'open': return 'bg-green-100 text-green-800';
          case 'sold_out': return 'bg-orange-100 text-orange-800';
          case 'cancelled': return 'bg-red-100 text-red-800';
          case 'past': return 'bg-gray-200 text-gray-700';
          default: return 'bg-gray-100 text-gray-800';
        }
      };
    
      const getTypeIcon = (isVirtual, _eventType) => {
        if (isVirtual) return <Globe className="w-4 h-4 text-[#FFC000]" />;
        return <MapPin className="w-4 h-4" />;
      };
        const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
    //   weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
  };

  // const getAvailableSpots = (event) => {
  //   if (!event) return 0;
  //   const cap = event.max_attendees ?? null;
  //   const reg = event.attendees_count ?? 0;
  //   return cap ? Math.max(cap - reg, 0) : 0;
  // };
  const getLongestString = (themes) => {
    if (!themes || !Array.isArray(themes)) return [];
    // Filter out empty strings, "[]", and invalid values
    const filtered = themes.filter(t => t && typeof t === 'string' && t.trim() && t !== '[]');
    if (filtered.length === 0) return [];
    return filtered.sort((a, b) => a.length - b.length).reverse();
  };
  
  // Helper to check if topics are valid
  const hasValidTopics = (topics) => {
    if (!topics || !Array.isArray(topics) || topics.length === 0) return false;
    return topics.some(t => t && typeof t === 'string' && t.trim() && t !== '[]');
  };

  return (
    <div className="">
      <div className={`hidden lg:grid grid-cols-1 md:grid-cols-3 gap-2`}>
              {events.map((event) => (
                <div key={event.id} className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] p-[0.9px] rounded-xl h-[490px]">
                <div className="bg-white rounded-xl border h-full">
                  {/* Event Image */}
                  <div className="relative h-[30%]">
                    <img
                      src={event.image || 'https://picsum.photos/seed/energy-events/800/400'}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                    <div className="absolute top-4 left-4">
                      {(() => {
                        const status = getEventStatus(event);
                        return (
                          <span className={`px-3 py-[6px] capitalize rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.replace('_', ' ')}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="absolute top-4 right-4">
                    
                       <button 
                         onClick={(e) => handleBookmark(event.id, e)}
                         className={`p-2 rounded-lg transition-colors ${
                           event.is_bookmarked 
                             ? 'bg-gold text-white' 
                             : 'bg-pale_yellow text-gray-700 hover:bg-gold'
                         }`}
                       >
                        <Bookmark className={`w-4 h-4 ${event.is_bookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                      {}
                  <div className="p-4 pb-1 h-[58%] ">
                    {/* Organizer */}
                     {/* Title */}
                    <h3 className="font-semibold text-gray-900 pb-4 line-clamp-2">
                      {event.title}
                    </h3>
                     <div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {event.organizer_name || 'Organizer'}
                    </p>
    
                    {/* Location & Time */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {!event.is_virtual ? 'Online' : (event.venue_name || event.venue_address || 'Venue TBA').slice(0, 20) + "..."}
                      </div>
                      <div className='flex items-center text-sm text-gray-600 gap-2'>
                        <span className='flex'>
                            <Calendar className="w-4 h-4 mr-2" />
                            {event.start_date ? formatDate(event.start_date) : 'TBD'}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                            <ClockCheck className="w-4 h-4 mr-2" />
                            {event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            {/* {event.end_date ? ` - ${new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} */}
                        </div>
                      </div>
                    </div>

                     </div>
    
                    <div>
                        <div className='flex justify-between gap-6 mb-2'>
                            <h4 className="font-semibold text-gray-900">Event Type:</h4>
                            <div className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full p-[1px] text-xs font-medium text-gray-700 flex items-center">
                                <div className='bg-white flex items-center px-[10px] py-[7px] rounded-full'>
                                        {/* {getTypeIcon(event.is_virtual, event.event_type)} */}
                                        <Globe className="w-4 h-4 text-[#FFC000]" />
                                <span className="flex ml-1 bg-gradient-to-br from-[#FFC000] to-[#FF8400] bg-clip-text text-transparent capitalize">{event.is_virtual ? 'Virtual' : event.event_type}</span>
                                </div>
                            </div>
                        </div>

                          {/* Topics (if any) */}
                          {hasValidTopics(event.topics) && (
                          <div className='flex gap-4'>
                            <h4 className="font-semibold text-gray-900 mb-2">Theme:</h4>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {getLongestString(event.topics.slice(0, 3)).map((t, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-full">{t}</span>
                                ))}
                            </div>
                          </div>
                          )}
                    </div>
    
                  </div>
                    {/* Actions */}
                  <div className="rounded-b-xl flex space-x-2 h-[12%] py-3 px-2 border-t border-gray-300">
                      <Link
                        to={`${webRoutes.workforceEventDetail.replace(':id', event.id)}`}
                        className="flex-1 bg-pale_yellow text-white text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                     
                      <button 
                        onClick={(e) => handleShare(event, e)}
                        className="flex items-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors "
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        {"Share"}
                      </button>
                  </div>
                </div>
                </div>
              ))}

      </div>
              <div className='lg:hidden'>
                <Scroll>
                  <div className='flex gap-2 min-w-min'>
                  {
                    events.map((event, index) => (
                      <div key={event.id} className="w-[340px] bg-gradient-to-br from-[#FFC000] to-[#FF8400] p-[0.9px] rounded-xl h-[490px]">
                        <div className="bg-white rounded-xl border h-full">
                          {/* Event Image */}
                          <div className="relative h-[30%]">
                                      <img
                                        src={event.image || 'https://picsum.photos/seed/energy-events/800/400'}
                                        alt={event.title}
                                        className="w-full h-full object-cover rounded-t-xl"
                                      />
                                      <div className="absolute top-4 left-4">
                                        {(() => {
                                          const status = getEventStatus(event);
                                          return (
                                            <span className={`px-3 py-[6px] capitalize rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                              {status.replace('_', ' ')}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      <div className="absolute top-4 right-4">
                                      
                                         <button 
                                           onClick={(e) => handleBookmark(event.id, e)}
                                           className={`p-2 rounded-lg transition-colors ${
                                             event.is_bookmarked 
                                               ? 'bg-gold text-white' 
                                               : 'bg-pale_yellow text-gray-700 hover:bg-gold'
                                           }`}
                                         >
                                          <Bookmark className={`w-4 h-4 ${event.is_bookmarked ? 'fill-current' : ''}`} />
                                        </button>
                                      </div>
                                    </div>
                                        {}
                                    <div className="p-4 pb-1 h-[58%] ">
                                      {/* Organizer */}
                                       {/* Title */}
                                      <h3 className="font-semibold text-gray-900 pb-4 line-clamp-2">
                                        {event.title}
                                      </h3>
                                       <div>
                                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                                        <Building className="w-4 h-4 mr-1" />
                                        {event.organizer_name || 'Organizer'}
                                      </p>
                      
                                      {/* Location & Time */}
                                      <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                          <MapPin className="w-4 h-4 mr-2" />
                                          {!event.is_virtual ? 'Online' : (event.venue_name || event.venue_address || 'Venue TBA').slice(0, 20) + "..."}
                                        </div>
                                        <div className='flex items-center text-sm text-gray-600 gap-2'>
                                          <span className='flex'>
                                              <Calendar className="w-4 h-4 mr-2" />
                                              {event.start_date ? formatDate(event.start_date) : 'TBD'}
                                          </span>
                                          <div className="flex items-center text-sm text-gray-600">
                                              <ClockCheck className="w-4 h-4 mr-2" />
                                              {event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                              {/* {event.end_date ? ` - ${new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} */}
                                          </div>
                                        </div>
                                      </div>
                  
                                       </div>
                      
                                      <div>
                                          <div className='flex justify-between gap-6 mb-2'>
                                              <h4 className="font-semibold text-gray-900">Event Type:</h4>
                                              <div className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full p-[1px] text-xs font-medium text-gray-700 flex items-center">
                                                  <div className='bg-white flex items-center px-[10px] py-[7px] rounded-full'>
                                                          <Globe className="w-4 h-4 text-[#FFC000]" />
                                                  <span className="flex ml-1 bg-gradient-to-br from-[#FFC000] to-[#FF8400] bg-clip-text text-transparent capitalize">{event.is_virtual ? 'Virtual' : event.event_type}</span>
                                                  </div>
                                              </div>
                                          </div>
                  
                                            {/* Topics (if any) */}
                                            {hasValidTopics(event.topics) && (
                                            <div className='flex gap-4'>
                                              <h4 className="font-semibold text-gray-900 mb-2">Theme:</h4>
                                              <div className="flex flex-wrap gap-1 mb-4">
                                                  {getLongestString(event.topics.slice(0, 3)).map((t, i) => (
                                                  <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-full">{t}</span>
                                                  ))}
                                              </div>
                                            </div>
                                            )}
                                      </div>
                      
                                    </div>
                                      {/* Actions */}
                                    <div className="rounded-b-xl flex space-x-2 h-[12%] py-3 px-2 border-t border-gray-300">
                                        <Link
                                          to={`${webRoutes.workforceEventDetail.replace(':id', event.id)}`}
                                          className="flex-1 bg-pale_yellow text-white text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          View Details
                                        </Link>
                                       
                                        <button 
                                          onClick={(e) => handleShare(event, e)}
                                          className="flex items-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors "
                                        >
                                          <Share2 className="w-4 h-4 mr-1" />
                                          {"Share"}
                                        </button>
                                    </div>
                                  </div>
                                  </div>
                    ))}
                  </div>
                </Scroll>
      {/* <OngoingEventsCarousel filteredEvents={filteredEvents} currentIndex={0}>
        <UpcomingEventContent filteredEvents={filteredEvents} currentIndex={0} />
      </OngoingEventsCarousel> */}
              </div>
            </div>
  )
}

export default UpcomingEvents