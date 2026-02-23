import React, { useState } from "react";
import { baseURL } from "../lib/helpers";
import ReusableModal from "./custom/ResusableModal";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const getImageSrc = (src) => (src.startsWith("http") ? src : baseURL + src);

const PostImageCollage = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");

  if (!images || images.length === 0) return null;

  const openModal = (src) => {
    setModalSrc(getImageSrc(src));
    setModalOpen(true);
  };

  // Single image — no carousel needed
  if (images.length === 1) {
    return (
      <>
        <section className="mt-3 rounded-lg overflow-hidden">
          <img
            src={getImageSrc(images[0])}
            alt="Post image"
            className="w-full max-h-[480px] object-cover cursor-pointer rounded-lg"
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

  // Multiple images — horizontal swipeable carousel
  return (
    <>
      <section className="post-carousel mt-3 relative rounded-lg overflow-hidden">
        {/* Slide counter badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm select-none pointer-events-none">
          {activeIndex + 1} / {images.length}
        </div>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          slidesPerView={1}
          spaceBetween={0}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="post-swiper !rounded-lg"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={getImageSrc(src)}
                alt={`Post image ${index + 1}`}
                className="w-full max-h-[480px] object-cover cursor-pointer"
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
