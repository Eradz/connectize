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

import { motion } from "framer-motion";
import { Link } from "react-router";
import PrimaryButton from "../../components/PrimaryButton";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import { usePollAllCompanies } from "../../hooks/usePolling";
import { CompanyUserType } from "../../lib/helpers/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCompanies } from "../../api-services/companies";
import { useMemo } from "react";

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
  const { updateSearchParams, searchParams } = useCustomSearchParams();

  // const { data: companiesList, isLoading } = usePollAllCompanies();
  const selectedSortOption = searchParams.get("sort_by") || "company name";

  const sortBy = useMemo(() => {
    switch (selectedSortOption) {
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
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", "all", { sortBy }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllCompanies(
        {
          page_size: 6,
          page: pageParam,
          ordering: sortBy ? "-" + sortBy : undefined,
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

  return (
    <section className="space-y-6 px-2 md:px-0">
      {/* <SEO
        title="Companies | Connectize"
        description="Discover top companies in the oil and gas industry on Connectize. Create or explore detailed company profiles, connect with industry professionals, showcase services, attract investors, and collaborate on innovative projects. Join the leading platform transforming energy sector networking."
      /> */}
      <section className="flex items-center justify-between">
        <Heading />
        {currentUser &&
          currentUser?.companies.length < 1 &&
          currentUser?.user_type === CompanyUserType && (
            <Link to="/create-company">
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
      </div>
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
                      {company?.address} {company?.city}, {company?.state},{" "}
                      {company?.country}.
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
              {currentUser?.email !== company?.profile ? (
                <ConnectButton
                  id={Number(company?.id)}
                  slug={company?.slug}
                  type="company"
                  data={company}
                />
              ) : (
                <Link to={`/${company?.slug}`}>
                  <PrimaryButton>View Profile</PrimaryButton>
                </Link>
              )}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
};
