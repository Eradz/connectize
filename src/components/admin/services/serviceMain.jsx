import clsx from "clsx";
import { PostCard, PostCardSkeleton } from "../feeds/DiscoverPostTabs";
import { getServices } from "../../../api-services/services";
import { useQuery } from "@tanstack/react-query";
import CustomTabs from "../../custom/tabs";

function ServiceMain({ isOverview }) {
  return (
    <CustomTabs
      tabsHeading={["Featured", "Most Recent", "Best Matches"]}
      tabsPanels={[
        <PostCardWrapper isOverview={isOverview} />,
        <PostCardWrapper isOverview={isOverview} />,
        <PostCardWrapper isOverview={isOverview} />,
      ]}
    />
  );
}

export default ServiceMain;

export const PostCardWrapper = ({ isOverview = false }) => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  return (
    <section
      className={clsx("bg-white rounded-md p-2 grid gap-x-3 gap-y-4 ", {
        "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3":
          !isOverview && services.length,
        // "max-lg:hidden": isOverview,
      })}
    >
      {isLoading ? (
        Array.from({ length: 6 }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))
      ) : !services?.length ? (
        <p className="text-sm text-gray-400 text-center my-5">
          No services to show
        </p>
      ) : (
        services?.map((service, index) => (
          <PostCard
            key={index}
            companyName={service.company}
            verified={service?.companyInfo?.verified}
            logo={service?.companyInfo?.logo}
            title={service.title}
            summary={service.sub_title}
            url={`/services/${service.id}`}
            whole={service}
            isService
          />
        ))
      )}
    </section>
  );
};
