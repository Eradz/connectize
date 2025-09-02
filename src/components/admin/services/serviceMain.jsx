import clsx from "clsx";
import { PostCard, PostCardSkeleton } from "../feeds/DiscoverPostTabs";
import PrimaryButton from "../../PrimaryButton";
import { usePageinatedServices } from "../../../hooks/useServices";
import { CreateNewLink } from "../markets/carousel";
import ReusableModal from "../../custom/ResusableModal";
import { useState } from "react";
import { usePageination } from "../../../hooks/usePagination";
import { getServiceCategories } from "../../../api-services/services";
import { useSearchParams } from "react-router";
import HeadingText from "../../HeadingText";
import { CheckIcon } from "@radix-ui/react-icons";
import { FilterOutlined } from "@ant-design/icons";

function ServiceMain({ isOverview, companyId, category }) {
  const [showMore, setShowMore] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  //
  const [sortBy, setSortBy] = useState(null);
  //
  const filter = {
    sortBy,
    category: searchParams.get("scat") || "",
  };

  return (
    <div className="">
      <div className="flex items-center mb-2">
        <button
          onClick={() => setShowMore(true)}
          className={clsx(
            "md:hidden relative px-5 py-2.5 rounded-full hover:bg-opacity-80 transition-all duration-300 flex items-center gap-1 text-sm",
            {
              "bg-white border": sortBy !== "featured",
              "bg-gold border-gold": sortBy === "featured",
            }
          )}
        >
          <FilterOutlined className={"size-4 text-lg"} />
          <span className="">Filter Services</span>
        </button>
        <button
          onClick={() => setSortBy(sortBy === "featured" ? null : "featured")}
          className={clsx(
            "max-md:hidden relative px-5 py-2.5 rounded-full hover:bg-opacity-80 transition-all duration-300 flex items-center gap-1 text-sm",
            {
              "bg-white border": sortBy !== "featured",
              "bg-gold border-gold": sortBy === "featured",
            }
          )}
        >
          <span className="">Featured</span>
        </button>
        <button
          onClick={() =>
            setSortBy(sortBy === "most-recent" ? null : "most-recent")
          }
          className={clsx(
            "max-md:hidden relative px-5 py-2.5 rounded-full hover:bg-opacity-80 transition-all duration-300 flex items-center gap-1 text-sm",
            {
              "bg-white border": sortBy !== "most-recent",
              "bg-gold border-gold": sortBy === "most-recent",
            }
          )}
        >
          <span className="capitalize">Most Recent</span>
        </button>

        <div className="md:hidden">
          <FilterModal
            defaultFilter={filter}
            isOpen={showMore}
            onClose={() => setShowMore(false)}
            setFilter={(newFilter) => {
              setSortBy(newFilter.sortBy);

              const newParams = searchParams;

              if (newFilter?.category?.id) {
                newParams.set("scat", newFilter.category.id);
              } else {
                newParams.delete("scat");
              }

              if (newFilter.sortBy) {
                newParams.set("sortBy", newFilter.sortBy);
              } else {
                newParams.delete("sortBy");
              }
              setSearchParams(newParams);
              setShowMore(false);
            }}
          />
        </div>
      </div>
      <PostCardWrapper
        isOverview={isOverview}
        companyId={companyId || undefined}
        category={category || undefined}
        sortBy={sortBy || undefined}
      />

      <CreateNewLink url="/services/add" text="Add new service" />
    </div>
  );
}

export default ServiceMain;

