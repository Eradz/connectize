import { Outlet } from "react-router-dom";
import TopServiceSuggestions from "../components/admin/feeds/TopServiceSuggestions";
import PageLoading from "../components/PageLoading";
import ProfileCompletionBanner from "../components/ProfileCompletionBanner";
import useRedirect from "../hooks/useRedirect";
import { getSession } from "../lib/session";

function FeedLayout({ requireAuth = true }) {
  const session = getSession();
  // Public pages (e.g. the crawlable post detail) keep the feed layout — and
  // its right sidebar — without forcing a login. The sidebar widgets degrade
  // gracefully when logged out (they render nothing / "No suggestions").
  useRedirect(requireAuth && !session, "/login");
  if (requireAuth && !session) return <PageLoading text="Getting page ready" />;
  return (
    <section className="w-full flex max-xl:flex-col gap-3 lg:justify-between ">
      <section className="w-full xl:w-[58%] shrink-0 space-y-6">
        {/* Renders nothing once the profile has a first and last name. */}
        <ProfileCompletionBanner />
        <Outlet />
      </section>
      <TopServiceSuggestions />
    </section>
  );
}

export default FeedLayout;
