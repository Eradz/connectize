import clsx from "clsx";
import { PostCard, PostCardSkeleton } from "../feeds/DiscoverPostTabs";
import { getServices } from "../../../api-services/services";
import { useInfiniteQuery } from "@tanstack/react-query";
import CustomTabs from "../../custom/tabs";
import PrimaryButton from "../../PrimaryButton";

function ServiceMain({ isOverview, companyId }) {
  return (
    <CustomTabs
      tabsHeading={["Featured", "Most Recent", "Best Matches"]}
      tabsPanels={[
        <PostCardWrapper
          isOverview={isOverview}
          companyId={companyId || undefined}
        />,
        <PostCardWrapper
          isOverview={isOverview}
          companyId={companyId || undefined}
        />,
        <PostCardWrapper
          isOverview={isOverview}
          companyId={companyId || undefined}
        />,
      ]}
    />
  );
}

export default ServiceMain;

export const PostCardWrapper = ({ isOverview = false, companyId }) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["services", "all", { companyId }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getServices(
        { page_size: 2, page: pageParam, company: companyId },
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
  // const { data: services, isLoading } = useQuery({
  //   queryKey: ["services"],
  //   queryFn: getServices,
  // });

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
                  companyName={service?.company?.company_name}
                  verified={service?.companyInfo?.verified}
                  logo={service?.company?.logo}
                  title={service.title}
                  summary={service.sub_title}
                  url={`/services/${service.id}`}
                  whole={service}
                  slug={
                    service?.company.id
                      ? `co/${service?.company.id}`
                      : "services/#"
                  }
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
