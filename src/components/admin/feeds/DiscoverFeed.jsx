import { useEffect, useState } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/userContext";
import { useGetActionableCompanies, useGetCurrentCompany } from "../../../hooks";
import { CompanyUserType } from "../../../lib/helpers/types";
import CreatePost from "./CreatePost";
import DiscoverPosts from "./DiscoverPosts";
import { webRoutes } from "../../../lib/webRoutes";

// Feed tabs (parity with the mobile app's FeedScreen segmented control).
// "Following" only makes sense for signed-in users.
const FEED_TABS = [
  { key: "discover", label: "Discover", requiresAuth: false },
  { key: "following", label: "Following", requiresAuth: true },
  { key: "trending", label: "Trending", requiresAuth: false },
];

const DiscoverFeed = () => {
  const { user: currentUser, setUser } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState("discover");

  const visibleTabs = FEED_TABS.filter(
    (tab) => !tab.requiresAuth || !!currentUser
  );
  // Never leave an unauthenticated user stranded on the Following tab
  const feedType =
    activeFeedTab === "following" && !currentUser ? "discover" : activeFeedTab;

  const { data: companies = [] } = useGetCurrentCompany();
  const { data: actionableCompanies = [] } =
    useGetActionableCompanies("company_post");
  const canCreatePost = true;
    // currentUser?.user_type === CompanyUserType || actionableCompanies.length > 0;

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser, setUser]);
  return (
    <section className="">
      <section className="flex items-baseline gap-2 max-sm:px-4 sm:container mt-2">
        <h1 className="text-2xl font-bold">Discover</h1>
        {currentUser &&
          (currentUser?.is_first_time_user || companies.length < 1) && (
            <Link
              to={
                currentUser?.is_first_time_user
                  ? "/update-profile"
                  : currentUser && currentUser?.user_type === CompanyUserType
                  ? webRoutes.createCompany
                  : ""
              }
              className="hover:!no-underline !underline !text-gray-400 hover:!text-black font-semibold text-sm"
            >
              {/* {currentUser?.is_first_time_user
                ? "Complete your profile"
                : "Create Company"} */}
            </Link>
          )}
      </section>
      {canCreatePost && <CreatePost />}

      {/* Feed tabs - segmented control matching the mobile app's Discover /
          Following / Trending row, styled like the site's solid-rounded tabs
          (gold active pill, cf. components/custom/tabs.jsx) */}
      <div className="max-sm:px-4 sm:container mt-4">
        <div
          role="tablist"
          aria-label="Feed tabs"
          className="flex w-full sm:w-fit items-center gap-1 rounded-full bg-white p-1 shadow-sm"
        >
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={feedType === tab.key}
              onClick={() => setActiveFeedTab(tab.key)}
              className={clsx(
                "flex-1 sm:flex-none rounded-full px-5 py-2 !text-xs lg:!text-sm font-medium text-nowrap transition-colors duration-300",
                feedType === tab.key
                  ? "bg-gold text-black"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DiscoverPosts feedType={feedType} />
    </section>
  );
};

export default DiscoverFeed;
