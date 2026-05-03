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
    let newTopics;
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
  
  if (topics.length === 1 && typeof topics[0] === 'string' && topics[0].startsWith('[')) {
    try {
      topics = JSON.parse(topics[0])
      return newTopics = JSON.parse(topics[0])
    } catch {
      return []
    }
  }
  
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

  return (
            <div className="p-2 py-4 mb-8">
              
              <Scroll>
                <div className='flex gap-2 md:gap-6 min-w-min'>
              {localFilteredEvents.map((currentEvent, index) => (
                    <div key={index} className="w-[340px] md:w-[820px] rounded-xl overflow-hidden shadow-md flex flex-col border border-white/20">
                  {/* Event flier — dedicated image zone, never behind text */}
                  {currentEvent.image ? (
                    <div className="w-full bg-gray-200 flex-shrink-0" style={{ aspectRatio: '16/7' }}>
                      <img
                        src={currentEvent.image}
                        alt={currentEvent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex-shrink-0 bg-gradient-to-br from-[#FFC000] to-[#FF1A00]" style={{ aspectRatio: '16/5' }} />
                  )}

                  {/* Card content — always on a clean gradient, never on top of the image */}
                  <div className="flex-1 bg-gradient-to-br from-[#FFC000] to-[#FF1A00] p-4 lg:p-8 flex flex-col justify-between">
                  {/* Header Section */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-3">{currentEvent.title}</h2>

                    <p className="text-sm text-white/80 mb-4 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {currentEvent.organizer_name || 'Organizer'}
                    </p>

                    {/* Topics/Themes */}
                    {getTopicsDisplay(currentEvent.topics).length > 0 && (
                      <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                        <h3 className="font-semibold text-white tracking-wide text-sm">Theme:</h3>
                        <div className="flex flex-wrap gap-2">
                          {getTopicsDisplay(currentEvent.topics).map((topic, idx) => (
                            <span
                              key={idx}
                              className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 lg:p-6 border border-white/20 mt-4">
                    <div className="flex flex-col-reverse gap-2 lg:flex-row justify-between mb-3 lg:mb-4">
                      {/* Left: Date & Status */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">Today</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <ClockCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Currently Ongoing</span>
                        </div>
                      </div>

                      {/* Right: Event Type */}
                      <div className="flex items-center gap-1 px-2 py-1 border text-white border-white rounded-full w-fit h-fit">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-medium capitalize">
                          {currentEvent.is_virtual ? 'Virtual' : currentEvent.event_type || 'In-Person'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse md:flex-row justify-between gap-3 lg:gap-0">
                        <div className="flex gap-3 md:w-[50%]">
                            <Link to={webRoutes.workforceEventDetail.replace(":id", `${currentEvent.id}`)} className="flex-1 bg-white text-center text-sm font-semibold py-2.5 rounded-lg hover:bg-yellow-50 transition-colors duration-200 shadow-lg">
                                Join This Event
                            </Link>
                            <button
                              onClick={(e) => handleBookmark(currentEvent.id, e)}
                              className={`p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center border border-white/30 ${
                                currentEvent.is_bookmarked
                                  ? 'bg-gold text-white'
                                  : 'bg-pale_yellow hover:bg-white/30'
                              }`}
                            >
                                <Bookmark className={`w-5 h-5 ${currentEvent.is_bookmarked ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {currentEvent.is_virtual
                              ? 'Online'
                              : currentEvent.venue_name || currentEvent.venue_address || 'Venue TBA'}
                          </span>
                        </div>
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