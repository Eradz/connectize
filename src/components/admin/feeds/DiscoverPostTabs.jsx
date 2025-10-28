import { Avatar } from "@chakra-ui/react";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { bookmarkProduct } from "../../../api-services/products";
import { bookmarkService } from "../../../api-services/services";
import { useAuth } from "../../../context/userContext";
import { Bookmark, VerifiedIcon } from "../../../icon";
import CustomTabs from "../../custom/tabs";
import { MarkdownComponent } from "../../MarkDownComponent";
import { avatarStyle, ConJoinedImages } from "../../ResponsiveNav";
import { ConjoinedAvatarSkeleton } from "./DiscoverPosts";

import { ButtonWithTooltipIcon } from "../../ButtonWithTooltipIcon";
import { cn } from "../../../lib/utils";
import { useGetServicesFirstPage } from "../../../hooks/useServices";
import { useGetProductsFirstPage } from "../../../hooks/useProduct";

const DiscoverPostTabs = () => {
  const { data: products, isLoading: productsLoading } =
    useGetProductsFirstPage();

  const { data: services, isLoading: servicesLoading } =
    useGetServicesFirstPage();

  const productsForSlider = products?.map((product) => {
    return {
      isService: false,
      title: product?.title,
      image: product?.images?.[0]?.image,
      summary: product?.description,
      companyName: product?.company?.company_name,
      logo: product?.company?.logo,
      verified: product?.featured,
      url: "/products/" + product.id,
      slug: product?.company?.slug,
      whole: product,
    };
  });

  const servicesForSlider = services?.map((service) => {
    return {
      isService: true,
      title: service?.title,
      summary: service?.description,
      companyName: service?.company?.company_name,
      logo: service?.company?.logo,
      verified: service?.featured,
      url: "/services/" + service.id,
      slug: service?.company?.slug,
      whole: service,
    };
  });

  return (
    <CustomTabs
      variant="unstyled"
      tabsStyle=""
      className="sm:container md:!p-0"
      tabsHeading={["Products", "Services"]}
      tabsPanels={[
        <PostSlider
          array={productsForSlider}
          fallback="products"
          arrayLoading={productsLoading}
        />,
        <PostSlider
          fallback="services"
          array={servicesForSlider}
          arrayLoading={servicesLoading}
        />,
      ]}
    />
  );
};

export default DiscoverPostTabs;

export const PostSlider = ({
  array = [],
  minWidth = 920,
  children,
  customSlidesPerView,
  delay = 10000,
  arrayLoading = false,
  fallback,
}) => {
  const [loading, setLoading] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(1);

  const isTabletScreen = useMediaQuery({ minWidth });

  const setUpSlider = useCallback(() => {
    setLoading(false);
    setSlidesPerView(isTabletScreen ? 2 : 1);
  }, [isTabletScreen]);

  useEffect(() => setUpSlider(), [setUpSlider]);

  return arrayLoading || loading ? (
    <PostCardSkeleton />
  ) : array.length <= 0 ? (
    <div className="w-full h-24 flex items-center justify-center">
      <p className="text-gray-500 text-sm">
        No {fallback} available at the moment.
      </p>
    </div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={10}
        loop={array.length > 2}
        slidesPerView={
          array.length === 1 ? 1 : customSlidesPerView || slidesPerView
        }
        autoplay={{
          delay,
          pauseOnMouseEnter: true,
          disableOnInteraction: true,
        }}
        pagination={{ clickable: true }}
        className="z-0"
      >
        {children
          ? children
          : array.map((item, index) => (
              <SwiperSlide className="h-auto self-stretch" key={index}>
                <PostCard {...item} className={"h-full"} />
              </SwiperSlide>
            ))}
      </Swiper>
    </motion.div>
  );
};

