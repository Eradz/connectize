import { Avatar, Button } from "@chakra-ui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSearchResults } from "../../api-services/search";
import DiscoverPosts from "../../components/admin/feeds/DiscoverPosts";
import { PostCard } from "../../components/admin/feeds/DiscoverPostTabs";
import { ProductListCard } from "../../components/admin/markets/newlyListed";
import ConnectButton from "../../components/ConnectButton";
import CustomTabs from "../../components/custom/tabs";
import LightParagraph from "../../components/ParagraphText";
import { avatarStyle } from "../../components/ResponsiveNav";
import Username from "../../components/Username";
import { useAuth } from "../../context/userContext";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";
import { usePollAllCompanies } from "../../hooks/usePolling";
import { getRandomOilAndGasKeyword } from "../../lib/helpers/getRandomOilAndGasWords";
import { CompaniesArray } from "../companies";

export default function Search() {
  return (
    <section>
      <SearchTab />
    </section>
  );
}

export const SearchTab = () => {
  const { user: currentUser } = useAuth();
  const { data: companies } = usePollAllCompanies();
  const navigate = useNavigate();

  const [randKeyWord, setRandKeyWord] = useState(getRandomOilAndGasKeyword());

  const { updateSearchParams, searchParams, pathname } =
    useCustomSearchParams();

  const searchQuery = searchParams.get("search_query");

  const isSearchPage = pathname === "/search";

  useEffect(() => {
    if (searchQuery?.toLowerCase() === randKeyWord?.toLowerCase()) {
      setRandKeyWord(getRandomOilAndGasKeyword());
    }
  }, [searchQuery, randKeyWord]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => getSearchResults(searchQuery),
    enabled: !!searchQuery && !!currentUser,
  });

  const isNotEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

  const tabDefinitions = [
    {
      key: "posts",
      heading: "Posts",
      content: (
        <DiscoverPosts
          isSearch
          searchArray={data?.posts}
          searchLoading={isLoading}
        />
      ),
    },
    {
      key: "companies",
      heading: "Companies",
      content: (
        <CompaniesArray
          hasFilter={false}
          isSearch
          array={data?.companies}
          searchLoading={isLoading}
        />
      ),
    },
    {
      key: "users",
      heading: "People",
      content: (
        <section className="grid gap-x-3 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {!isNotEmpty(data?.users) ? (
            <LightParagraph>No user found in search</LightParagraph>
          ) : (
            data?.users
              ?.filter((user) => user?.first_name && user?.last_name)
              .map((user) => (
                <motion.div
                  key={user?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "flex items-center justify-center flex-col gap-6 rounded-md px-4 py-8",
                    {
                      "bg-white": pathname === "/search",
                      "bg-background": pathname !== "/search",
                    }
                  )}
                >
                  <Avatar
                    src={user?.avatar}
                    name={`${user?.first_name} ${user?.last_name}`}
                    className={avatarStyle}
                    cursor="pointer"
                    size="sm"
                    width={50}
                    height={50}
                    onClick={() => navigate(`/co/${user?.id}`)}
                  />
                  <div className="flex flex-col items-center text-center">
                    <Username user={user} />
                    <small className="text-gray-400 line-clamp-2">
                      {user?.email}
                    </small>
                  </div>
                  <div>
                    <ConnectButton
                      first_name={user?.first_name}
                      id={user?.id}
                    />
                  </div>
                </motion.div>
              ))
          )}
        </section>
      ),
    },
    {
      key: "products",
      heading: "Products",
      content: (
        <div className="grid gap-x-3 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {!isNotEmpty(data?.products) ? (
            <LightParagraph>No product found in search</LightParagraph>
          ) : (
            data?.products.map((product, index) => {
              return (
                <ProductListCard
                  key={index}
                  id={product?.id}
                  subtitle={product?.sub_title}
                  title={product?.title}
                  companies={companies}
                  companyName={product?.company?.company_name}
                />
              );
            })
          )}
        </div>
      ),
    },
    {
      key: "services",
      heading: "Services",
      content: (
        <div className="grid gap-x-3 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {!isNotEmpty(data?.services) ? (
            <LightParagraph>No service found in search</LightParagraph>
          ) : (
            data?.services.map((service, index) => (
              <PostCard
                key={index}
                companyName={service?.company}
                verified={service?.companyInfo?.verified}
                logo={service?.companyInfo?.logo}
                title={service?.title}
                summary={service?.sub_title}
                url={`/services/${service?.id}`}
                whole={service}
                isService
              />
            ))
          )}
        </div>
      ),
    },
  ];

  const filteredTabs = isLoading
    ? tabDefinitions
    : tabDefinitions.filter((tab) => isNotEmpty(data?.[tab.key]));

  const tabsHeading = filteredTabs.map(
    (tab) => `${data?.[tab.key]?.length || 0} ${tab.heading}`
  );

  const tabsPanels = filteredTabs.map((tab) => tab.content);

  return tabsHeading?.length <= 0 ? (
    <section
      className={clsx(
        "flex items-center justify-center flex-col gap-4 px-4 py-6",
        {
          "h-[60vh]": isSearchPage,
        }
      )}
    >
      <DotLottieReact
        src="/lottie/notification.lottie"
        loop
        autoplay
        className="size-40 shrink-0 pointer-events-none"
      />
      <LightParagraph center>
        We couldn't find any result for{" "}
        {searchQuery ? (
          <b className="!text-black break-keep">{searchQuery}</b>
        ) : (
          <>your search.</>
        )}
        . Try searching for{" "}
        <button
          onClick={() =>
            updateSearchParams({ search_query: randKeyWord?.toLowerCase() })
          }
        >
          <b className="capitalize !text-gold">{randKeyWord}.</b>
        </button>
      </LightParagraph>

      <div className="flex gap-4 items-center mt-2">
        <Button variant="solid" className="!bg-gold" size="sm">
          <Link to="/"> Go Home</Link>
        </Button>
        <Button variant="outline" size="sm">
          <Link to="/market">Check Products</Link>
        </Button>
      </div>
    </section>
  ) : (
    <CustomTabs tabsHeading={tabsHeading} tabsPanels={tabsPanels} />
  );
};
