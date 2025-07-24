import { ChevronRight } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../../api-services/products";
import { useAuth } from "../../../context/userContext";
import { usePollAllCompanies } from "../../../hooks/usePolling";
import { useProductImages } from "../../../hooks/useProduct";
import { webRoutes } from "../../../lib/webRoutes";
import CustomTabs from "../../custom/tabs";

function NewlyListed() {
  const [searchParams] = useSearchParams();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const productCategory = searchParams.get("category") || "";

  const filteredProducts = useMemo(
    () =>
      productCategory
        ? products.filter(
            (product) =>
              product.category.toLowerCase() === productCategory.toLowerCase()
          )
        : products,
    [productCategory, products]
  );

  const newlyListedProducts = useMemo(() => products?.slice(0, 6), [products]);

  const tabs = useMemo(
    () => [
      { label: "All Products", products: filteredProducts },
      { label: "Newly Listed", products: newlyListedProducts },
    ],
    [filteredProducts, newlyListedProducts]
  );

  return (
    <section className="container">
      <CustomTabs
        tabsHeading={tabs.map((tab) => tab.label)}
        tabsPanels={tabs.map((tab, index) => (
          <div
            key={index}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4"
          >
            {isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <ListCardSkeleton key={index} />
                ))
              : tab.products.map((product) => {
                  return (
                    <ProductListCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      subtitle={product.category}
                      companyName={product?.company?.company_name || ""}
                    />
                  );
                })}
          </div>
        ))}
      />
    </section>
  );
}

export default NewlyListed;

export const ProductListCard = ({
  image,
  title,
  subtitle,
  id,
  isSummary = false,
  companyName,
}) => {
  const { data: companies } = usePollAllCompanies();
  const company = companies?.results?.find(
    (comp) => comp?.company_name?.toLowerCase() === companyName?.toLowerCase()
  );

  const { productImage } = useProductImages(id);
  const imageUrl = productImage?.[0]?.image || image || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={clsx(
        "rounded-lg overflow-hidden flex items-start flex-col gap-2",
        {
          "bg-white p-2": isSummary,
        }
      )}
    >
      <img
        src={imageUrl}
        className={clsx("w-full h-[300px] rounded-lg", {
          "md:h-[200px]": isSummary,
        })}
        alt={title || "Product"}
      />
      <div className="flex sm:flex-col items-start justify-between gap-4 sm:!gap-2 w-full">
        <div>
          <Link
            to={`/products/${id}`}
            className="font-bold text-xl sm:text-lg capitalize line-clamp-1"
          >
            {title}
          </Link>
          <span className="font-semibold text-base">{subtitle}</span>
        </div>
        {!isSummary && <ChatSellerLink recipientId={company?.user?.id} />}
      </div>
    </motion.div>
  );
};

export const ListCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden flex items-start flex-col gap-2">
    <div className="w-full h-[240px] skeleton rounded" />
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="h-6 skeleton rounded w-3/4" />
      <div className="h-4 skeleton rounded w-1/2" />
    </div>
    <div className="w-1/3 h-10 skeleton rounded mt-2" />
  </div>
);

export const ChatSellerLink = ({ text = "Chat seller", to, recipientId }) => {
  const { user: currentUser } = useAuth();

  const url = recipientId
    ? `${webRoutes.messages}/?room_name=room_${currentUser?.id}_${recipientId}`
    : to;
  return (
    <>
      {currentUser?.id !== recipientId && (
        <Link
          to={url}
          className="shrink-0 flex items-center bg-black py-2 xs:py-2 !text-white px-4 xs:text-xs rounded-full group w-fit"
        >
          <span>{!recipientId ? "View" : text}</span>
          <span className="text-custom_grey ml-1">|</span>
          <ChevronRight className="!size-4 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
        </Link>
      )}
    </>
  );
};
