import { Avatar, Button, Divider } from "@chakra-ui/react";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getSingleCompany } from "../../../api-services/companies";
import { bookmarkProduct } from "../../../api-services/products";
import { useAuth } from "../../../context/userContext";
import { Bookmark } from "../../../icon";
import { NAVIGATION_BUTTONS } from "../../../lib/slide_button";
import { ProductDetailSkeleton } from "../../../pages/market/product";
import HeadingText from "../../HeadingText";
import { MarkdownComponent } from "../../MarkDownComponent";
import { avatarStyle } from "../../ResponsiveNav";
import { ChatSellerLink } from "../markets/newlyListed";

function Productdetails({ product }) {
  const swiperRef = useRef(null);
  const { user: currentUser } = useAuth();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const { data: company, isLoading } = useQuery({
    queryKey: ["companies", product?.company],
    queryFn: () => getSingleCompany(product?.company),
    enabled: !!product?.company,
  });

  // Memoized navigation handler
  const handleNavigation = useCallback((action) => {
    const swiperInstance = swiperRef.current;
    if (swiperInstance) {
      action === "prev"
        ? swiperInstance.slidePrev()
        : swiperInstance.slideNext();
      setActiveSlideIndex(swiperInstance.activeIndex);
    }
  }, []);

  // Determine if the current user has liked the product
  const hasBookmarked = product?.likes?.some(
    (like) => like.user.id === currentUser?.id
  );

  if (isLoading) return <ProductDetailSkeleton />;

  return (
    <>
      <section className="flex max-lg:flex-col items-start justify-center gap-4">
        {product?.images?.length > 0 ? (
          <div className="w-full lg:w-1/2">
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              modules={[Pagination, Autoplay]}
              autoplay={{ delay: 10000 }}
              pagination={{ clickable: true }}
              slidesPerView={1}
              className="!z-0"
            >
              {product.images.map((image) => (
                <SwiperSlide
                  key={image.id}
                  className="h-[300px] md:h-[350px] rounded-md overflow-hidden relative group"
                >
                  <img
                    src={image?.image}
                    className="size-full"
                    alt={image?.caption || product?.title || "product"}
                  />
                  <div className="w-full absolute bottom-0 px-4 py-2 xs:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-white max-xs:hidden">
                    <small>{image?.caption}</small>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {product?.images?.length > 1 && (
              <div className="flex gap-4 items-center justify-between">
                <div className="flex text-xs gap-1 items-center">
                  <span>{activeSlideIndex + 1}</span>
                  <span className="text-gray-300">/</span>
                  <strong>{product?.images?.length}</strong>
                </div>
                <div className="flex items-center">
                  {NAVIGATION_BUTTONS.map((button) => (
                    <Button
                      key={button.id}
                      onClick={() => handleNavigation(button.action)}
                      disabled={product?.images?.length === 1}
                      className="!bg-transparent hover:!text-custom_blue !text-gray-600 first:flex-row-reverse active:scale-95 !text-sm"
                    >
                      <span>{button.text}</span>
                      {button.icon}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={"/images/produc_drum.jpeg"}
            className="w-full md:w-1/2 max-h-[300px] shrink-0"
            alt={product?.title || "product"}
          />
        )}

        <div className="space-y-4 lg:w-1/2 shrink-0">
          <div className="space-y-2">
            <HeadingText>{product.title}</HeadingText>
            <h5>{product.sub_title}</h5>
          </div>
          <Divider />
          <div className="space-y-2">
            <h6 className="text-xl font-bold">Description</h6>
            <MarkdownComponent
              markdownContent={product.description}
              markdownTitle="Product description"
              isDescription
            />
          </div>
          <div className="flex gap-4 items-center">
            <ChatSellerLink recipientId={company?.user?.id} />
            <FavoriteButton hasBookmarked={hasBookmarked} product={product} />
          </div>
        </div>
      </section>

      <section className="gap-4 flex max-lg:flex-col">
        <section className="space-y-4 lg:w-1/2 shrink-0">
          <HeadingText>Location</HeadingText>
          <iframe
            src="https://www.google.com/maps/embed?pb=..."
            className="!w-full !min-h-[300px]"
            loading="lazy"
            title={company?.city || company?.state || company?.country}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          {/* <HeadingText>Current Location</HeadingText>
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
            `${company?.address || ""} ${company?.city || ""} ${company?.state || ""} ${company?.country || ""}`
          )}`}
          className="!w-full !min-h-[300px]"
          loading="lazy"
          title="Current Location"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe> */}
        </section>

        <section className="space-y-4 lg:w-1/2 shrink-0">
          <HeadingText>Seller's information</HeadingText>
          <div className="flex items-center gap-3">
            <Avatar
              src={company?.logo || "/images/default-company-logo.png"}
              className={avatarStyle}
              size="lg"
              name={product?.company}
            />
            <div className="flex flex-col">
              <Link
                to={`/${product?.company?.replace(" ", "-")}`}
                className="font-bold capitalize"
              >
                {product?.company || ""}
              </Link>
              <span className="text-gray-400 text-sm">
                since{" "}
                {new Date(company?.registration_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

function FavoriteButton({ hasBookmarked, product }) {
  const [bookmarked, setBookmarked] = useState(hasBookmarked);
  const [disabled, setDisabled] = useState(false);

  const handleBookmark = async () => {
    setBookmarked((prev) => !prev); // Optimistic UI update
    setDisabled(true);
    await bookmarkProduct(product.id, product, bookmarked);
    setDisabled(false);
  };

  return (
    <button
      className="rounded-full px-4 py-1.5 border !border-gray-200/50 flex items-center justify-center gap-1 text-sm font-semibold disabled:cursor-not-allowed"
      onClick={handleBookmark}
      disabled={disabled}
    >
      {bookmarked ? (
        <BookmarkFilledIcon className="size-5" />
      ) : (
        <Bookmark className="!size-5" />
      )}
      <span>Bookmark Product</span>
    </button>
  );
}

export default Productdetails;
