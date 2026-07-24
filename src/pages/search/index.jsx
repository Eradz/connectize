import { Avatar, Button } from "@chakra-ui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
} from "@ant-design/icons";
import {
  Store,
  Briefcase,
  CalendarDays,
  BookOpen,
  Handshake,
  MessageSquare,
  Truck,
  Building2,
  Users,
  FileText,
  Layers,
} from "lucide-react";
import SEO, { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Search | Connectize",
    description: "Search for professionals, companies, jobs, products, and services across the Connectize oil and gas network.",
  keywords: "search, find professionals, oil and gas companies, energy jobs, industry search",
  });

import { getSEOConfig } from "../../lib/seoConfig";
import { getSearchResults } from "../../api-services/search";
import DiscoverPosts from "../../components/admin/feeds/DiscoverPosts";
import ConnectButton from "../../components/ConnectButton";
import LightParagraph from "../../components/ParagraphText";
import { avatarStyle } from "../../components/ResponsiveNav";
import Username from "../../components/Username";
import { useAuth } from "../../context/userContext";
import { useCustomSearchParams } from "../../hooks/useCustomSearchParams";
import { getRandomOilAndGasKeyword } from "../../lib/helpers/getRandomOilAndGasWords";
import { getUserDisplayName, getUserHandle } from "../../lib/userDisplay";
import { CompaniesArray } from "../companies";
import {
  SearchMarketplaceCard,
  SearchJobCard,
  SearchEventCard,
  SearchArticleCard,
  SearchDealRoomCard,
  SearchForumTopicCard,
  SearchLogisticsProviderCard,
  SearchResultSection,
} from "../../components/search/SearchCards";

export default function Search() {
  return (
    <section>
      <SearchTab />
    </section>
  );
}

function useSearchResults(searchQuery) {
  const { user: currentUser } = useAuth();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", { searchQuery }],
    queryFn: () => getSearchResults({ searchTerm: searchQuery }),
    enabled: !!searchQuery && !!currentUser,
    staleTime: 30 * 1000,
  });

  return {
    posts: searchResults?.posts || [],
    companies: searchResults?.companies || [],
    users: searchResults?.users || [],
    marketplace: searchResults?.marketplace || [],
    jobs: searchResults?.jobs || [],
    events: searchResults?.events || [],
    articles: searchResults?.articles || [],
    deal_rooms: searchResults?.deal_rooms || [],
    forum_topics: searchResults?.forum_topics || [],
    logistics_providers: searchResults?.logistics_providers || [],
    isLoading,
  };
}

/* ─── Tab definitions ─── */
const TAB_CONFIG = [
  { key: "all", label: "All", icon: Layers },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "users", label: "People", icon: Users },
  { key: "marketplace", label: "Marketplace", icon: Store },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "articles", label: "Articles", icon: BookOpen },
  { key: "deal_rooms", label: "Deals", icon: Handshake },
  { key: "forum_topics", label: "Forums", icon: MessageSquare },
  { key: "logistics_providers", label: "Logistics", icon: Truck },
];

