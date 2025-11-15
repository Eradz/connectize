import { SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";
import { SearchTab } from "../../pages/search";
import ReusableModal from "./ResusableModal";

function FeedSearch({ className }) {
  const { updateSearchParams, searchParams, pathname } =
    useCustomSearchParams();

  const searchQuery = searchParams.get("search_query") || "";

  const handleSearch = (evt) => {
    const value = evt.currentTarget.value;

    if (evt.key === "Enter") {
      if (value.trim()) {
        updateSearchParams({ search_query: value });
      } else {
        updateSearchParams({ search_query: null });
      }
    }
  };
  return (
    <>
      <div className="relative">
        <SearchOutlined className="absolute top-1/2 -translate-y-1/2 left-2.5 size-3 text-gray-400" />
        <input
          type="search"
          placeholder="Search anything..."
          onKeyUp={handleSearch}
          defaultValue={searchQuery}
          className={clsx(
            "block w-full xs:!max-w-[250px] sm:!w-[400px] !max-w-[250px] py-1.5 px-3 border border-gray-200 bg-gray-100/70 rounded-full placeholder:text-xs text-sm focus:outline-0 focus:border-gold transition-all duration-300 indent-4",
            className
          )}
        />
      </div>

      <ReusableModal
        isOpen={searchQuery && pathname !== "/search"}
        onClose={() => updateSearchParams({ search_query: null })}
        title={
          <div className="flex items-baseline gap-1 flex-wrap">
            <span>Search Results for</span>{" "}
            <Link
              to={`/search?search_query=${searchQuery}`}
              className="!underline !text-gray-500 hover:!text-gold transition-colors"
            >
              {searchQuery}
            </Link>
          </div>
        }
        size="3xl"
      >
        <SearchTab />
      </ReusableModal>
    </>
  );
}

export default FeedSearch;
