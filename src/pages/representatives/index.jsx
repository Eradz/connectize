import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getAllRepresentatives,
  getOrCreateRepresentativeCategory,
} from "../../api-services/representatives";
import HeadingText from "../../components/HeadingText";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import RepresentativeCard from "../../components/representatives/RepresentativeCard";
// import SEO from "../../components/SEO";
import { ManageRepresentativesLink } from "../feed/companyProfile";
import { usePageination } from "../../hooks/usePagination";
import { Link, useSearchParams } from "react-router";
import PrimaryButton from "../../components/PrimaryButton";
import clsx from "clsx";
import { useGetSingleCompany } from "../../hooks";
import { createSEO } from "../../components/SEO";
import { usePaginatedRepresentatives } from "../../hooks/useRepresentatives";

export const meta = () =>
  createSEO({
    title: "Representatives | Connectize",
  });

export default function RepresentativesPage() {
  const [searchParams] = useSearchParams();

  const companyParam = searchParams.get("company") || "";
  const splittedCompanyParam = companyParam.split("---");
  const companyId = splittedCompanyParam[0] || null;
  const companySlug = splittedCompanyParam[1] || null;

  const userIdParam = searchParams.get("user") || undefined;

  const { data: companyDetails, isLoading: isLoadingCompanyDetails } =
    useGetSingleCompany(companySlug, { enabled: !!companySlug });

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading: repsLoading,
  } = usePaginatedRepresentatives({
    companyId,
    userId: userIdParam,
  });

  const repsFirstPage = paginatedData?.pages?.[0]?.data;

  // Categories are already included in the API response, no need to fetch separately
  // const { data: representativeCategories, isLoading: repsCatLoading } =
  //   useQuery({
  //     queryKey: ["representatives-categories"],
  //     queryFn: () => getOrCreateRepresentativeCategory(),
  //   });

  // // Memoize category lookup for better performance
  // const categoryMap = useMemo(() => {
  //   return representativeCategories?.reduce((acc, cat) => {
  //     acc[cat.id] = cat.type;
  //     return acc;
  //   }, {});
  // }, [representativeCategories]);

  if (repsLoading)
    return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      {/* <SEO title="Representatives | Connectize" /> */}
      <section className="flex flex-wrap justify-between gap-4 items-center">
        <HeadingText>
          Representatives {companyId && <br />}{" "}
          {isLoadingCompanyDetails && !!companyId ? (
            <div className="inline-block w-1/3 h-4 skeleton rounded mt-2" />
          ) : (
            !!companyId && (
              <Link to={"/" + companySlug} className="!text-gold">
                @{companyDetails?.company_name}
              </Link>
            )
          )}
        </HeadingText>

        <ManageRepresentativesLink />
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {repsFirstPage?.length < 1 ? (
          <div className="py-4">
            <LightParagraph>No representatives yet...</LightParagraph>
          </div>
        ) : (
          paginatedData?.pages.map((page) => {
            return page?.data
              ?.filter(
                (reps) =>
                  reps?.user !== null &&
                  reps?.company !== null &&
                  reps?.category !== null
              )
              .map((rep) => {
                // API returns category as an object with {id, type}
                const role = typeof rep?.category === 'object' ? rep.category.type : rep?.category;

                return (
                  <RepresentativeCard
                    key={rep?.id}
                    company={rep.company}
                    role={role}
                    user={rep.user}
                  />
                );
              });
          })
        )}
      </section>

      {hasNextPage && (
        <div
          className={clsx("mt-10 flex justify-center", {
            "animate-pulse": isFetching,
          })}
        >
          <PrimaryButton
            onClick={fetchNextPage}
            disabled={!hasNextPage || isFetching || isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading More..." : "Load More"}
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}
