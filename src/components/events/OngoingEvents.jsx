import { Bookmark, Building, Calendar, ClockCheck, Globe, MapPin, SearchIcon, Settings2, Share2 } from 'lucide-react'
import OngoingEventsCarousel from './OngoingEventsCarousel'
import OngoingEventContent from './OngoingEventContent'
import Scroll from '../Scroll'
import { Link } from 'react-router-dom'
import { webRoutes } from '../../lib/webRoutes'
import { workforceAPI } from '../../api-services/workforce'
import { toast } from 'sonner'
import React from 'react'

  const getTopicsDisplay = (topics) => {
        if (!topics) return []
        // Handle case where topics might be a string
        if (typeof topics === 'string') {
          try {
            topics = JSON.parse(topics)
          } catch {
            return []
          }
        }
        if (!Array.isArray(topics) || topics.length === 0) return []
        // Filter out empty strings and "[]" 
        const filtered = topics.filter(t => t && t.trim() && t !== '[]')
        if (filtered.length === 0) return []
        return filtered.slice(0, 3).sort((a, b) => b.length - a.length)
      }

const OngoingEvents = ({searchTerm, handleSearchChange, setShowFilters, showFilters, handleFilterChange, filters, clearFilters, filteredEvents, events}) => {
  const [localFilteredEvents, setLocalFilteredEvents] = React.useState(filteredEvents);

  React.useEffect(() => {
    setLocalFilteredEvents(filteredEvents);
  }, [filteredEvents]);

  const handleBookmark = async (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await workforceAPI.bookmarkEvent(eventId);
      const isBookmarked = response?.data?.bookmarked ?? false;
      
      // Update local filtered events state
      setLocalFilteredEvents(prev => prev.map(ev => 
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


  const getTabCount = (tab) => {
    switch (tab) {
      case 'ongoing':
        return events.filter(event => new Date(event.start_date) < Date.now() && new Date(event.end_date) > Date.now()).length;
      case 'upcoming':
        return events.filter(event => new Date(event.start_date) > Date.now()).length;
      case 'recent':
        return events.filter(event => new Date(event.start_date) < Date.now() && new Date(event.end_date) < Date.now()).length;
      default:
        return 0;
    }
  };
  return (
            <div className="p-2 py-4 mb-8">
              
              <Scroll>
                <div className='flex gap-2 md:gap-6 min-w-min'>
              {localFilteredEvents.map((currentEvent, index) => (
                 <div key={index} className="w-[340px] md:w-[820px] h-full rounded-lg bg-gradient-to-br from-[#FFC000] to-[#FF1A00] p-4 lg:p-8 flex flex-col justify-between">
                  {/* Header Section */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h2 className="text-xl md:text-4xl font-bold text-white mb-4">{currentEvent.title}</h2>
                    
                    <p className="text-lg text-blue-100 mb-4 lg:mb-6 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {currentEvent.organizer_name || 'Organizer'}
                    </p>
    
                    {/* Topics/Themes */}
                    {getTopicsDisplay(currentEvent.topics).length > 0 && (
                      <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-4">
                        <h3 className="font-semibold text-white tracking-wide">Theme:</h3>
                        <div className="flex flex-wrap gap-2">
                          {getTopicsDisplay(currentEvent.topics).map((topic, idx) => (
                            <span
                              key={idx}
                              className="bg-white backdrop-blur-sm text-gray-600 text-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-colors"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
    
                  {/* Footer Section */}
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                    <div className="flex flex-col-reverse gap-2 lg:flex-row justify-between mb-3 lg:mb-6 ">
                      {/* Left: Date & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white">
                          <Calendar className="w-5 h-5" />
                          <span className="text-sm font-medium">Today</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                          <ClockCheck className="w-5 h-5" />
                          <span className="text-sm font-medium">Currently Ongoing</span>
                        </div>
                      </div>
    
                      {/* Right: Event Type & Location */}
                        <div className="flex items-center gap-1 px-2 py-1 border text-white border-white rounded-full w-fit h-[50%]">
                          <Globe className="w-5 h-5" />
                          <span className="text-sm font-medium capitalize">
                            {currentEvent.is_virtual ? 'Virtual' : currentEvent.event_type || 'In-Person'}
                          </span>
                        </div>
                    </div>
    
                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse md:flex-row justify-between gap-3 lg:gap-0">
                        <div className="flex gap-3 md:w-[50%]">
                            <Link to={webRoutes.workforceEventDetail.replace(":id", `${currentEvent.id}`)} className="flex-1 bg-white text-center font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg">
                                Join This Event
                            </Link>
                            <button 
                              onClick={(e) => handleBookmark(currentEvent.id, e)}
                              className={`p-3 rounded-lg transition-colors duration-200 flex items-center justify-center border border-white/30 ${
                                currentEvent.is_bookmarked 
                                  ? 'bg-gold text-white' 
                                  : 'bg-pale_yellow hover:bg-white/30'
                              }`}
                            >
                                <Bookmark className={`w-5 h-5 ${currentEvent.is_bookmarked ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                          <MapPin className="w-5 h-5 " />
                          <span className="text-sm font-medium ">
                            {currentEvent.is_virtual
                              ? 'Online'
                              : currentEvent.venue_name || currentEvent.venue_address || 'Venue TBA'}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              </Scroll>
            </div>
  )
}

export default OngoingEvents