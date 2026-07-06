import { Avatar, Button } from "@chakra-ui/react";
import { LocationOnOutlined } from "@mui/icons-material";
import clsx from "clsx";
import ConnectButton from "../../components/ConnectButton";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import { avatarStyle, ConJoinedImages } from "../../components/ResponsiveNav";
import CompanyName from "../../components/company/CompanyName";
import Heading from "../../components/company/Heading";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";
import { getSEOConfig } from "../../lib/seoConfig";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import { usePollAllCompanies } from "../../hooks/usePolling";
import { CompanyUserType } from "../../lib/helpers/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCompanies } from "../../api-services/companies";
import { useMemo } from "react";
import { webRoutes } from "../../lib/webRoutes";

export const meta = () =>
  createSEO({
    title: "Companies | Connectize",
    description:
      "Discover top companies in the oil and gas industry on Connectize. Create or explore detailed company profiles, connect with industry professionals, showcase services, attract investors, and collaborate on innovative projects. Join the leading platform transforming energy sector networking.",
  });
const sortOptions = [
  "company name",
  "company type",
  "products",
  "date created",
];

export default function CompaniesPage() {
  const seoData = getSEOConfig("companies");
  const { updateSearchParams, searchParams } = useCustomSearchParams();

  // const { data: companiesList, isLoading } = usePollAllCompanies();
  const selectedSortOption = searchParams.get("sort_by") || "company name";

  const sortBy = useMemo(() => {
    switch (selectedSortOption) {
      case "company name":
        return "company_name";
      case "company type":
        return "organization_type__name";
      case "products":
        return "products_count";
      case "date created":
        return "date_created";
      default:
        return null;
    }
  }, [selectedSortOption]);

  //  {hasNextPage && !isFetchingNextPage && (
  //         <div
  //           className={clsx("mt-10 flex justify-center", {
  //             "animate-pulse": isFetching,
  //           })}
  //         >
  //           <PrimaryButton
  //             onClick={fetchNextPage}
  //             disabled={!hasNextPage || isFetching || isFetchingNextPage}
  //           >
  //             Load More
  //           </PrimaryButton>
  //         </div>
  const {
    data: companyPages,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", "all", { sortBy }],
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000, // ✅ Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // ✅ Keep in cache for 15 minutes
    refetchOnWindowFocus: false, // ✅ Don't refetch on tab switch
    refetchOnMount: false, // ✅ Use cache on mount
    retry: 2, // ✅ Only retry twice
    retryDelay: 1000, // ✅ Wait 1 second between retries
    queryFn: async ({ pageParam, signal }) => {
      const res = await getAllCompanies(
        {
          page_size: 12, // ✅ Increased from 6 to reduce requests
          page: pageParam,
          ordering: sortBy ? "" + sortBy : undefined,
        },
        true
      );
      return res;
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

  const { user: currentUser } = useAuth();

  if (isLoading)
    return <PageLoading hasLogo={false} text="Getting companies" />;

  // Error state
  if (error) {
    return (
      <section className="space-y-6 px-2 md:px-0 text-center py-10">
        <LightParagraph>Failed to load companies. Please try again.</LightParagraph>
        <PrimaryButton onClick={() => window.location.reload()}>
          Retry
        </PrimaryButton>
      </section>
    );
  }

  // Empty state
  if (!isLoading && companyPages?.pages?.[0]?.data?.length === 0) {
    return (
      <section className="space-y-6 px-2 md:px-0 text-center py-10">
        <LightParagraph>No companies found.</LightParagraph>
        {currentUser && currentUser?.user_type === CompanyUserType && (
          <Link to={webRoutes.createCompany}>
            <PrimaryButton>Create Company</PrimaryButton>
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6 px-2 md:px-0">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      <section className="flex items-center justify-between">
        <Heading />
        {currentUser &&
          currentUser?.companies.length < 1 &&
          currentUser?.user_type === CompanyUserType && (
            <Link to={webRoutes.createCompany}>
              <Button className="!text-xs !rounded-full hover:!bg-gold transition-colors duration-300">
                Create Company
              </Button>
            </Link>
          )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="font-semibold">Sort By</h2>

        <div className="flex overflow-x-auto scrollbar-hidden scroll-smooth">
          {sortOptions?.map((option, index) => {
            const currentOption = selectedSortOption.toLowerCase() === option;
            return (
              <Button
                key={index}
                onClick={() => updateSearchParams({ sort_by: option })}
                className={clsx(
                  "!text-xs xs:!py-2 xs:!h-fit capitalize transition-all duration-300 !rounded-full shrink-0 scrollbar-hidden",
                  {
                    "!bg-gold": currentOption,
                    "!bg-transparent": !currentOption,
                  }
                )}
              >
                By {option}
              </Button>
            );
          })}
        </div>
      </div>

      {companyPages?.pages?.map((page, index) => {
        return <CompaniesArray companies={page?.data} key={index} />;
      })}

      {hasNextPage && (
        <div
          className={clsx("mt-10 flex mx-auto justify-center", {
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
    </section>
  );
}

export const CompaniesArray = ({
  isSearch,
  array,
  companies = [],
  searchLoading,
}) => {
  const companyArray = isSearch ? array : companies;
  //
  const { user: currentUser } = useAuth();

  //
  // const sortedCompanies = companyArray?.sort((a, b) => {
  //   switch (selectedSortOption) {
  //     case "company type":
  //       return a?.organization_type?.localeCompare(b?.organization_type);
  //     case "products":
  //       return a?.products?.length - b?.products?.length;
  //     case "country":
  //       return a?.country?.localeCompare(b?.country);
  //     default:
  //       return a?.company_name?.localeCompare(b?.company_name);
  //   }
  // });

  //
  console.log("companyArray:", companyArray);
  console.log("currentUser:", currentUser);
  return searchLoading ? (
    <PageLoading hasLogo={false} text="Getting companies" />
  ) : companyArray?.length < 1 ? (
    <LightParagraph>No company found in search</LightParagraph>
  ) : (
    // <section className="">

    <section
      className={`grid grid-cols-1 ${
        isSearch
          ? "md:grid-cols-2"
          : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      } gap-6`}
    >
      {companyArray?.map((company, index) => {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            key={index}
            className={clsx("p-2 rounded-md flex flex-col", {
              "bg-white": !isSearch,
              "bg-background": isSearch,
            })}
          >
            <div className="flex flex-col gap-4 items-center">
              <Avatar
                className={avatarStyle}
                size="xl"
                src={company?.logo || "/images/default-company-logo.png"}
                name={company?.company_name}
              />

              <div className="md:w-full flex flex-col items-center">
                <CompanyName
                  slug={company?.slug}
                  name={company?.company_name}
                  verified={company?.verify}
                  size="md"
                  company={true}
                />
                {company?.organization_type && (
                  <div className="flex mb-1 md:items-center">
                    <span className="!line-clamp-1 xs:text-sm sm:text-xs">
                      {company?.organization_type}
                    </span>
                  </div>
                )}
                {!isSearch && (
                  <div className="flex items-center text-gray-400">
                    <LocationOnOutlined className="sm:!size-4 !size-5" />
                    <span className="text-sm sm:text-xs">
                      {company?.office_address}{" "}
                      {[company?.city, company?.state, company?.country]
                        .filter(Boolean)
                        .filter(
                          (part, index, all) =>
                            all.findIndex(
                              (other) =>
                                other.trim().toLowerCase() ===
                                part.trim().toLowerCase()
                            ) === index
                        )
                        .join(", ")}
                      .
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="line-clamp-3 p-2 shrink-0 text-center  self-center">
              <LightParagraph>{company?.about} </LightParagraph>
            </div>

            <div className="h-full" />

            <div
              className={clsx("py-4 border-t mt-4 px-4 flex items-center ", {
                "justify-between": !!company?.reviews?.length,
                "justify-center": !company?.reviews?.length,
              })}
            >
              {company?.reviews && (
                <ConJoinedImages
                  size={30}
                  sizeVariant="sm"
                  array={company?.reviews.slice(0, 5).map((post) => ({
                    name: `${post?.user?.first_name} ${post?.user?.last_name}`,
                    src: post?.user?.avatar,
                    href: `/co/${post?.user?.id}`,
                  }))}
                />
              )}
              {currentUser?.email === company?.profile ? (
                <Link to={`/${company?.slug}`}>
                    <PrimaryButton>View Profile</PrimaryButton>
                  </Link>
              ) : (
                  <ConnectButton
                  id={Number(company?.id)}
                  slug={company?.slug}
                  type="company"
                  data={company}
                />
                ) 
              }
            </div>
          </motion.div>
        );
      })}
    </section>
  );
};
