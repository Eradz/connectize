import { Bookmark, Building, Calendar, ClockCheck, Globe, MapPin } from 'lucide-react'
import React from 'react'

const OngoingEventsCarousel = ({filteredEvents}) => {
     const getLongestString = (themes) => {
    const longestStringArr = themes.sort((a, b) => a.length - b.length).reverse();
    return longestStringArr;
  };

  return (
    <div className="w-full text-white bg-blue-500 flex gap-2 overflow-hidden h-[400px] p-4">
        {filteredEvents.map(event => (
            <div key={event.id} className=" bg-red-500 h-full w-[1000px] p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold">{event.title}</h4>
               <p className="text-sm mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {event.organizer_name || 'Organizer'}
                </p>
                <div className='flex gap-4'>
                  <h4 className="font-semibold  mb-2">Theme:</h4>
                  {/* Topics (if any) */}
                  {Array.isArray(event.topics) && event.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                  {getLongestString(event.topics.slice(0, 3)).map((t, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-full">{t}</span>
                  ))}
                  </div>
                  )}
                </div>
                <div className='h-[150px] w-full bg-[#F8F9FA26]/15'>
                <div className='flex'>
                  <div className='flex flex-col text-sm gap-2'>
                    <span className='flex'>
                        <Calendar className="w-4 h-4 mr-2" />
                        {"Today"}
                    </span>
                    <div className="flex items-center text-sm ">
                        <ClockCheck className="w-4 h-4 mr-2" />
                        {"Currently Ongoing"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] rounded-full p-[1px] text-xs font-medium text-gray-700 flex items-center w-fit">
                    <div className='bg-white flex items-center px-[10px] py-[7px] rounded-full'>
                    {/* {getTypeIcon(event.is_virtual, event.event_type)} */}
                    <Globe className="w-4 h-4 text-[#FFC000]" />
                    <span className="flex ml-1 bg-gradient-to-br from-[#FFC000] to-[#FF8400] bg-clip-text text-transparent capitalize">{event.is_virtual ? 'Virtual' : event.event_type}</span>
                    </div>
                    </div>
                </div>
                <div className='flex justify-between w-full'>
                  <div className='flex gap-2 w-[50%]'>
                    <button
                       className="flex-1 bg-white text-gray-600 text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                    >
                       Join This Event 
                    </button>
                    <button className="bg-pale_yellow text-gray-700 p-2 rounded-lg hover:bg-gold transition-colors">
                                            <Bookmark className="w-4 h-4" />
                                          </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 w-[50%]">
                      <MapPin className="w-4 h-4 mr-2" />
                      {!event.is_virtual ? 'Online' : (event.venue_name || event.venue_address || 'Venue TBA').slice(0, 20) + "..."}
                      </div>
                </div>
                </div>
            </div>
          ))}
    </div>
  )
}

export default OngoingEventsCarousel