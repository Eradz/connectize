import clsx from "clsx";
import { Outlet, useLocation, useNavigation } from "react-router";
import Sidebar from "../components/admin/markets/sidebar";
import Navbar from "../components/userProfile/Navbar";

function Loader() {
  return <div className="fixed top-0 right-0 text-4xl">Loader</div>;
}
const AppLayout = () => {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const isSinglePostRoute = pathname.startsWith("/posts/");
  const isHomeRoute = pathname === "/" || pathname.startsWith("/messages");
  const isMessagesRoute = pathname.startsWith("/messages");

  return (
    <main className="bg-background w-full  overflow-x-  h-screen flex flex-col">
      <Navbar />

      {isNavigating && <Loader />}

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
