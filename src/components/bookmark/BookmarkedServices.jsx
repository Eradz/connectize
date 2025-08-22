import { useQuery } from "@tanstack/react-query";
import { bookmarkService } from "../../api-services/services";
import PageLoading from "../PageLoading";
import { useEffect, useState } from "react";
import LightParagraph from "../ParagraphText";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { Share1Icon, TrashIcon } from "@radix-ui/react-icons";
import { shareThis } from "../../lib/utils";
import { useAuth } from "../../context/userContext";
import { getServices } from "../../api-services/services";
import { Avatar, Menu } from "@chakra-ui/react";
import { VerifiedIcon } from "../../icon";
import { avatarStyle } from "../ResponsiveNav";

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
      {bookmarkedServices?.length <= 0 ? (
        <div className="p-4 text-center">
          <LightParagraph>No bookmarked service yet</LightParagraph>
        </div>
      ) : (
        bookmarkedServices?.map((service) => (
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

  const company = service.company;

  const handleBookmark = async () => {
    setCachedServices(
      cachedServices?.filter((cacheservice) => cacheservice?.id !== service?.id)
    );
    await bookmarkService(service.id, service, hasBookmarkedService);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-md"
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center">
            <p className="!line-clamp-1 !break-all mb-1 flex-1 text-lg md:text-xl font-semibold">
              {service?.title}
            </p>

            <div className="flex items-center justify-end gap-2">
              <ButtonWithTooltipIcon
                tip={`Remove ${service?.title} from bookmark`}
                IconName={TrashIcon}
                onClick={handleBookmark}
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
          </div>
          <p className="w-fit text-gray-500 text-sm !line-clamp-1 !break-all block leading-none">
            {service?.category}
          </p>
        </div>

        <div className="flex items-center">
          <div className="flex gap-2 items-center flex-1">
            <Link to={`/${company.slug}`} className="relative">
              <Avatar
                src={company.logo || "images/default-company-logo.png"}
                alt={company.company_name}
                name={company.company_name || ""}
                className={avatarStyle}
                size="sm"
              />
              {company?.verified && (
                <VerifiedIcon className="absolute bottom-0 right-0" />
              )}
            </Link>
            <Link
              to={`/${company?.slug}`}
              className="text-sm font-semibold capitalize line-clamp-1"
            >
              {company.company_name || "West Land Oil"}
            </Link>
          </div>
          <Link
            to={`/services/${service?.id}`}
            replace
            className="bg-gold hover:opacity-60 rounded-full py-1 px-6 text-sm w-fit"
          >
            View
          </Link>
        </div>

        {/* <ChatSellerLink text="Chat seller" to={} /> */}
      </div>
    </motion.div>
  );
};
