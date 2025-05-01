import clsx from "clsx";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/markets/sidebar";
import Navbar from "../components/userProfile/Navbar";

const AppLayout = () => {
  const { pathname } = useLocation();
  const isSinglePostRoute = pathname.startsWith("/posts/");
  const isHomeRoute = pathname === "/";
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section
        className={clsx(
          "flex flex-col items-start md:flex-row gap-4 xl:!gap-5 md:p-4",
          {
            "max-md:container p-3": !isSinglePostRoute && !isHomeRoute,
          }
        )}
      >
        <Sidebar />
        <section className="grid grid-cols-1 md:px-0 gap-2 w-full max-md:mb-16">
          <Outlet />
        </section>
      </section>
    </main>
  );
};

export default AppLayout;
