const SITE_URL = "https://connectize.co";
const API_ORIGIN = (process.env.VITE_API_BASE_URL || "https://about.connectize.co").replace(/\/$/, "");

const collections = [
  { endpoint: "/api/posts/?page_size=100", path: (item) => `/posts/${item.id}`, public: isPublic },
  { endpoint: "/api/companies/?page_size=100", path: (item) => `/company/${encodeURIComponent(item.slug || item.company_name)}`, public: isPublic },
  { endpoint: "/api/v1/workforce/profiles/?page_size=100", path: (item) => `/professionals/${item.id}`, public: isPublicProfile },
  { endpoint: "/api/v1/workforce/jobs/?page_size=100", path: (item) => `/workforce/jobs/${item.id}`, public: isPublished },
  { endpoint: "/api/v1/workforce/events/?page_size=100", path: (item) => `/workforce/events/${item.id}`, public: isPublished },
  { endpoint: "/api/v1/knowledge/articles/?page_size=100", path: (item) => `/knowledge/articles/${encodeURIComponent(item.slug || item.id)}`, public: isPublished },
  { endpoint: "/api/v1/knowledge/forums/?page_size=100", path: (item) => `/knowledge/forums/${encodeURIComponent(item.slug || item.id)}`, public: isPublic },
  { endpoint: "/api/v1/knowledge/topics/?page_size=100", path: (item) => `/knowledge/topics/${encodeURIComponent(item.slug || item.id)}`, public: isPublic },
  { endpoint: "/api/marketplace/listings/?page_size=100", path: (item) => `/marketplace/listing/${item.id}`, public: isPublished },
  { endpoint: "/api/v1/bidding/projects/?page_size=100", path: (item) => `/bidding/projects/${item.id}`, public: isExplicitlyPublic },
  { endpoint: "/api/v1/deals/deal-rooms/?page_size=100", path: (item) => `/deal-rooms/${item.id}`, public: isExplicitlyPublic },
  { endpoint: "/api/v1/logistics/providers/?page_size=100", path: (item) => `/logistics/providers/${item.id}`, public: isPublished },
];

const staticPaths = [
  "/feed", "/companies", "/marketplace", "/products/listing", "/services",
  "/knowledge", "/knowledge/articles", "/knowledge/forums", "/knowledge/topics",
  "/knowledge/categories", "/workforce/jobs", "/professionals", "/workforce/events",
  "/deal-rooms", "/bidding", "/logistics", "/logistics/providers", "/support",
  "/privacy-policy", "/terms-and-conditions",
];

function isFalse(value) {
  return value === false || value === "false";
}

function isPublic(item) {
  return !isFalse(item?.is_public) && !isFalse(item?.public) && !item?.is_private && !item?.deleted_at;
}

function isPublicProfile(item) {
  return isPublic(item) && !isFalse(item?.searchable) && !isFalse(item?.allow_search_indexing) && item?.status !== "suspended";
}

function isPublished(item) {
  return isPublic(item) && !["draft", "private", "archived", "rejected"].includes(String(item?.status || "").toLowerCase());
}

function isExplicitlyPublic(item) {
  return isPublished(item) && (item?.is_public === true || item?.visibility === "public" || item?.access_type === "public");
}

function rows(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.results || payload?.data || payload?.items || [];
}

function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function fetchCollection(config) {
  try {
    const response = await fetch(`${API_ORIGIN}${config.endpoint}`, { headers: { Accept: "application/json", "User-Agent": "connectize-sitemap" } });
    if (!response.ok) return [];
    return rows(await response.json())
      .filter(config.public)
      .map((item) => ({ path: config.path(item), modified: item.updated_at || item.modified_at || item.created_at }))
      .filter((entry) => !entry.path.includes("undefined"));
  } catch (error) {
    console.error(`[sitemap] ${config.endpoint}`, error);
    return [];
  }
}

export default async function handler(_req, res) {
  const dynamicGroups = await Promise.all(collections.map(fetchCollection));
  const entries = [...staticPaths.map((path) => ({ path })), ...dynamicGroups.flat()];
  const unique = [...new Map(entries.map((entry) => [entry.path, entry])).values()];
  const urls = unique.map(({ path, modified }) => {
    const lastmod = modified ? `<lastmod>${escapeXml(new Date(modified).toISOString())}</lastmod>` : "";
    return `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}</url>`;
  }).join("");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}
