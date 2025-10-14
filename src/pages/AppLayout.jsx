import clsx from "clsx";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useNavigation,
} from "react-router";
import Sidebar from "../components/admin/markets/sidebar";
import Navbar from "../components/userProfile/Navbar";

const AppLayout = () => {
  const { pathname } = useLocation();

  // Cleanup any stuck scroll-blocking classes when navigating between routes
  useEffect(() => {
    document.body.classList.remove('messages-opened');
  }, [pathname]);
  const isSinglePostRoute = pathname.startsWith("/posts/");
  const isHomeRoute = pathname === "/" || pathname.startsWith("/messages");
  const isMessagesRoute = pathname.startsWith("/messages");

  return (
    <main className="bg-background w-full h-full flex flex-col flex-1 safe-area-top safe-area-bottom overflow-x-hidden">
      <Navbar />
      <section
        className={clsx(
          // Added overflow-x-hidden and max-w-full to stop child 100vw elements causing shift
          "flex flex-col items-start md:flex-row gap-4 xl:!gap-5 md:p-4 md:container overflow-x-hidden max-w-full",
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
            // Added relative and overflow-x-hidden to isolate scroll context & prevent horizontal bleed
            "md:px-0 gap-2 w-full max-md:mb-16 h-full overflow-x-hidden relative",
            !isMessagesRoute && "grid grid-cols-1"
          )}
        >
          {/* Wrap Outlet to enforce full-width clamp */}
          <div className="w-full max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </section>
      </section>
      {/* Spacer to ensure scrollable content isn't hidden behind fixed bottom nav (height + safe area) */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </main>
  );
};

export default AppLayout;

export function ErrorBoundary({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack = undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto overflow-x-hidden">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
