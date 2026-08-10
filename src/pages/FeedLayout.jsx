import { Outlet } from "react-router-dom";
import TopServiceSuggestions from "../components/admin/feeds/TopServiceSuggestions";
import PageLoading from "../components/PageLoading";
import useRedirect from "../hooks/useRedirect";
import { getSession } from "../lib/session";
import { useAuth } from "../context/userContext";
import usePresenceModalVisibility from "../utils/usePresenceModalVisibility";
import BusinessPresenceModal from "../components/CreateCompanyPopUp";

function FeedLayout({ requireAuth = true }) {
  const session = getSession();
  const { user } = useAuth();
  // Public pages (e.g. the crawlable post detail) keep the feed layout — and
  // its right sidebar — without forcing a login. The sidebar widgets degrade
  // gracefully when logged out (they render nothing / "No suggestions").
  useRedirect(requireAuth && !session, "/login");
  const { open: showPresenceModal, close: closePresenceModal } =
    usePresenceModalVisibility((user?.user_type === "company" && user?.companies?.length === 0));
  if (requireAuth && !session) return <PageLoading text="Getting page ready" />;
  return (
    <section className="w-full flex max-xl:flex-col gap-3 lg:justify-between ">
      <section className="w-full xl:w-[58%] shrink-0 space-y-6">
        <Outlet />
      </section>
      <TopServiceSuggestions />
       {showPresenceModal && (
        <BusinessPresenceModal onClose={closePresenceModal} />
      )}
    </section>
  );
}

export default FeedLayout;
