import React, { useState, useMemo } from 'react'
import { Bookmark, Building, Calendar, ClockCheck, Globe, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OngoingEventsCarousel = ({ filteredEvents }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Guard against empty events
  if (!filteredEvents || filteredEvents.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white">
        <p className="text-xl font-semibold">No events available</p>
      </div>
    )
  }

  const currentEvent = filteredEvents[currentIndex]

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredEvents.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === filteredEvents.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const getTopicsDisplay = (topics) => {
    if (!Array.isArray(topics) || topics.length === 0) return []
    return topics.slice(0, 3).sort((a, b) => b.length - a.length)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Carousel Container */}
      <div className="relative w-full overflow-hidden rounded-lg h-[500px] bg-gradient-to-br from-slate-800 to-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            custom={1}
            className="absolute inset-0 w-full h-full"
          >
            <div className="w-full h-full bg-gradient-to-br from-[#FFC000] to-[#FF1A00] p-8 flex flex-col justify-between">
              {/* Header Section */}
              <div className="flex-1 flex flex-col justify-start">
                <h2 className="text-4xl font-bold text-white mb-4">{currentEvent.title}</h2>
                
                <p className="text-lg text-blue-100 mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {currentEvent.organizer_name || 'Organizer'}
                </p>

                {/* Topics/Themes */}
                {getTopicsDisplay(currentEvent.topics).length > 0 && (
                  <div className="mb-6 flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Themes:</h3>
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
                <div className="flex justify-between mb-6">
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
                    <div className="flex items-center gap-3 px-2 py-1 border text-white border-white rounded-full w-fit h-[50%]">
                      <Globe className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {currentEvent.is_virtual ? 'Virtual' : currentEvent.event_type || 'In-Person'}
                      </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <div className="flex gap-3 w-[50%]">
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
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {/* <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all duration-200 border border-white/30"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all duration-200 border border-white/30"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button> */}
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center items-center gap-2">
        {filteredEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 h-3 bg-gradient-to-br from-[#FFC000]  to-[#FF8400]'
                : 'w-3 h-3 border border-[#FF8400] hover:bg-[#FFC000]'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default OngoingEventsCarousel