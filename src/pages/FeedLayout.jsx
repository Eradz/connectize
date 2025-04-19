import React from "react";
import { Outlet } from "react-router-dom";
import TopServiceSuggestions from "../components/admin/feeds/TopServiceSuggestions";

function FeedLayout() {
  return (
    <section className="w-full flex max-xl:flex-col gap-3 lg:gap-6">
      <section className="w-full xl:w-[55%] shrink-0 space-y-6">
        <Outlet />
      </section>
      <TopServiceSuggestions />
    </section>
  );
}

export default FeedLayout;
