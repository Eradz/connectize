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
import SEO from "../../components/SEO";
import { usePollAllCompanies } from "../../hooks/usePolling";
import { ManageRepresentativesLink } from "../feed/companyProfile";

export default function RepresentativesPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const { data: companies, isLoading: companyLoading } = usePollAllCompanies();

  const { data: representatives, isLoading: repsLoading } = useQuery({
    queryKey: ["representatives"],
    queryFn: () => getAllRepresentatives({ status: "True" }),
  });

  const { data: representativeCategories, isLoading: repsCatLoading } =
    useQuery({
      queryKey: ["representatives-categories"],
      queryFn: getOrCreateRepresentativeCategory,
    });

  if (isLoading || companyLoading || repsLoading || repsCatLoading)
    return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      <SEO title="Representatives | Connectize" />
      <section className="flex flex-wrap justify-between gap-4">
        <HeadingText>Representatives</HeadingText>

        <ManageRepresentativesLink />
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {representatives?.length < 1 ? (
          <div className="py-4">
            <LightParagraph>No representatives yet...</LightParagraph>
          </div>
        ) : (
          representatives
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
            })
        )}
      </section>
    </section>
  );
}
