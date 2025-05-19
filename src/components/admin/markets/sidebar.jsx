import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
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

function Sidebar() {
  const { user: currentUser, loading } = useAuth();
  const { pathname } = useLocation();

  const isMarketPages = /^\/(market|product|service)/.test(pathname);

  return (
    <nav
      className={clsx(
        "max-md:hidden bg-white rounded-md py-4 px-2 shrink-0 max-w-[300px] sm:w-[280px] lg:w-[300px] 2xl:w-[320px] h-screen scrollbar-hidden max-md:!py-6 max-md:shadow md:sticky md:top-2 overflow-y-auto md:max-h-screen space-y-4"
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

  const { data: categories, isLoading } = useQuery({
    queryKey: pathname.startsWith("/services")
      ? ["serviceCategories"]
      : ["productCategories"],
    queryFn: pathname.startsWith("/services")
      ? getServiceCategories
      : getProductCategories,
    enabled: !!pathname,
  });

  return (
    <section className="space-y-2">
      <div className="flex gap-2 items-center">
        <CategoryIcon />
        <HeadingText>Category</HeadingText>
      </div>
      <div className="space-y-2 xs:text-sm p-2">
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : !categories?.length ? (
          <LightParagraph>No categories available</LightParagraph>
        ) : (
          <>
            <Link
              to={pathname.startsWith("/services") ? "/services" : "/market"}
              key={"all"}
              className="flex items-center gap-2 p-2"
            >
              <span className="size-5 bg-dark rounded-full shrink-0" />
              <span className="line-clamp-2">All Categories</span>
            </Link>
            {categories?.map((item, index) => (
              <Link
                to={
                  (pathname.startsWith("/services") ? "/services" : "/market") +
                  "?category=" +
                  item.name.toLowerCase()
                }
                key={index}
                className="flex items-center gap-2 p-2"
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
