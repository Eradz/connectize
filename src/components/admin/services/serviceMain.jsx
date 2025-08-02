import clsx from "clsx";
import { PostCard, PostCardSkeleton } from "../feeds/DiscoverPostTabs";
import CustomTabs from "../../custom/tabs";
import PrimaryButton from "../../PrimaryButton";
import { usePageinatedServices } from "../../../hooks/useServices";
import { CreateNewLink } from "../markets/carousel";

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
  } = usePageinatedServices({ companyId });

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

      <CreateNewLink url="/services/add" text="Add new service" />
    </div>
  );
};

function DefaultSkelecton({ length = 6 }) {
  return Array.from({ length }, (_, index) => <PostCardSkeleton key={index} />);
}
