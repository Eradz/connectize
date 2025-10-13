import { Outlet } from "react-router";
import TopServiceSuggestions from "../components/admin/feeds/TopServiceSuggestions";
import PageLoading from "../components/PageLoading";
import useRedirect from "../hooks/useRedirect";
import { getSession } from "../lib/session";

function FeedLayout() {
  const session = getSession();
  useRedirect(!session, "/login");
  if (!session) return <PageLoading text="Getting page ready" />;
  return (
    <section className="w-full max-w-full flex max-xl:flex-col gap-3 lg:gap-6 overflow-hidden">
      <section className="w-full xl:w-[55%] shrink-0 space-y-6 overflow-hidden">
        <Outlet />
      </section>
      <TopServiceSuggestions />
    </section>
  );
}

export default FeedLayout;
