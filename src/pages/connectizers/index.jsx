import clsx from "clsx";
import { Link } from "react-router-dom";
import { getConnectizers } from "../../api-services/users";
import ConnectButton from "../../components/ConnectButton";
import HeadingText from "../../components/HeadingText";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import PrimaryButton from "../../components/PrimaryButton";
import { createSEO } from "../../components/SEO";
import { usePageination } from "../../hooks/usePagination";
import { getUserDisplayName, getUserHandle } from "../../lib/userDisplay";

export const meta = () =>
  createSEO({
    title: "Connectizers | Connectize",
  });

/**
 * Everyone on the platform.
 *
 * The ordering - people you have no relationship with first, then alphabetically -
 * comes from the server (api/users/connectizers/). Doing it here would be wrong
 * once paginated: a name belonging on page 1 could surface on page 3.
 *
 * This replaces the old Representatives entry in the main navigation. The
 * company-scoped representatives page is untouched and still reachable from a
 * company profile.
 */
export default function ConnectizersPage() {
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = usePageination({
    queryKey: ["connectizers", "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam }) =>
      getConnectizers({ page_size: 24, page: pageParam }, true),
  });

  const firstPage = paginatedData?.pages?.[0]?.data;

  if (isLoading) return <PageLoading hasLogo={false} />;

  return (
    <section className="space-y-4">
      <section className="flex flex-wrap justify-between gap-4 items-center">
        <HeadingText>Connectizers</HeadingText>
      </section>

      <LightParagraph>
        Your next partner, supplier or hire is on this list. Every connection puts
        you one introduction closer to the deal you haven&rsquo;t heard about yet.
      </LightParagraph>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {firstPage?.length < 1 ? (
          <div className="py-4">
            <LightParagraph>No one to show yet...</LightParagraph>
          </div>
        ) : (
          paginatedData?.pages.map((page) =>
            page?.data?.map((user) => (
              <ConnectizerCard key={user?.id} user={user} />
            )),
          )
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

const ConnectizerCard = ({ user }) => {
  const name = getUserDisplayName(user) || "Unknown";
  const handle = getUserHandle(user);
  const avatar = user?.avatar;
  const subtitle = user?.role || user?.city || user?.country || (handle ? `@${handle}` : "");
  // A person can represent more than one company; show the first and count the rest.
  const representations = Array.isArray(user?.representing) ? user.representing : [];
  const primary = representations[0];
  const extraCount = representations.length - 1;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4">
      <Link to={`/co/${user?.id}`} className="flex items-center gap-3 min-w-0">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="size-11 shrink-0 rounded-full bg-gray-100" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm text-gray-900">{name}</p>
          {!!subtitle && (
            <p className="truncate text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </Link>

      {!!primary && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="rounded-full bg-gold/15 px-2 py-0.5 font-semibold text-gray-900">
            Representative
          </span>
          <span className="truncate text-gray-600">
            {primary.role ? `${primary.role} at ` : "at "}
            <Link
              to={`/${primary.company_slug || primary.company_id}`}
              className="font-semibold !text-gold"
            >
              {primary.company_name}
            </Link>
            {extraCount > 0 && ` +${extraCount} more`}
          </span>
        </div>
      )}

      {/* slug doubles as the id for user connects, matching the other call sites */}
      <ConnectButton
        id={user?.id}
        slug={user?.id}
        first_name={user?.first_name}
        connection_status={user?.connection_status}
      />
    </div>
  );
};