function FilterModal({ isOpen, defaultFilter, setFilter, onClose }) {
  const [newFilter, setNewFilter] = useState(defaultFilter);

  const { data: categoriesPaginated, isLoading } = usePageination({
    queryKey: ["serviceCategories", "all"],
    queryFn: async ({ pageParam }) => {
      return await getServiceCategories(
        { page_size: 3, page: pageParam },
        true
      );
    },
    // enabled: !!pathname,
  });

  function setSortBy(sortBy) {
    setNewFilter((p) => ({
      ...p,
      sortBy: sortBy === p.sortBy ? null : sortBy,
    }));
  }
  function setCategory(cat) {
    setNewFilter((p) => ({ ...p, category: cat }));
  }
  return (
    <ReusableModal
      isOpen={isOpen}
      primaryAction={() => {
        setFilter(newFilter);
      }}
      primaryText="Apply"
      size="sm"
      onClose={() => {
        setNewFilter(defaultFilter);
        onClose();
      }}
      title={"Filter service"}
    >
      <HeadingText heading="sub-heading">Sort by</HeadingText>

      <div
        onClick={() => setSortBy("featured")}
        className={clsx(
          "mb-1 transition-colors duration-300 py-2 px-3 rounded-md flex items-center gap-2 text-black cursor-pointer",
          {
            "bg-light_grey": newFilter.sortBy === "featured",
            "hover:bg-light_grey/60": newFilter.sortBy !== "featured",
          }
        )}
      >
        <span>Featured</span>
        {newFilter === "featured" && <CheckIcon className={"size-4 text-lg"} />}
      </div>
      <div
        onClick={() => setSortBy("most-recent")}
        className={clsx(
          "mb-2 transition-colors duration-300 py-2 px-3 rounded-md flex items-center gap-2 text-black cursor-pointer",
          {
            "bg-light_grey": newFilter.sortBy === "most-recent",
            "hover:bg-light_grey/60": newFilter.sortBy !== "most-recent",
          }
        )}
      >
        <span>Most Recent</span>

        {newFilter === "featured" && <CheckIcon className={"size-4 text-lg"} />}
      </div>
      <HeadingText heading="sub-heading">Category</HeadingText>
      <div
        className={`flex px-3 items-center gap-2 py-2 mb-1 rounded-md cursor-pointer ${
          !newFilter.category?.id
            ? "bg-light_grey  font-medium"
            : "hover:bg-light_grey/60"
        } `}
        onClick={() => setCategory(null)}
      >
        <span className="line-clamp-2">All services</span>
      </div>
      {categoriesPaginated?.pages?.map((page) =>
        page?.data?.map((item, index) => {
          return (
            <div
              key={index}
              className={`flex px-3 items-center gap-2 py-2  mb-1 rounded-md cursor-pointer ${
                item.id === newFilter.category?.id
                  ? "bg-light_grey  font-medium"
                  : "hover:bg-light_grey/60"
              } `}
              onClick={() => setCategory(item)}
            >
              <span className="line-clamp-2">{item.name}</span>
            </div>
          );
        })
      )}
    </ReusableModal>
  );
}
export const PostCardWrapper = ({
  isOverview = false,
  companyId,
  category,
  sortBy,
}) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = usePageinatedServices({ companyId, category, sortBy });

  const page1Length = data?.pages?.[0]?.data?.length;

  return (
    <div className="">
      <section
        className={clsx("bg-white rounded-md p-2 grid gap-x-3 gap-y-4 ", {
          "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3":
            !isOverview && page1Length,
          // "max-lg:hidden": isOverview,
        })}
      >
        {isLoading ? (
          <DefaultSkelecton />
        ) : !page1Length ? (
          <p className="text-sm text-gray-400 text-center my-5">
            No services to show
          </p>
        ) : (
          data?.pages?.map((group) => {
            return group?.data?.map((service) => {
              return (
                <PostCard
                  key={service.id}
                  className={"bg-background"}
                  companyName={service?.company?.company_name}
                  verified={service?.companyInfo?.verified}
                  logo={service?.company?.logo}
                  title={service.title}
                  summary={service.sub_title}
                  url={`/services/${service.id}`}
                  slug={service?.company?.slug}
                  whole={service}
                  isService
                />
              );
            });
          })
        )}

        {isFetching && isFetchingNextPage && <DefaultSkelecton length={4} />}
      </section>

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
};

function DefaultSkelecton({ length = 6 }) {
  return Array.from({ length }, (_, index) => <PostCardSkeleton key={index} />);
}