export const PostCard = ({
  isService,
  title,
  summary,
  companyName,
  slug,
  logo,
  verified,
  url,
  whole,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-4 lg:!px-3 !w-full max-w-full bg-white transition-colors hover:bg-services_yellow/80 rounded-md flex flex-col shrink-0 overflow-hidden min-h-[280px]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold capitalize text-lg line-clamp-1">
          {title || "Remote Monitoring and Control"}
        </h3>
        <div className="mr-5">
          <BookMarkButton
            service={isService ? whole : null}
            product={!isService ? whole : null}
          />
        </div>
      </div>

      {/* <div className="flex mt-2">
        {[1, 2, 3].map((_, index) => (
          <StarFilledIcon key={index} />
        ))}
        {[1, 2].map((_, index) => (
          <StarOutlinedIcon key={index} />
        ))}
      </div> */}

      <div className="mt-3 flex gap-2 min-h-0 overflow-hidden min-w-0">
        <div className="line-clamp-3 flex-1 overflow-hidden break-words min-w-0">
          <MarkdownComponent
            markdownContent={
              summary ||
              "This is a tweet. It can be long, or short. Depends on what you have to say. It can have some hashtags too."
            }
          />
        </div>
      </div>

      {/* <div className="h-full" /> */}
      {/* 
      {whole?.likes && (
        <ConJoinedImages
          size={30}
          sizeVariant="sm"
          animate={whole?.likes?.length > 1}
          array={whole?.likes.slice(0, 5).map((post) => ({
            name: `${post?.user?.first_name} ${post?.user?.last_name}`,
            src: post?.user?.avatar,
            href: `/co/${post?.user?.id}`,
          }))}
        />
      )} */}

      <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t shrink-0 min-w-0">
        <div className="flex gap-2 items-center min-w-0 flex-1">
          <Link to={`/${slug || companyName}`} className="relative shrink-0">
            <Avatar
              src={logo || "images/default-company-logo.png"}
              alt={companyName}
              name={companyName || ""}
              className={avatarStyle}
              size="md"
            />
            {verified && <VerifiedIcon className="absolute bottom-0 right-0" />}
          </Link>
          <Link
            to={`/${slug || companyName}`}
            className="text-sm font-bold capitalize line-clamp-1 min-w-0 overflow-hidden text-ellipsis"
          >
            {companyName || "West Land Oil"}
          </Link>
        </div>

        <Link
          to={url || ""}
          // replace
          className="bg-gold hover:opacity-60 rounded-full py-2 px-6 text-sm shrink-0 whitespace-nowrap mr-5"
        >
          View
        </Link>
      </div>
    </motion.div>
  );
};

export const PostCardSkeleton = React.memo(() => (
  <div className="p-3 lg:px-3 rounded-md bg-white flex flex-col h-80 w-full">
    <div className="flex items-start justify-between gap-2">
      <div className="w-2/3 h-5 rounded-md skeleton" />
      <div className="w-6 h-6 rounded skeleton" />
    </div>

    <div className="my-6 space-y-3 ">
      <div className="h-2.5 skeleton rounded w-4/6" />
      <div className="h-2.5 skeleton rounded w-5/6" />
      <div className="h-2.5 skeleton rounded w-4/6" />
      <div className="h-2.5 skeleton rounded w-5/6" />
    </div>

    <div className="h-full" />

    <ConjoinedAvatarSkeleton />

    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
      <div className="flex gap-2 items-center">
        <div className="relative">
          <div className="w-12 h-12 skeleton rounded-full" />
        </div>
        <div className="w-28 h-3 skeleton rounded" />
      </div>

      <div className="skeleton rounded-full py-2 px-10 h-8" />
    </div>
  </div>
));

export const BookMarkButton = ({ service, product }) => {
  const { user: currentUser } = useAuth();
  const userHasBookmarked = service
    ? service?.likes?.find(
        (serviceProp) => serviceProp?.user?.id === currentUser?.id
      )
    : product
      ? product?.likes?.find(
          (productProp) => productProp?.user?.id === currentUser?.id
        )
      : false;
  const [bookmarked, setBookmarked] = useState(userHasBookmarked);
  const [disabled, setDisabled] = useState(false);

  const handleBookmark = async () => {
    if (!service && !product) return;

    setBookmarked(!bookmarked);
    setDisabled(true);
    if (product) {
      await bookmarkProduct(product?.id, product, userHasBookmarked);
    } else if (service) {
      await bookmarkService(service.id, service, userHasBookmarked);
    }
    setDisabled(false);
  };

  return (
    <ButtonWithTooltipIcon
      tip={`Bookmark ${
        service ? service?.title : product ? product?.title : "this"
      }`}
      onClick={handleBookmark}
      IconName={bookmarked ? BookmarkFilledIcon : Bookmark}
      iconClassName="!size-8 xs:!size-7"
      disabled={disabled}
    />
  );
};
