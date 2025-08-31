import clsx from "clsx";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/markets/sidebar";
import Navbar from "../components/userProfile/Navbar";

const AppLayout = () => {
  const { pathname } = useLocation();
  const isSinglePostRoute = pathname.startsWith("/posts/");
  const isHomeRoute = pathname === "/" || pathname.startsWith("/messages");
  const isMessagesRoute = pathname.startsWith("/messages");
  return (
  <main className="bg-background w-full h-full flex flex-col flex-1 safe-area-top safe-area-bottom">
      <Navbar />

  <section
        className={clsx(
          "flex flex-col items-start md:flex-row gap-4 xl:!gap-5 md:p-4 md:container",
          {
            "py-6 px-2": !isSinglePostRoute && !isHomeRoute,
    // Subtract navbar height (64px) plus dynamic safe areas handled via padding
    "flex-1": isMessagesRoute,
          }
        )}
      >
        <Sidebar />
        <section
          className={clsx(
            "md:px-0 gap-2 w-full max-md:mb-16 h-full",
            !isMessagesRoute && "grid grid-cols-1"
          )}
        >
          <Outlet />
        </section>
      </section>
  {/* Spacer to ensure scrollable content isn't hidden behind fixed bottom nav (height + safe area) */}
  <div className="h-20 md:hidden" aria-hidden="true" />
    </main>
  );
};

export default AppLayout;
