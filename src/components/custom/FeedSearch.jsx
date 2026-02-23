import { SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";

function FeedSearch({ className }) {
  const { searchParams, pathname } = useCustomSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search_query") || "";

  const handleSearch = (evt) => {
    const value = evt.currentTarget.value;

    if (evt.key === "Enter") {
      if (value.trim()) {
        navigate(`/search?search_query=${encodeURIComponent(value.trim())}`);
      }
    }
  };

  return (
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
  );
}

export default FeedSearch;
