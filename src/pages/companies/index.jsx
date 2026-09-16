import { Avatar, Button } from "@chakra-ui/react";
import clsx from "clsx";
import ConnectButton from "../../components/ConnectButton";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import { avatarStyle } from "../../components/ResponsiveNav";
import CompanyName from "../../components/company/CompanyName";
import Heading from "../../components/company/Heading";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";
import { getSEOConfig } from "../../lib/seoConfig";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Search, SlidersHorizontal } from "lucide-react";
import PrimaryButton from "../../components/PrimaryButton";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import { CompanyUserType } from "../../lib/helpers/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCompanies } from "../../api-services/companies";
import { useMemo, useState } from "react";
import { webRoutes } from "../../lib/webRoutes";

export const meta = () =>
  createSEO({
    title: "Companies | Connectize",
    description:
      "Discover top companies in the oil and gas industry on Connectize. Create or explore detailed company profiles, connect with industry professionals, showcase services, attract investors, and collaborate on innovative projects. Join the leading platform transforming energy sector networking.",
  });

// How many companies show in the "Top Companies" row up top before the rest
// fall into the "Add To Your Circle" grid below.
const TOP_COMPANIES_COUNT = 5;

export default function CompaniesPage() {
  const seoData = getSEOConfig("companies");
  const { searchParams } = useCustomSearchParams();

  // TODO(search): wire this up to getSearchResults({ searchTerm, types: "companies" })
  // — the input below is already in place, just needs a handler + query.
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: companyPages,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", "all"],
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

  const allCompanies = useMemo(
    () => companyPages?.pages?.flatMap((page) => page?.data || []) || [],
    [companyPages]
  );

  const topCompanies = allCompanies.slice(0, TOP_COMPANIES_COUNT);
  const circleCompanies = allCompanies.slice(TOP_COMPANIES_COUNT);

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
  if (!isLoading && allCompanies.length === 0) {
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
    <section className="space-y-8 px-2 md:px-0">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />

      {/* Header row — title + search + filter */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <Heading />

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies"
              className="w-48 md:w-64 py-2 pl-9 pr-3 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
            />
          </div>

          <button
            type="button"
            aria-label="Filter"
            className="shrink-0 flex items-center justify-center size-9 rounded-full bg-gold hover:bg-custom_yellow transition-colors"
          >
            <SlidersHorizontal className="size-4 text-dark" />
          </button>
        </div>

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

      {/* Top Companies */}
      {topCompanies.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Top Companies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {topCompanies.map((company) => (
              <CompanyCard key={company?.id} company={company} currentUser={currentUser} />
            ))}
          </div>
        </section>
      )}

      {/* Add To Your Circle */}
      {circleCompanies.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Add To Your Circle</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {circleCompanies.map((company) => (
              <CompanyCard key={company?.id} company={company} currentUser={currentUser} />
            ))}
          </div>
        </section>
      )}

      {hasNextPage && (
        <div
          className={clsx("mt-4 flex mx-auto justify-center", {
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

// Compact card used in both the "Top Companies" row and the "Add To Your
// Circle" grid — logo (or a generic building placeholder), name + verified
// badge, tagline, and a Connect/View Profile action. No description, no
// location, no reviews — those only show on the full company profile.
const CompanyCard = ({ company, currentUser }) => {
  const hasLogo = Boolean(company?.logo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border rounded-xl p-4 flex flex-col items-center text-center gap-2"
    >
      {hasLogo ? (
        <Avatar
          // className={clsx("")}
          size="2xl"
          src={company?.logo}
          name={company?.company_name}
        />
      ) : (
        <div className="size-[128px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
          <Building2 className="size-[128px]" />
        </div>
      )}

      <div className="w-full flex flex-col items-center min-w-0">
        <CompanyName
          slug={company?.slug}
          name={company?.company_name}
          verified={company?.verify}
          size="sm"
          company={true}
        />
        {company?.organization_type && (
          <span className="!line-clamp-1 text-xs text-gray-500 max-w-full">
            {company?.organization_type}
          </span>
        )}
      </div>

      {currentUser?.email === company?.profile ? (
        <Link to={`/company/${company?.slug}`} className="w-full">
          <PrimaryButton className="!w-full !text-xs">View Profile</PrimaryButton>
        </Link>
      ) : (
        <div className="w-full">
          <ConnectButton
            id={Number(company?.id)}
            slug={company?.slug}
            type="company"
            data={company}
            connection_status={company?.connection_status}
          />
        </div>
      )}
    </motion.div>
  );
};

// Kept for other pages that still import the old grid (e.g. the Search
// page's "Companies" tab), unchanged from before.
export const CompaniesArray = ({
  isSearch,
  array,
  companies = [],
  searchLoading,
}) => {
  const companyArray = isSearch ? array : companies;
  const { user: currentUser } = useAuth();

  return searchLoading ? (
    <PageLoading hasLogo={false} text="Getting companies" />
  ) : companyArray?.length < 1 ? (
    <LightParagraph>No company found in search</LightParagraph>
  ) : (
    <section
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4`}
    >
      {companyArray?.map((company) => (
        <CompanyCard key={company?.id} company={company} currentUser={currentUser} />
      ))}
    </section>
  );
};