export const SearchTab = () => {
  const seoData = getSEOConfig("search");
  const navigate = useNavigate();
  const tabsRef = useRef(null);

  const [activeTab, setActiveTab] = useState("all");
  const [randKeyWord, setRandKeyWord] = useState(getRandomOilAndGasKeyword());

  const { updateSearchParams, searchParams } = useCustomSearchParams();
  const searchQuery = searchParams.get("search_query");

  const data = useSearchResults(searchQuery);

  useEffect(() => {
    if (searchQuery?.toLowerCase() === randKeyWord?.toLowerCase()) {
      setRandKeyWord(getRandomOilAndGasKeyword());
    }
  }, [searchQuery, randKeyWord]);

  // Reset to "all" tab when search query changes
  useEffect(() => {
    setActiveTab("all");
  }, [searchQuery]);

  const isNotEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

  const getCount = useCallback(
    (key) => {
      if (key === "all") return 0;
      return data[key]?.length || 0;
    },
    [data]
  );

  const totalResults = TAB_CONFIG.filter((t) => t.key !== "all").reduce(
    (sum, t) => sum + getCount(t.key),
    0
  );

  // Inline search handler for re-searching on the search page
  const handleSearch = (evt) => {
    if (evt.key === "Enter") {
      const value = evt.currentTarget.value.trim();
      if (value) {
        updateSearchParams({ search_query: value });
      }
    }
  };

  /* ─── Loading state ─── */
  if (data.isLoading && searchQuery) {
    return (
      <>
        <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} />
        <section className="flex items-center justify-center flex-col gap-4 px-4 py-8 min-h-[40vh]">
          <DotLottieReact
            src="/lottie/notification.lottie"
            loop
            autoplay
            className="size-32 shrink-0 pointer-events-none"
          />
          <LightParagraph center>
            Searching for <b className="!text-gold">{searchQuery}</b>...
          </LightParagraph>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ─── Search Bar ─── */}
        <div className="relative mb-6">
          <SearchOutlined className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search posts, companies, marketplace, jobs, events..."
            onKeyUp={handleSearch}
            defaultValue={searchQuery}
            key={searchQuery} // re-mount when query changes to sync value
            className="w-full py-3 pl-10 pr-4 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all shadow-sm"
          />
        </div>

        {/* ─── Result Summary ─── */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">
            {totalResults > 0 ? (
              <>
                Found <b className="text-gray-900">{totalResults}</b> results for{" "}
                <b className="text-gold">{searchQuery}</b>
              </>
            ) : (
              <>
                No results for <b className="text-gray-900">{searchQuery}</b>
              </>
            )}
          </p>
        )}

        {/* ─── Tab Pills ─── */}
        <div className="relative mb-6">
          <div
            ref={tabsRef}
            className="flex gap-1.5 overflow-x-auto scrollbar-hidden pb-1 -mx-1 px-1"
          >
            {TAB_CONFIG.map((tab) => {
              const count = getCount(tab.key);
              const isActive = activeTab === tab.key;
              // Hide empty tabs (except "all")
              if (tab.key !== "all" && count === 0 && !data.isLoading) return null;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                    isActive
                      ? "bg-gold text-dark shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.key !== "all" && count > 0 && (
                    <span
                      className={clsx(
                        "text-[11px] px-1.5 py-0 rounded-full",
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── No Results Empty State ─── */}
        {totalResults === 0 && searchQuery && !data.isLoading && (
          <section className="flex items-center justify-center flex-col gap-4 px-4 py-12">
            <DotLottieReact
              src="/lottie/notification.lottie"
              loop
              autoplay
              className="size-40 shrink-0 pointer-events-none"
            />
            <LightParagraph center>
              We couldn&apos;t find any results for{" "}
              <b className="!text-black">{searchQuery}</b>. Try searching for{" "}
              <button
                onClick={() =>
                  updateSearchParams({
                    search_query: randKeyWord?.toLowerCase(),
                  })
                }
              >
                <b className="capitalize !text-gold">{randKeyWord}</b>
              </button>
            </LightParagraph>
            <div className="flex gap-3 items-center mt-2">
              <Button variant="solid" className="!bg-gold" size="sm">
                <Link to="/">Go Home</Link>
              </Button>
              <Button variant="outline" size="sm">
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </section>
        )}

        {/* ─── "All" Tab — Grouped Sections ─── */}
        {activeTab === "all" && totalResults > 0 && (
          <div>
            {/* Posts */}
            {isNotEmpty(data.posts) && (
              <SearchResultSection
                title="Posts"
                icon={FileText}
                count={data.posts.length}
                onSeeAll={() => setActiveTab("posts")}
              >
                <DiscoverPosts isSearch searchArray={data.posts.slice(0, 3)} />
              </SearchResultSection>
            )}

            {/* Companies */}
            {isNotEmpty(data.companies) && (
              <SearchResultSection
                title="Companies"
                icon={Building2}
                count={data.companies.length}
                onSeeAll={() => setActiveTab("companies")}
              >
                <CompaniesArray
                  hasFilter={false}
                  isSearch
                  array={data.companies.slice(0, 3)}
                />
              </SearchResultSection>
            )}

            {/* People */}
            {isNotEmpty(data.users) && (
              <SearchResultSection
                title="People"
                icon={Users}
                count={data.users.length}
                onSeeAll={() => setActiveTab("users")}
              >
                <PeopleGrid users={data.users.slice(0, 3)} navigate={navigate} />
              </SearchResultSection>
            )}

            {/* Marketplace */}
            {isNotEmpty(data.marketplace) && (
              <SearchResultSection
                title="Marketplace"
                icon={Store}
                count={data.marketplace.length}
                onSeeAll={() => setActiveTab("marketplace")}
              >
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {data.marketplace.slice(0, 3).map((l) => (
                    <SearchMarketplaceCard key={l.id} listing={l} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Jobs */}
            {isNotEmpty(data.jobs) && (
              <SearchResultSection
                title="Jobs"
                icon={Briefcase}
                count={data.jobs.length}
                onSeeAll={() => setActiveTab("jobs")}
              >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {data.jobs.slice(0, 4).map((j) => (
                    <SearchJobCard key={j.id} job={j} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Events */}
            {isNotEmpty(data.events) && (
              <SearchResultSection
                title="Events"
                icon={CalendarDays}
                count={data.events.length}
                onSeeAll={() => setActiveTab("events")}
              >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {data.events.slice(0, 4).map((e) => (
                    <SearchEventCard key={e.id} event={e} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Articles */}
            {isNotEmpty(data.articles) && (
              <SearchResultSection
                title="Articles"
                icon={BookOpen}
                count={data.articles.length}
                onSeeAll={() => setActiveTab("articles")}
              >
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {data.articles.slice(0, 3).map((a) => (
                    <SearchArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Deal Rooms */}
            {isNotEmpty(data.deal_rooms) && (
              <SearchResultSection
                title="Deal Rooms"
                icon={Handshake}
                count={data.deal_rooms.length}
                onSeeAll={() => setActiveTab("deal_rooms")}
              >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {data.deal_rooms.slice(0, 4).map((d) => (
                    <SearchDealRoomCard key={d.id} deal={d} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Forum Topics */}
            {isNotEmpty(data.forum_topics) && (
              <SearchResultSection
                title="Forum Topics"
                icon={MessageSquare}
                count={data.forum_topics.length}
                onSeeAll={() => setActiveTab("forum_topics")}
              >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {data.forum_topics.slice(0, 4).map((t) => (
                    <SearchForumTopicCard key={t.id} topic={t} />
                  ))}
                </div>
              </SearchResultSection>
            )}

            {/* Logistics Providers */}
            {isNotEmpty(data.logistics_providers) && (
              <SearchResultSection
                title="Logistics Providers"
                icon={Truck}
                count={data.logistics_providers.length}
                onSeeAll={() => setActiveTab("logistics_providers")}
              >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {data.logistics_providers.slice(0, 4).map((p) => (
                    <SearchLogisticsProviderCard key={p.id} provider={p} />
                  ))}
                </div>
              </SearchResultSection>
            )}
          </div>
        )}

        {/* ─── Individual Tab Views ─── */}
        {activeTab === "posts" && (
          <DiscoverPosts isSearch searchArray={data.posts} searchLoading={data.isLoading} />
        )}

        {activeTab === "companies" && (
          <CompaniesArray
            hasFilter={false}
            isSearch
            array={data.companies}
            searchLoading={data.isLoading}
          />
        )}

        {activeTab === "users" && (
          <PeopleGrid users={data.users} navigate={navigate} />
        )}

        {activeTab === "marketplace" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {!isNotEmpty(data.marketplace) ? (
              <EmptyTab message="No marketplace listings found" />
            ) : (
              data.marketplace.map((l) => (
                <SearchMarketplaceCard key={l.id} listing={l} />
              ))
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {!isNotEmpty(data.jobs) ? (
              <EmptyTab message="No jobs found" />
            ) : (
              data.jobs.map((j) => <SearchJobCard key={j.id} job={j} />)
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {!isNotEmpty(data.events) ? (
              <EmptyTab message="No events found" />
            ) : (
              data.events.map((e) => <SearchEventCard key={e.id} event={e} />)
            )}
          </div>
        )}

        {activeTab === "articles" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {!isNotEmpty(data.articles) ? (
              <EmptyTab message="No articles found" />
            ) : (
              data.articles.map((a) => (
                <SearchArticleCard key={a.id} article={a} />
              ))
            )}
          </div>
        )}

        {activeTab === "deal_rooms" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {!isNotEmpty(data.deal_rooms) ? (
              <EmptyTab message="No deal rooms found" />
            ) : (
              data.deal_rooms.map((d) => (
                <SearchDealRoomCard key={d.id} deal={d} />
              ))
            )}
          </div>
        )}

        {activeTab === "forum_topics" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {!isNotEmpty(data.forum_topics) ? (
              <EmptyTab message="No forum topics found" />
            ) : (
              data.forum_topics.map((t) => (
                <SearchForumTopicCard key={t.id} topic={t} />
              ))
            )}
          </div>
        )}

        {activeTab === "logistics_providers" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {!isNotEmpty(data.logistics_providers) ? (
              <EmptyTab message="No logistics providers found" />
            ) : (
              data.logistics_providers.map((p) => (
                <SearchLogisticsProviderCard key={p.id} provider={p} />
              ))
            )}
          </div>
        )}

        {/* ─── No Query State ─── */}
        {!searchQuery && (
          <section className="flex items-center justify-center flex-col gap-4 px-4 py-16">
            <DotLottieReact
              src="/lottie/notification.lottie"
              loop
              autoplay
              className="size-40 shrink-0 pointer-events-none"
            />
            <LightParagraph center>
              Search for anything on the platform — posts, companies,
              marketplace listings, jobs, events, and more.
            </LightParagraph>
            <button
              onClick={() =>
                updateSearchParams({
                  search_query: randKeyWord?.toLowerCase(),
                })
              }
              className="text-sm text-gold hover:text-amber-600 font-medium"
            >
              Try searching for <b className="capitalize">{randKeyWord}</b>
            </button>
          </section>
        )}
      </div>
    </>
  );
};

/* ─── Sub-components ─── */

const PeopleGrid = ({ users, navigate }) => {
  // Keep any user we can identify by name, username, or email — not only
  // users that have BOTH a first and last name.
  const filtered =
    users?.filter(
      (u) =>
        u?.first_name ||
        u?.last_name ||
        u?.full_name ||
        u?.display_name ||
        u?.username ||
        u?.email
    ) || [];
  if (filtered.length === 0) return <EmptyTab message="No people found" />;

  return (
    <section className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((user) => {
        const displayName = getUserDisplayName(user);
        const handle = getUserHandle(user);

        return (
          <motion.div
            key={user?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center flex-col gap-4 rounded-xl bg-white border px-4 py-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/co/${user?.id}`)}
          >
            <Avatar
              src={user?.avatar}
              name={displayName}
              className={avatarStyle}
              size="sm"
              width={50}
              height={50}
            />
            <div className="flex flex-col items-center text-center">
              <Username user={user} />
              {handle && (
                <small className="text-gray-400 line-clamp-1">@{handle}</small>
              )}
            </div>
            <ConnectButton first_name={displayName} id={user?.id} />
          </motion.div>
        );
      })}
    </section>
  );
};

const EmptyTab = ({ message }) => (
  <div className="col-span-full py-12 text-center">
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);
