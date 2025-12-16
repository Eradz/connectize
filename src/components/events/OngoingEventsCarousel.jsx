import React, { useState, useRef } from 'react'
import { Bookmark, Building, Calendar, ClockCheck, Globe, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OngoingEventsCarousel = ({ filteredEvents, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const minSwipeDistance = 50

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
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? filteredEvents.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === filteredEvents.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  const getTopicsDisplay = (topics) => {
    if (!Array.isArray(topics) || topics.length === 0) return []
    return topics.slice(0, 3).sort((a, b) => b.length - a.length)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Carousel Container */}
      <div className="relative w-full overflow-hidden rounded-lg h-[500px] bg-gradient-to-br from-slate-800 to-slate-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
            custom={direction}
            className="absolute inset-0 w-full h-full"
          >
            {React.cloneElement(children, { filteredEvents: filteredEvents, currentIndex: currentIndex })}
            {/* {children} */}
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