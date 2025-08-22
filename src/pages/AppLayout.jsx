import clsx from "clsx";
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
  const isSinglePostRoute = pathname.startsWith("/posts/");
  const isHomeRoute = pathname === "/" || pathname.startsWith("/messages");
  const isMessagesRoute = pathname.startsWith("/messages");

  return (
    <main className="bg-background w-full  overflow-x-  h-screen flex flex-col">
      <Navbar />

      <section
        className={clsx(
          "flex flex-col items-start md:flex-row gap-4 xl:!gap-5 md:p-4 md:container",
          {
            "py-6 px-2": !isSinglePostRoute && !isHomeRoute,
            "flex-1 h-[calc(100%_-_64px)]": isMessagesRoute,
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
    <main className="pt-16 p-4 container mx-auto">
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
