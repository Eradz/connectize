import { ChevronRight } from "@mui/icons-material";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../../api-services/products";
import { useAuth } from "../../../context/userContext";
import { usePollAllCompanies } from "../../../hooks/usePolling";
import { useProductImages } from "../../../hooks/useProduct";
import { webRoutes } from "../../../lib/webRoutes";
import CustomTabs from "../../custom/tabs";
import PrimaryButton from "../../PrimaryButton";

function NewlyListed({ companyId }) {
  return (
    <section className="container">
      <CustomTabs
        tabsHeading={["All Products", "Newly Listed"]}
        tabsPanels={[
          // used `|| undefined` because if the `companyId` is an empty string it would still be falsy, and it would be sent to the server as an empty string i.e `?company=""`
          <DisplayAllProducts companyId={companyId || undefined} />,
          <DisplayNewlyListedProducts companyId={companyId || undefined} />,
        ]}
      />
    </section>
  );
}

function DisplayAllProducts({ companyId }) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "all", { companyId }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getProducts(
        { page_size: 2, page: pageParam, company: companyId || undefined },
        true
      );
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) return;

      const lastPageUrl = new URL(lastPage.next);

      let nextPage = lastPageUrl.searchParams.get("page");

      if (!nextPage) return;
      let nextPageAsNumber = parseInt(nextPage);

      if (!nextPageAsNumber) return;

      return nextPageAsNumber;
    },
  });

  // these might be needed later or even better moved to the backend
  // const [searchParams] = useSearchParams();
  // const productCategory = searchParams.get("category") || "";

  // const filteredProducts = useMemo(
  //   () =>
  //     productCategory
  //       ? products.filter(
  //           (product) =>
  //             product.category.toLowerCase() === productCategory.toLowerCase()
  //         )
  //       : products,
  //   [productCategory, products]
  // );

  return (
    <div className="">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4">
        {isLoading ? (
          <DefaultSkelecton />
        ) : (
          data?.pages?.map((group) => {
            return group?.data?.map((product) => {
              return (
                <ProductListCard
                  key={product.id}
                  id={product.id}
                  image={product?.images?.[0].image}
                  title={product.title}
                  subtitle={product.category}
                  companyName={product?.company?.company_name || ""}
                  company={product?.company}
                />
              );
            });
          })
        )}

        {isFetching && isFetchingNextPage && <DefaultSkelecton length={4} />}
      </div>

      {hasNextPage && !isFetchingNextPage && (
        <div
          className={clsx("mt-10 flex justify-center", {
            "animate-pulse": isFetching,
          })}
        >
          <PrimaryButton
            onClick={fetchNextPage}
            disabled={!hasNextPage || isFetching || isFetchingNextPage}
          >
            Load More
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

function DefaultSkelecton({ length = 6 }) {
  return Array.from({ length }, (_, index) => <ListCardSkeleton key={index} />);
}
function DisplayNewlyListedProducts({ companyId }) {
  /**
   * @todo Make a request to get real newly listed data from the server when that feature has been implemented on the server. And also find a way to prevent this component from fething products when it has not been mounted.
   */
  const { data, isLoading } = useInfiniteQuery({
    queryKey: ["products", "all", { companyId }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getProducts(
        { page_size: 2, page: pageParam, company: companyId || undefined },
        true
      );
    },
    getNextPageParam: () => {
      return;
    },
  });
  // the products used right now in this section is the same thing with thoses in the `DisplayAllProducts. This is because the feature of getting newly listed products as not been implemented on the server yet. So to avoid making an entirely new request i decided to make this component share requests with `DisplayAllProducts` Component.

  const newlyListedProducts = data?.pages?.[0]?.data;
  // const newlyListedProducts = useMemo(() => products?.slice(0, 6), [products]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4">
      {isLoading ? (
        <DefaultSkelecton />
      ) : (
        newlyListedProducts?.map((product) => {
          return (
            <ProductListCard
              key={product.id}
              image={product?.images?.[0].image}
              id={product.id}
              title={product.title}
              subtitle={product.category}
              companyName={product?.company?.company_name || ""}
              company={product?.company}
              // company={product?.company}
            />
          );
        })
      )}
    </div>
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
  company,
}) => {
  // const { data: companies } = usePollAllCompanies();
  // const company = companies?.results?.find(
  //   (comp) => comp?.company_name?.toLowerCase() === companyName?.toLowerCase()
  // );

  // const { productImage } = useProductImages(id);
  // const imageUrl = productImage?.[0]?.image || image || "";

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
      <Link to={"/products/" + id} className="w-full">
        <img
          src={image}
          className={clsx("w-full h-[300px] rounded-lg object-cover", {
            "md:h-[200px]": isSummary,
          })}
          alt={title || "Product"}
        />
      </Link>
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
