import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarkService, getBookmarkedServices } from "../../api-services/services";
import PageLoading from "../PageLoading";
import { useState } from "react";
import LightParagraph from "../ParagraphText";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import { Share1Icon, TrashIcon } from "@radix-ui/react-icons";
import { shareThis } from "../../lib/utils";
import { useAuth } from "../../context/userContext";
import { Avatar } from "@chakra-ui/react";
import { VerifiedIcon } from "../../icon";
import { avatarStyle } from "../ResponsiveNav";

export const BookmarkedServices = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: services, isLoading } = useQuery({
    queryKey: ["bookmarked-services"],
    queryFn: () => getBookmarkedServices(),
    enabled: !!currentUser,
    staleTime: 1 * 60 * 1000, // 1 minute cache
  });

  if (isLoading) return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      {!services || services?.length <= 0 ? (
        <div className="p-4 text-center">
          <LightParagraph>No bookmarked service yet</LightParagraph>
        </div>
      ) : (
        services?.map((service) => (
          <BookmarkedServicesCard
            service={service}
            key={service?.id}
            queryClient={queryClient}
          />
        ))
      )}
    </section>
  );
};

const BookmarkedServicesCard = ({ service, queryClient }) => {
  const { user: currentUser } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);

  const hasBookmarkedService = service?.likes?.find(
    (serviceProp) => serviceProp?.user?.id === currentUser?.id
  );

  const company = service.company;

  const handleBookmark = async () => {
    setIsRemoving(true);
    try {
      await bookmarkService(service.id, service, hasBookmarkedService);
      
      // Optimistically update the cache
      queryClient.setQueryData(["bookmarked-services"], (oldData) => {
        return oldData?.filter((s) => s.id !== service?.id);
      });
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries(["bookmarked-services"]);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      setIsRemoving(false);
    }
  };
  
  if (isRemoving) return null;

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
