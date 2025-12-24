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

  return (
    <section className="w-full max-w-full">
      {/* Header with Discover title and Create Post button */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          
          {currentUser &&
            currentUser?.user_type === CompanyUserType &&
            (currentUser?.is_first_time_user || companies.length < 1) && (
              <Link
                to={
                  currentUser?.is_first_time_user
                    ? "/update-profile"
                    : currentUser && currentUser?.user_type === CompanyUserType
                    ? "create-company"
                    : ""
                }
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {currentUser?.is_first_time_user
                  ? "Complete your profile"
                  : "Create Company"}
              </Link>
            )}
        </div>

        {/* Create Post Button (desktop) */}
        {currentUser?.user_type === CompanyUserType && (
          <Link
            to="/create-post"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Create Post</span>
          </Link>
        )}
      </header>

      {/* Posts Feed - No tabs, just direct feed */}
      <div className="bg-gray-50">
        <DiscoverPosts />
      </div>

      {/* Floating Create Post Button (mobile) */}
      {currentUser?.user_type === CompanyUserType && (
        <Link
          to="/create-post"
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-900 z-50"
        >
          +
        </Link>
      )}
    </section>
  );
};

export default DiscoverFeed;