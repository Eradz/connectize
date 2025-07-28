import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useMediaQuery } from "react-responsive";
import { SwiperSlide } from "swiper/react";
import { getProducts } from "../../../api-services/products";
import HeadingText from "../../HeadingText";
import { PostSlider } from "../feeds/DiscoverPostTabs";
import { ListCardSkeleton, ProductListCard } from "../markets/newlyListed";
import { usePageinatedProducts } from "../../../hooks/useProduct";

export default function NewProducts() {
  const { data, isLoading } = usePageinatedProducts();

  const products = data?.pages?.[0]?.data || [];

  const isDesktopScreen = useMediaQuery({ minWidth: "1400px" });
  const isLaptopScreen = useMediaQuery({ minWidth: "1028px" });
  const isBigMobile = useMediaQuery({ minWidth: "640px" });

  if (isLoading)
    return Array.from({ length }, (_, index) => (
      <ListCardSkeleton key={index} />
    ));
  return (
    <section className="space-y-4 mb-6 ">
      <HeadingText>You may also like</HeadingText>
      <section className="">
        <PostSlider
          array={products}
          customSlidesPerView={
            isDesktopScreen ? 4 : isLaptopScreen ? 3 : isBigMobile ? 2 : 1
          }
        >
          {products?.map((product) => {
            return (
              <SwiperSlide key={product?.id}>
                <ProductListCard
                  title={product?.title}
                  image={product?.images?.[0]?.image}
                  subtitle={product?.category}
                  companyName={product?.company?.company_name}
                  id={product?.id}
                />
              </SwiperSlide>
            );
          })}
        </PostSlider>
      </section>
    </section>
  );
}
