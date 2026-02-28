import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/userContext";
import { useGetCurrentCompany } from "../../../hooks";
import { CompanyUserType } from "../../../lib/helpers/types";
import CreatePost from "./CreatePost";
import DiscoverPosts from "./DiscoverPosts";

const DiscoverFeed = () => {
  const { user: currentUser, setUser } = useAuth();

  const { data: companies = [], isLoading } = useGetCurrentCompany();

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser, setUser]);

  console.log("Current User:", currentUser);
  return (
    <section className="">
      <section className="flex items-baseline gap-2 max-sm:px-4 sm:container mt-2">
        <h1 className="text-2xl font-bold">Discover</h1>
        {currentUser &&
          // currentUser?.user_type === CompanyUserType &&
          (currentUser?.is_first_time_user || companies.length < 1) && (
            <Link
              to={
                currentUser?.is_first_time_user
                  ? "/update-profile"
                  : currentUser && currentUser?.user_type === CompanyUserType
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
      </section>
      <CreatePost />
      <DiscoverPosts />
    </section>
  );
};

export default DiscoverFeed;
