import { useQuery } from "@tanstack/react-query";
import {
  getAllRepresentatives,
  getOrCreateRepresentativeCategory,
} from "../../api-services/representatives";
import { getAllUsers } from "../../api-services/users";
import HeadingText from "../../components/HeadingText";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import RepresentativeCard from "../../components/representatives/RepresentativeCard";
// import SEO from "../../components/SEO";
import { usePollAllCompanies } from "../../hooks/usePolling";
import { ManageRepresentativesLink } from "../feed/companyProfile";
import { usePageination } from "../../hooks/usePagination";
import { Link, useSearchParams } from "react-router";
import PrimaryButton from "../../components/PrimaryButton";
import clsx from "clsx";
import { useGetSingleCompany } from "../../hooks";
import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Representatives | Connectize",
  });

export default function RepresentativesPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const [searchParams] = useSearchParams();

  const companyParam = searchParams.get("company") || "";
  const splittedCompanyParam = companyParam.split("---");
  const companyId = splittedCompanyParam[0] || null;
  const companySlug = splittedCompanyParam[1] || null;

  const userIdParam = searchParams.get("user") || undefined;

  const { data: companies, isLoading: companyLoading } = usePollAllCompanies();

  const { data: companyDetails, isLoading: isLoadingCompanyDetails } =
    useGetSingleCompany(companySlug, { enabled: !!companySlug });
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading: repsLoading,
  } = usePageination({
    queryKey: [
      "representatives",
      "all",
      { company: companyId, user: userIdParam },
    ],
    queryFn: async ({ pageParam }) =>
      await getAllRepresentatives(
        {
          // status: "True",
          company_id: companyId,
          user: userIdParam,
          page_size: 2,
          page: pageParam,
        },
        true
      ),
  });

  const repsFirstPage = paginatedData?.pages?.[0]?.data;

  const { data: representativeCategories, isLoading: repsCatLoading } =
    useQuery({
      queryKey: ["representatives-categories"],
      queryFn: getOrCreateRepresentativeCategory,
    });

  if (isLoading || companyLoading || repsLoading || repsCatLoading)
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
                  reps?.role !== null
              )
              .map((reps) => {
                const user = users?.find((user) => reps?.user === user?.id);
                const company = companies?.results?.find(
                  (company) => reps?.company === company?.id
                );
                const role = representativeCategories?.find(
                  (category) => category?.id === reps?.category
                )?.type;

                const formattedRepsData = {
                  user,
                  company,
                  role,
                };

                return (
                  <RepresentativeCard key={reps?.id} {...formattedRepsData} />
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
