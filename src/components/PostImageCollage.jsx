import React, { useCallback, useRef, useState } from "react";
import { baseURL } from "../lib/helpers";
import ReusableModal from "./custom/ResusableModal";
import { NAVIGATION_BUTTONS } from "../lib/slide_button";
import { Button } from "@chakra-ui/react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const getImageSrc = (src) => (src.startsWith("http") ? src : baseURL + src);

const getAspectRatio = (src) => {
  const img = new Image();
  img.src = getImageSrc(src);
  return new Promise((resolve) => {
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve(aspectRatio);
    };
  });
};

const arrangeImages = async (images) => {
  const aspectRatios = await Promise.all(images.map((src) => getAspectRatio(src)));
  return images.map((src, index) => ({
    src,
    aspectRatio: aspectRatios[index],
    type: aspectRatios[index] > 1 ? "landscape" : "portrait",
  }));
};

const PostImageCollage = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const swiperRef = useRef(null);
  const [processedImages, setProcessedImages] = useState([]);

  React.useEffect(() => {
    arrangeImages(images).then(setProcessedImages);
  }, [images]);

  const handleNavigation = useCallback((action) => {
    const swiperInstance = swiperRef.current;
    if (swiperInstance) {
      action === "prev" ? swiperInstance.slidePrev() : swiperInstance.slideNext();
      setActiveSlideIndex(swiperInstance.activeIndex);
    }
  }, []);

  if (!processedImages.length) return null;

  return (
    <>
      <section
        className={`mt-3 grid gap-2 rounded-lg overflow-hidden ${
          processedImages.length === 1
            ? "grid-cols-1"
            : processedImages.length === 2
            ? "grid-cols-2"
            : processedImages.length === 3
            ? "grid-cols-2 grid-rows-2"
            : "grid-cols-2 grid-rows-2"
        }`}
      >
        {processedImages.slice(0, 4).map((img, index) => (
          <PostImage src={img.src} key={index} type={img.type} />
        ))}

        {processedImages.length > 4 && (
          <div
            className="relative size-full flex text-white text-lg font-bold rounded-lg cursor-pointer overflow-hidden"
            onClick={() => setIsOpen(true)}
          >
            <span className="z-10 size-full min-h-24 bg-black/40 hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
              +{processedImages.length - 4} More
            </span>
            <img
              src={getImageSrc(processedImages[4].src)}
              className="z-0 absolute rounded-md object-cover"
              alt="open more images"
            />
          </div>
        )}
      </section>

      <ReusableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footerContent={
          <div className="flex gap-4 items-center justify-between">
            <div className="flex text-xs gap-1 items-center">
              <strong>
                {activeSlideIndex + 1} / {processedImages.length - 4} image
                {processedImages.length > 1 ? "s" : ""}
              </strong>
            </div>
            <div className="flex items-center">
              {NAVIGATION_BUTTONS.map((button) => (
                <Button
                  key={button.id}
                  onClick={() => handleNavigation(button.action)}
                  disabled={processedImages.length === 1}
                  className="!bg-transparent hover:!text-custom_blue !text-gray-600 first:flex-row-reverse active:scale-95 !text-sm xs:!text-xs"
                >
                  <span>{button.text}</span>
                  {button.icon}
                </Button>
              ))}
            </div>
          </div>
        }
        title={"Post Image"}
        size="4xl"
      >
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          centeredSlides
          spaceBetween={10}
          className="!z-0"
        >
          {processedImages.slice(4).map((img, index) => (
            <SwiperSlide key={index} className="!h-auto rounded-md overflow-hidden">
              <img
                src={getImageSrc(img.src)}
                className="!size-full block cursor-pointer"
                alt="Images for post"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </ReusableModal>
    </>
  );
};

export default PostImageCollage;

const PostImage = ({ src, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg cursor-pointer ${
          type === "landscape" ? "col-span-2 row-span-1" : "col-span-1 row-span-2"
        }`}
      >
        <img
          src={getImageSrc(src)}
          alt="Post-image"
          className="size-full object-cover rounded-md"
          onClick={() => setIsOpen(true)}
        />
      </div>

      <ImageModal isOpen={isOpen} onClose={() => setIsOpen(false)} src={getImageSrc(src)} />
    </>
  );
};

const ImageModal = ({ isOpen, onClose, src }) => (
  <ReusableModal isOpen={isOpen} onClose={onClose} size="xl" title="Post image">
    <img src={src} alt="Post-image" className="size-full rounded-md" />
  </ReusableModal>
);
