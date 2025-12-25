import { Bookmark, Building, Calendar, ClockCheck, Globe, MapPin, SearchIcon, Settings2 } from 'lucide-react'
import OngoingEventsCarousel from './OngoingEventsCarousel'
import OngoingEventContent from './OngoingEventContent'
import Scroll from '../Scroll'

  const getTopicsDisplay = (topics) => {
        if (!Array.isArray(topics) || topics.length === 0) return []
        return topics.slice(0, 3).sort((a, b) => b.length - a.length)
      }

const OngoingEvents = ({searchTerm, handleSearchChange, setShowFilters, showFilters, handleFilterChange, filters, clearFilters, filteredEvents}) => {
  return (
            <div className="p-2 py-4 mb-8">
              <div className="flex justify-between lg:items-center flex-col-reverse lg:flex-row gap-4 pb-4">
                <h3 className='text-2xl font-medium md:w-[50%] '>Ongoing Events</h3>
                <div className='flex gap-4 lg:w-[50%]'>
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events by title, organizer, or topic..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    Filter
                    <Settings2 className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
    
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="Conference">Conference</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Training">Training</option>
                        <option value="Networking">Networking</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="Certification">Certification</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                      >
                        <option value="">Any Time</option>
                        <option value="today">Today</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="open">Registration Open</option>
                        <option value="sold_out">Sold Out</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={clearFilters}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                    <span className="text-sm text-gray-500 py-2">
                      {filteredEvents.length} events found
                    </span>
                  </div>
                </div>
              )}
              <Scroll>
                <div className='flex gap-2 md:gap-6 min-w-min'>
              {filteredEvents.map((currentEvent, index) => (
                 <div className="w-[340px] md:w-[820px] h-full rounded-lg bg-gradient-to-br from-[#FFC000] to-[#FF1A00] p-4 lg:p-8 flex flex-col justify-between">
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
                            <button className="flex-1 bg-white font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg">
                                Join This Event
                            </button>
                            <button className="p-3 bg-pale_yellow hover:bg-white/30 border border-white/30 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                <Bookmark className="w-5 h-5" />
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