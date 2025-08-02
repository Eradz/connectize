import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getProductCategories } from "../../../api-services/products";
import { getServiceCategories } from "../../../api-services/services";
import { useAuth } from "../../../context/userContext";
import { CategoryIcon, VerifiedIcon } from "../../../icon";
import { capitalizeFirst } from "../../../lib/utils";
import HeadingText from "../../HeadingText";
import { NavigationSection } from "../../NavigationSection";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import { CircleTitleSubtitleSkeleton } from "../feeds/TopServiceSuggestions";
import ReusableModal from "../../custom/ResusableModal";
import { useState } from "react";
import { usePageination } from "../../../hooks/usePagination";

function Sidebar() {
  const { user: currentUser, loading } = useAuth();
  const { pathname } = useLocation();

  const isMessagesRoute = pathname.startsWith("/messages");

  const isMarketPages = /^\/(market|product|service)/.test(pathname);

  return (
    <nav
      className={clsx(
        "max-md:hidden bg-white rounded-md py-4 px-2 shrink-0 max-w-[300px] sm:w-[280px] lg:w-[300px] 2xl:w-[350px] max-h-[97vh] scrollbar-hidden max-md:!py-6 max-md:shadow md:sticky md:top-2 overflow-y-auto space-y-4",
        { "h-[97vh]": !isMessagesRoute, "h-full": isMessagesRoute }
      )}
    >
      {!loading && currentUser ? (
        <UserProfile currentUser={currentUser} />
      ) : (
        <CircleTitleSubtitleSkeleton />
      )}
      <NavigationSection />
      {isMarketPages && <ProductCategory />}
    </nav>
  );
}

export default Sidebar;

const UserProfile = ({ currentUser }) => {
  return (
    <div className="flex items-center gap-2">
      <Link to={`/co/${currentUser?.id}`}>
        <Avatar
          name={
            currentUser?.first_name
              ? `${currentUser?.first_name} ${currentUser?.last_name}`
              : currentUser?.email
          }
          src={currentUser?.avatar || ""}
          className={clsx(avatarStyle)}
          size="md"
        />
      </Link>
      <div>
        <div className="flex items-center">
          <Link
            to={`/co/${currentUser?.id}`}
            className="font-semibold text-sm line-clamp-1 break-all"
          >
            {currentUser?.first_name
              ? `${currentUser?.first_name} ${currentUser?.last_name}`
              : currentUser?.email.split("@")[0]}
          </Link>
          <VerifiedIcon color="black" />
        </div>
        <span className="text-[.75rem] text-gray-400 !-mt-0.5 block">
          {currentUser?.role
            ? capitalizeFirst(currentUser?.role || "")
            : currentUser?.email}
        </span>
      </div>
    </div>
  );
};

// function MarketPlaceNavigation() {
//   const { pathname } = useLocation();
//   const { toggleNav } = useNav();
//   return (
//     <section className="space-y-2">
//       <HeadingText>
//         {pathname.startsWith("/services") ? "Services" : "Marketplace"}
//       </HeadingText>
//       <div className="space-y-2 xs:text-sm p-2">
//         {marketPlaceItems.map((item, index) => {
//           return (
//             <Link
//               key={index}
//               to={item.to}
//               onClick={() => toggleNav(false)}
//               className={clsx(
//                 "flex gap-2 items-center transition-colors duration-300 p-2 rounded-md",
//                 {
//                   "!text-gold !bg-mid_grey": pathname.startsWith(item.to),
//                   "!text-gray-500 hover:!text-mid_grey": !pathname.startsWith(
//                     item.to
//                   ),
//                 }
//               )}
//             >
//               <item.icon />
//               <span className="text-sm font-semibold">{item.name}</span>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

function ProductCategory() {
  const { pathname } = useLocation();

  // const { data: categories, isLoading } = useQuery({
  //   queryKey: pathname.startsWith("/services")
  //     ? ["serviceCategories"]
  //     : ["productCategories"],
  //   queryFn: pathname.startsWith("/services")
  //     ? getServiceCategories
  //     : getProductCategories,
  //   enabled: !!pathname,
  // });

  const [searchParams] = useSearchParams();

  console.log({ pathname });

  const s = searchParams.get("s");
  const isServicesPage = s === "services" || pathname.startsWith("/services");
  const { data: categoriesPaginated, isLoading } = usePageination({
    queryKey: isServicesPage
      ? ["serviceCategories", "all"]
      : ["productCategories", "all"],
    queryFn: async ({ pageParam }) => {
      if (isServicesPage) {
        return await getServiceCategories(
          { page_size: 3, page: pageParam },
          true
        );
      }
      return await getProductCategories(
        { page_size: 3, page: pageParam },
        true
      );
    },
    enabled: !!pathname,
  });

  const categoriesFristPage = categoriesPaginated?.pages?.[0]?.data;

  const [showMore, setShowMore] = useState(false);
  return (
    <section className="space-y-2 px-4">
      <div className="flex gap-2 items-center">
        <CategoryIcon className={"size-4"} />
        <div className="flex-1">
          <HeadingText heading="sub-heading">Category</HeadingText>
        </div>
        <button onClick={() => setShowMore(true)} type="button">
          See all
        </button>

        <ReusableModal
          isOpen={showMore}
          size="sm"
          onClose={() => setShowMore(false)}
          title={
            isServicesPage ? "All service categories" : "All product categories"
          }
        >
          {categoriesPaginated?.pages?.map((page) =>
            page?.data?.map((item, index) => {
              return (
                <Link
                  to={`/market?category=${item.name.toLowerCase()}${
                    isServicesPage ? "&s=services" : ""
                  }`}
                  key={index}
                  className="flex items-center gap-2 py-2"
                >
                  <span className="size-5 bg-dark rounded-full shrink-0" />
                  <span className="line-clamp-2">{item.name}</span>
                </Link>
              );
            })
          )}
        </ReusableModal>
      </div>
      <div className="space-y-2 xs:text-sm">
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : !categoriesFristPage?.length ? (
          <LightParagraph>No categories available</LightParagraph>
        ) : (
          <>
            <Link
              to={isServicesPage ? "/market?s=services" : "/market"}
              key={"all"}
              className="flex items-center gap-2 py-2"
            >
              <span className="size-5 bg-dark rounded-full shrink-0" />
              <span className="line-clamp-2">All Categories</span>
            </Link>
            {categoriesFristPage?.map((item, index) => (
              <Link
                to={`/market?category=${item.name.toLowerCase()}${
                  isServicesPage ? "&s=services" : ""
                }`}
                key={index}
                className="flex items-center gap-2 py-2"
              >
                <span className="size-5 bg-dark rounded-full shrink-0" />
                <span className="line-clamp-2">{item.name}</span>
              </Link>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
