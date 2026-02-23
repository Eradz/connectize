import clsx from "clsx";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useNavigation,
} from "react-router-dom";
import Sidebar from "../components/admin/markets/sidebar";
import Navbar from "../components/userProfile/Navbar";
import TrialBanner from "../components/TrialBanner";

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
    <main className="bg-background w-full lg:w-[80rem] lg:mx-auto h-screen flex flex-col flex-1 overflow-x-hidden ">
      {/* <TrialBanner persistent={false} dismissibleDuration={180000} /> */}
      <Navbar />
      <section
        className={clsx(
          // Added overflow-x-hidden and max-w-full to stop child 100vw elements causing shift
          "flex flex-col items-start md:flex-row overflow-x-hidden max-w-full lg:w-[80rem] lg:mx-auto overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          {
            "": !isSinglePostRoute && !isHomeRoute,
            // Subtract navbar height (64px) plus dynamic safe areas handled via padding
            "flex-1": isMessagesRoute,
          }
        )}
      >
        <Sidebar />
        <section
          className={clsx(
            // Added relative and overflow-x-hidden to isolate scroll context & prevent horizontal bleed
            "md:px-3 gap-2 w-full h-full overflow-x-hidden relative pb-24 md:pb-0",
            !isMessagesRoute && "grid grid-cols-1"
          )}
        >
          {/* Wrap Outlet to enforce full-width clamp */}
            <div className={clsx(
              "w-full xl:w-[968px] h-full mx-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              isMessagesRoute ? "overflow-hidden" : "overflow-auto pb-14 lg:pb-0"
            )}>
            <Outlet />
          </div>
        </section>
      </section>
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
