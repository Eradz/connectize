import { Bookmark, Building, Calendar, ClockCheck, Eye, Globe, MapPin, Share2 } from 'lucide-react';
import React from 'react'
import { webRoutes } from '../../lib/webRoutes';
import { Link } from 'react-router-dom';

const UpcomingEventContent = ({ filteredEvents, currentIndex }) => {
    const getLongestString = (themes) => {
    const longestStringArr = themes.sort((a, b) => a.length - b.length).reverse();
    return longestStringArr;
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
            const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
    //   weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
  };
    return (
      <div key={filteredEvents[currentIndex].id} className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] p-[0.9px] rounded-xl h-[490px]">
                <div className="bg-white rounded-xl border h-full">
                  {/* Event Image */}
                  <div className="relative h-[30%]">
                    <img
                      src={filteredEvents[currentIndex].image || 'https://picsum.photos/seed/energy-events/800/400'}
                      alt={filteredEvents[currentIndex].title}
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
                    
                       <button className="bg-pale_yellow text-gray-700 p-2 rounded-lg hover:bg-gold transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                      {}
                  <div className="p-4 pb-1 h-[58%] ">
                    {/* Organizer */}
                     {/* Title */}
                    <h3 className="font-semibold text-gray-900 pb-4 line-clamp-2">
                      {filteredEvents[currentIndex].title}
                    </h3>
                     <div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {filteredEvents[currentIndex].organizer_name || 'Organizer'}
                    </p>
    
                    {/* Location & Time */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {!filteredEvents[currentIndex].is_virtual ? 'Online' : (filteredEvents[currentIndex].venue_name || filteredEvents[currentIndex].venue_address || 'Venue TBA').slice(0, 20) + "..."}
                      </div>
                      <div className='flex items-center text-sm text-gray-600 gap-2'>
                        <span className='flex'>
                            <Calendar className="w-4 h-4 mr-2" />
                            {filteredEvents[currentIndex].start_date ? formatDate(filteredEvents[currentIndex].start_date) : 'TBD'}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                            <ClockCheck className="w-4 h-4 mr-2" />
                            {filteredEvents[currentIndex].start_date ? new Date(filteredEvents[currentIndex].start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            {/* {filteredEvents[currentIndex].end_date ? ` - ${new Date(filteredEvents[currentIndex].end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} */}
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
                                <span className="flex ml-1 bg-gradient-to-br from-[#FFC000] to-[#FF8400] bg-clip-text text-transparent capitalize">{filteredEvents[currentIndex].is_virtual ? 'Virtual' : filteredEvents[currentIndex].event_type}</span>
                                </div>
                            </div>
                        </div>

                          <div className='flex gap-4'>
                            <h4 className="font-semibold text-gray-900 mb-2">Theme:</h4>
                            {/* Topics (if any) */}
                            {Array.isArray(filteredEvents[currentIndex].topics) && filteredEvents[currentIndex].topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {getLongestString(filteredEvents[currentIndex].topics.slice(0, 3)).map((t, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-full">{t}</span>
                                ))}
                            </div>
                            )}
                          </div>
                    </div>
    
                  </div>
                    {/* Actions */}
                  <div className="rounded-b-xl flex space-x-2 h-[12%] py-3 px-2 border-t border-gray-300">
                      <Link
                        to={`${webRoutes.workforceEventDetail.replace(':id', filteredEvents[currentIndex].id)}`}
                        className="flex-1 bg-pale_yellow text-white text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                     
                      <button className="flex items-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors ">
                        <Share2 className="w-4 h-4 mr-1" />
                        {"Share"}
                      </button>
                  </div>
                </div>
                </div>
  )
}

export default UpcomingEventContent