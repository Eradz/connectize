import { Share1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";
import { bookmarkProduct, getBookmarkedProducts } from "../../api-services/products";
import { useAuth } from "../../context/userContext";
import { shareThis } from "../../lib/utils";
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import PageLoading from "../PageLoading";
import LightParagraph from "../ParagraphText";
import { Avatar } from "@chakra-ui/react";
import { avatarStyle } from "../ResponsiveNav";
import { VerifiedIcon } from "../../icon";

export const BookmarkedProducts = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["bookmarked-products"],
    queryFn: () => getBookmarkedProducts(),
    enabled: !!currentUser,
    staleTime: 1 * 60 * 1000, // 1 minute cache
  });

  if (isLoading) return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      {!products || products?.length <= 0 ? (
        <div className="p-4 text-center">
          <LightParagraph>No bookmarked product yet</LightParagraph>
        </div>
      ) : (
        products?.map((product) => (
          <BookmarkedProductsCard
            product={product}
            key={product?.id}
            queryClient={queryClient}
          />
        ))
      )}
    </section>
  );
};

const BookmarkedProductsCard = ({ product, queryClient }) => {
  const { user: currentUser } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);
  
  const hasBookmarked = product?.likes?.some(
    (like) => like?.user?.id === currentUser?.id
  );

  const handleBookmark = async () => {
    setIsRemoving(true);
    try {
      await bookmarkProduct(product.id, product, hasBookmarked);
      
      // Optimistically update the cache
      queryClient.setQueryData(["bookmarked-products"], (oldData) => {
        return oldData?.filter((p) => p.id !== product?.id);
      });
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries(["bookmarked-products"]);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      setIsRemoving(false);
    }
  };

  const company = product.company;
  
  if (isRemoving) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex gap-4 bg-white p-3 rounded-md"
    >
      <Link to={`/products/${product?.id}`}>
        <img
          src={product?.images?.[0]?.image || ""}
          alt={product?.images?.[0]?.caption || ""}
          className="size-16 sm:size-20 rounded-md overflow-hidden object-cover shrink-0"
        />
      </Link>

      <div className="flex-1">
        <div className="mb-1 flex items-center">
          <Link
            to={`/products/${product?.id}`}
            className="!line-clamp-1 flex-1 !break-all text-lg md:text-xl font-semibold"
          >
            {product?.title}
          </Link>
        </div>
        <small className="w-fit text-gray-400 mb-2 !line-clamp-1 !break-all block leading-none">
          {product?.category}
        </small>
        <div className="flex items-center">
          <div className="flex gap-2 items-center flex-1">
            <Link to={`/${company.slug}`} className="relative">
              <Avatar
                src={company.logo || "images/default-company-logo.png"}
                alt={company.company_name}
                name={company.company_name || ""}
                className={avatarStyle}
                size="xs"
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
          <div className="flex items-center justify-end gap-2">
            <ButtonWithTooltipIcon
              tip={`Remove ${product?.title} from bookmark`}
              IconName={TrashIcon}
              onClick={handleBookmark}
            />
            <ButtonWithTooltipIcon
              tip={`Share ${product?.title}`}
              onClick={async () => {
                const shareUrlString =
                  window.location.href + "products/" + product?.id;
                const shareData = {
                  title: product?.title,
                  text: product?.sub_title,
                  url: shareUrlString,
                };
                await shareThis({ shareUrlString, shareData });
              }}
              IconName={Share1Icon}
            />
          </div>
        </div>
        {/* <ChatSellerLink text="Chat seller" recipientId={5} /> */}
      </div>
    </motion.section>
  );
};
