import React, { useCallback, useEffect, useRef, useState } from "react";
import { baseURL } from "../lib/helpers";
import ReusableModal from "./custom/ResusableModal";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getImageSrc = (src) => (src.startsWith("http") ? src : baseURL + src);

/**
 * Detects the natural dimensions of an image and returns its aspect ratio.
 * Used to dynamically size the carousel container to fit the dominant image shape.
 */
const useImageDimensions = (images) => {
  const [containerStyle, setContainerStyle] = useState({ maxHeight: "480px" });

  useEffect(() => {
    if (!images || images.length === 0) return;

    // Load all images and find the dominant aspect ratio
    const promises = images.map(
      (src) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.src = getImageSrc(src);
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight, ratio: img.naturalWidth / img.naturalHeight });
          img.onerror = () => resolve({ width: 1, height: 1, ratio: 1 });
        })
    );

    Promise.all(promises).then((dims) => {
      // Use the median aspect ratio so one outlier doesn't skew the layout
      const ratios = dims.map((d) => d.ratio).sort((a, b) => a - b);
      const medianRatio = ratios[Math.floor(ratios.length / 2)];

      if (medianRatio < 0.65) {
        // Tall portrait — give more height
        setContainerStyle({ maxHeight: "560px", aspectRatio: "3 / 4" });
      } else if (medianRatio < 1.1) {
        // Square-ish
        setContainerStyle({ maxHeight: "520px", aspectRatio: "1 / 1" });
      } else if (medianRatio < 1.6) {
        // Standard landscape (4:3 ish)
        setContainerStyle({ maxHeight: "440px", aspectRatio: "4 / 3" });
      } else {
        // Wide/panoramic
        setContainerStyle({ maxHeight: "360px", aspectRatio: "16 / 9" });
      }
    });
  }, [images]);

  return containerStyle;
};

const PostImageCollage = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const swiperRef = useRef(null);
  const containerStyle = useImageDimensions(images);

  if (!images || images.length === 0) return null;

  const openModal = (src) => {
    setModalSrc(getImageSrc(src));
    setModalOpen(true);
  };

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === images.length - 1;

  const goPrev = useCallback((e) => {
    e.stopPropagation();
    swiperRef.current?.slidePrev();
  }, []);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    swiperRef.current?.slideNext();
  }, []);

  // Single image — no carousel needed, dynamic height
  if (images.length === 1) {
    return (
      <>
        <section className="mt-3 w-full rounded-lg overflow-hidden">
          <img
            src={getImageSrc(images[0])}
            alt="Post image"
            className="block w-full object-contain bg-gray-100 dark:bg-gray-800 cursor-pointer rounded-lg"
            style={{ maxHeight: "560px" }}
            onClick={() => openModal(images[0])}
          />
        </section>
        <ImageModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          src={modalSrc}
        />
      </>
    );
  }

  // Multiple images — horizontal swipeable carousel with arrows
  return (
    <>
      <section className="post-carousel group mt-3 relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Slide counter badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm select-none pointer-events-none">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Left arrow — visible on hover, hidden on first slide */}
        {!isFirst && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Right arrow — visible on hover, hidden on last slide */}
        {!isLast && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true, dynamicBullets: true }}
          slidesPerView={1}
          spaceBetween={0}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="post-swiper !rounded-lg"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index} className="!flex items-center justify-center" style={containerStyle}>
              <img
                src={getImageSrc(src)}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => openModal(src)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        src={modalSrc}
      />
    </>
  );
};

export default PostImageCollage;

const ImageModal = ({ isOpen, onClose, src }) => (
  <ReusableModal isOpen={isOpen} onClose={onClose} size="xl" title="Post image">
    <img src={src} alt="Post image" className="size-full rounded-md" />
  </ReusableModal>
);
