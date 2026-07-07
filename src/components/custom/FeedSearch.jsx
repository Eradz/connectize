import { SearchOutlined } from "@ant-design/icons";
import { Avatar, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSearchResults } from "../../api-services/search";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

function companyHref(company) {
  return `/${company?.slug || company?.company_name || ""}`;
}

function FeedSearch({ className }) {
  const { searchParams } = useCustomSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get("search_query") || "";
  const [value, setValue] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounce the typed value before hitting the API.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [value]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClickOutside(evt) {
      if (containerRef.current && !containerRef.current.contains(evt.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const enabled = open && debounced.length >= MIN_CHARS;

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggest", debounced],
    queryFn: () => getSearchResults({ searchTerm: debounced, pageSize: 5 }),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });

  const users = useMemo(() => data?.users || [], [data]);
  const companies = useMemo(() => data?.companies || [], [data]);
  const hasResults = users.length > 0 || companies.length > 0;

  const goToFullSearch = (term) => {
    const q = (term ?? value).trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?search_query=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (evt) => {
    if (evt.key === "Enter") {
      goToFullSearch();
    } else if (evt.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden md:block"
      role="combobox"
      aria-expanded={open && enabled}
      aria-haspopup="listbox"
    >
      <SearchOutlined className="absolute top-1/2 -translate-y-1/2 left-2.5 size-3 text-gray-400 z-10" />
      <input
        type="search"
        placeholder="Search anything..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-label="Search"
        className={clsx(
          "block w-full xs:!max-w-[250px] sm:!w-[400px] !max-w-[250px] py-1.5 px-3 border border-gray-200 bg-gray-100/70 rounded-full placeholder:text-xs text-sm focus:outline-0 focus:border-gold transition-all duration-300 indent-4",
          className
        )}
      />

      {open && enabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100000] max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {isFetching && !hasResults ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
              <Spinner size="sm" color="#F1C644" /> Searching…
            </div>
          ) : hasResults ? (
            <div role="listbox" className="py-1.5">
              {users.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    People
                  </p>
                  {users.map((user) => (
                    <Link
                      key={`user-${user.id}`}
                      to={`/co/${user.id}`}
                      role="option"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                    >
                      <Avatar
                        size="sm"
                        name={user.full_name}
                        src={user.avatar || undefined}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user.full_name || "Connectize member"}
                        </p>
                        {user.country ? (
                          <p className="truncate text-xs text-gray-500">
                            {user.country}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {companies.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Companies
                  </p>
                  {companies.map((company) => (
                    <Link
                      key={`company-${company.id}`}
                      to={companyHref(company)}
                      role="option"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                    >
                      <Avatar
                        size="sm"
                        borderRadius="md"
                        name={company.company_name}
                        src={company.logo || undefined}
                      />
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {company.company_name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToFullSearch()}
                className="mt-1 flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-gold hover:bg-gray-50"
              >
                <SearchOutlined className="size-3" />
                See all results for “{debounced}”
              </button>
            </div>
          ) : (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToFullSearch()}
              className="flex w-full items-center gap-2 px-4 py-4 text-left text-sm text-gray-500 hover:bg-gray-50"
            >
              <SearchOutlined className="size-3" />
              No quick matches — search all for “{debounced}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FeedSearch;
