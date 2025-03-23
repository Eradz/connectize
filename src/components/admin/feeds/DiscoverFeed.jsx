import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { getCompanyByIdOrEmail } from "../../../api-services/companies";
import { useAuth } from "../../../context/userContext";
import { CompanyUserType } from "../../../lib/helpers/types";
import CreatePost from "./CreatePost";
import DiscoverPosts from "./DiscoverPosts";
import DiscoverPostTabs from "./DiscoverPostTabs";

const DiscoverFeed = () => {
  const { user: currentUser, setUser } = useAuth();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanyByIdOrEmail(),
    enabled: !!currentUser,
  });

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser, setUser]);
  return (
    <section className="space-y-4 max-md:container">
      <div className="flex items-baseline gap-2">
        <h1 className="text-3xl font-semibold">Discover</h1>
        {(currentUser || !isLoading) &&
          currentUser?.user_type === CompanyUserType &&
          (currentUser?.is_first_time_user || companies.length < 1) && (
            <Link
              to={
                currentUser?.is_first_time_user
                  ? "/update-profile"
                  : currentUser?.user_type === CompanyUserType
                  ? "create-company"
                  : ""
              }
              className="hover:!no-underline !underline !text-gray-400 hover:!text-black font-semibold text-sm"
            >
              {currentUser?.is_first_time_user
                ? "Complete your profile"
                : "Create Company"}
            </Link>
          )}
      </div>
      {currentUser?.user_type === CompanyUserType && <CreatePost />}
      <DiscoverPostTabs />
      <DiscoverPosts />
    </section>
  );
};

export default DiscoverFeed;
