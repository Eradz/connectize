import { useQuery } from "@tanstack/react-query";
import { bookmarkService } from "../../api-services/services";
import PageLoading from "../PageLoading";
import { useEffect, useState } from "react";
import LightParagraph from "../ParagraphText";
import { Link } from "react-router-dom";
import { ChatSellerLink } from "../admin/markets/newlyListed";
import { motion } from "framer-motion";
import { LinkWithTooltipIcon } from "../userProfile/Navbar";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { Link1Icon, Share1Icon, TrashIcon } from "@radix-ui/react-icons";
import { shareThis } from "../../lib/utils";
import { useAuth } from "../../context/userContext";
import { getServices } from "../../api-services/services";

export const BookmarkedServices = () => {
  const { user: currentUser } = useAuth();
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
    enabled: !!currentUser,
  });

  const bookmarkedServices = services?.filter((service) =>
    service?.likes?.find((like) => like?.user?.id === currentUser?.id)
  );

  const [cachedServices, setCachedServices] = useState(
    bookmarkedServices || []
  );

  useEffect(() => {
    setCachedServices(bookmarkedServices);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!bookmarkedServices]);

  if (isLoading) return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      {cachedServices?.length <= 0 ? (
        <div className="p-4 text-center">
          <LightParagraph>No bookmarked service yet</LightParagraph>
        </div>
      ) : (
        cachedServices?.map((service) => (
          <BookmarkedServicesCard
            setCachedServices={setCachedServices}
            cachedServices={cachedServices}
            service={service}
            key={service?.id}
          />
        ))
      )}
    </section>
  );
};

const BookmarkedServicesCard = ({
  service,
  setCachedServices,
  cachedServices,
}) => {
  const { user: currentUser } = useAuth();

  const hasBookmarkedService = service?.likes?.find(
    (serviceProp) => serviceProp?.user?.id === currentUser?.id
  );

  const handleBookmark = async () => {
    setCachedServices(
      cachedServices?.filter((cacheservice) => cacheservice?.id !== service?.id)
    );
    await bookmarkService(service.id, service, hasBookmarkedService);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex justify-between max-sm:flex-col relative"
    >
      <div className="flex gap-2">
        <img
          src={service?.images?.[0]?.image || "/images/produc_drum.jpeg"}
          alt={service?.images?.[0]?.caption || ""}
          className="size-24 rounded-md overflow-hidden shrink-0"
        />

        <div className="flex flex-col justify-between">
          <div>
            <Link
              to={`/services/${service?.id}`}
              className="!line-clamp-1 !break-all text-lg md:text-xl font-semibold"
            >
              {service?.title}
            </Link>
            <small className="w-fit text-gray-400 mb-2  !line-clamp-1 !break-all block leading-none">
              {service?.category}
            </small>
          </div>

          <Link
            to={`/services/${service?.id}`}
            replace
            className="bg-gold hover:opacity-60 rounded-full py-1 px-6 text-sm w-fit"
          >
            View
          </Link>
          {/* <ChatSellerLink text="Chat seller" to={} /> */}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 max-sm:absolute bottom-3 right-0">
        <ButtonWithTooltipIcon
          tip={`Remove ${service?.title} from bookmark`}
          IconName={TrashIcon}
          onClick={handleBookmark}
        />
        <LinkWithTooltipIcon
          IconName={Link1Icon}
          to={`/services/${service?.id}`}
        />
        <ButtonWithTooltipIcon
          tip={`Share ${service?.title}`}
          onClick={async () => {
            const shareUrlString =
              window.location.href + "services/" + service?.id;
            const shareData = {
              title: service?.title,
              text: service?.sub_title,
              url: shareUrlString,
            };
            await shareThis({ shareUrlString, shareData });
          }}
          IconName={Share1Icon}
        />
      </div>
    </motion.section>
  );
};
