import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://connectize.co";
const API_ORIGIN = (process.env.VITE_API_BASE_URL || "https://about.connectize.co").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/seo/default-image.png`;
const TEMPLATE_CANDIDATES = [
  path.join(__dirname, "..", "build", "client", "index.html"),
  path.join(__dirname, "..", "index.html"),
];

async function readTemplateHtml() {
  for (const candidate of TEMPLATE_CANDIDATES) {
    try {
      return await fs.readFile(candidate, "utf8");
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("Unable to locate a usable index.html template");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value = "", maxLength = 180) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function absoluteAssetUrl(value) {
  if (!value) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) {
    const host = value.startsWith("/api/") || value.startsWith("/media/") ? API_ORIGIN : SITE_URL;
    return `${host}${value}`;
  }
  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function pickFirstImage(images) {
  if (!Array.isArray(images) || images.length === 0) return null;

  const preferred = images.find((item) => item?.is_primary) || images[0];

  if (typeof preferred === "string") return preferred;
  if (typeof preferred?.image === "string") return preferred.image;
  if (typeof preferred?.url === "string") return preferred.url;

  return null;
}

function getPathSegments(requestPath) {
  return requestPath.split("/").filter(Boolean);
}

function isSingleSegmentDetail(requestPath, baseSegments, reservedSegments = []) {
  const segments = getPathSegments(requestPath);

  if (segments.length !== baseSegments.length + 1) return false;

  const matchesBase = baseSegments.every((segment, index) => segments[index] === segment);
  if (!matchesBase) return false;

  const detailSegment = segments[segments.length - 1];
  return !reservedSegments.includes(detailSegment);
}

function isMultiSegmentDetail(requestPath, baseSegments, reservedSegments = []) {
  const segments = getPathSegments(requestPath);

  if (segments.length < baseSegments.length + 1) return false;

  const matchesBase = baseSegments.every((segment, index) => segments[index] === segment);
  if (!matchesBase) return false;

  return !reservedSegments.includes(segments[baseSegments.length]);
}

function extractPostMeta(post, pageUrl) {
  const companyName = post?.company?.company_name || post?.company_name || "Connectize";
  const body = truncate(stripHtml(post?.body || "Read this industry post on Connectize."), 200);
  const image = absoluteAssetUrl(pickFirstImage(post?.images));

  return {
    title: `${companyName} Post | Connectize`,
    description: body || "Read this industry post on Connectize.",
    image,
    url: pageUrl,
    type: "article",
  };
}

function extractProductMeta(product, pageUrl) {
  const title = product?.title ? `${product.title} | Connectize Marketplace` : "Product | Connectize Marketplace";
  const description = truncate(stripHtml(product?.description || product?.sub_title || "Explore this product on Connectize Marketplace."), 200);
  const image = absoluteAssetUrl(product?.images?.[0]?.image || product?.company?.logo || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "product",
  };
}

function extractServiceMeta(service, pageUrl) {
  const title = service?.title ? `${service.title} | Connectize Services` : "Service | Connectize";
  const description = truncate(stripHtml(service?.description || service?.sub_title || "View this service on Connectize."), 200);
  const image = absoluteAssetUrl(service?.company?.logo || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "website",
  };
}

function extractCompanyMeta(company, pageUrl) {
  const title = company?.company_name ? `${company.company_name} | Connectize` : "Company | Connectize";
  const description = truncate(stripHtml(company?.about || company?.tag_line || "View this company profile on Connectize."), 200);
  const image = absoluteAssetUrl(company?.banner || company?.logo || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "profile",
  };
}

function extractUserMeta(user, pageUrl) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Professional Profile";
  const title = `${fullName} | Connectize`;
  const description = truncate(stripHtml(user?.bio || user?.role || "Connect and collaborate with this professional on Connectize."), 200);
  const image = absoluteAssetUrl(user?.avatar || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "profile",
  };
}

function extractKnowledgeArticleMeta(article, pageUrl) {
  const title = article?.title ? `${article.title} | Knowledge Hub | Connectize` : "Article | Knowledge Hub | Connectize";
  const description = truncate(stripHtml(article?.excerpt || article?.content || "Read this article on Connectize Knowledge Hub."), 200);
  const image = absoluteAssetUrl(article?.featured_image || article?.author?.avatar || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "article",
  };
}

function extractKnowledgeForumMeta(forum, pageUrl) {
  const title = forum?.name ? `${forum.name} | Knowledge Forum | Connectize` : "Forum | Knowledge Hub | Connectize";
  const visibilityText = forum?.is_public === false ? "Private forum on Connectize Knowledge Hub." : "Join the discussion on Connectize Knowledge Hub.";
  const description = truncate(stripHtml(forum?.description || visibilityText), 200);

  return {
    title,
    description,
    image: DEFAULT_IMAGE,
    url: pageUrl,
    type: "website",
  };
}

function extractKnowledgeTopicMeta(topic, pageUrl) {
  const forumName = topic?.forum_name ? `${topic.forum_name} | ` : "";
  const title = topic?.title ? `${topic.title} | ${forumName}Connectize` : "Topic | Knowledge Hub | Connectize";
  const description = truncate(stripHtml(topic?.content || "Read this discussion topic on Connectize Knowledge Hub."), 200);
  const image = absoluteAssetUrl(topic?.author?.avatar || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "article",
  };
}

function extractKnowledgeCategoryMeta(category, pageUrl) {
  const title = category?.name ? `${category.name} | Knowledge Category | Connectize` : "Category | Knowledge Hub | Connectize";
  const latestArticleTitle = category?.latest_article?.title ? ` Latest article: ${category.latest_article.title}.` : "";
  const description = truncate(stripHtml(category?.description || `Explore articles, forums, and topics in ${category?.name || "this category"} on Connectize.${latestArticleTitle}`), 200);

  return {
    title,
    description,
    image: DEFAULT_IMAGE,
    url: pageUrl,
    type: "website",
  };
}

function extractKnowledgeTagMeta(tag, pageUrl) {
  const tagName = tag?.name || "Knowledge";

  return {
    title: `#${tagName} | Knowledge Tag | Connectize`,
    description: truncate(stripHtml(tag?.description || `Explore articles and discussions tagged ${tagName} on Connectize Knowledge Hub.`), 200),
    image: DEFAULT_IMAGE,
    url: pageUrl,
    type: "website",
  };
}

function extractWorkforceJobMeta(job, pageUrl) {
  const companyName = job?.company_name ? ` at ${job.company_name}` : "";
  const title = job?.title ? `${job.title}${companyName} | Connectize Jobs` : "Job | Connectize Jobs";
  const description = truncate(stripHtml(job?.description || job?.description_preview || `View this opportunity${companyName} on Connectize.`), 200);
  const image = absoluteAssetUrl(job?.company_logo || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "website",
  };
}

function extractWorkforceProfileMeta(profile, pageUrl) {
  const name = profile?.user_name || profile?.full_name || profile?.professional_title || "Professional Profile";
  const title = `${name} | Connectize Professionals`;
  const description = truncate(
    stripHtml(profile?.summary || `${profile?.professional_title || "Professional"}${profile?.current_location ? ` based in ${profile.current_location}` : ""}. Connect on Connectize.`),
    200
  );
  const image = absoluteAssetUrl(profile?.user_avatar || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "profile",
  };
}

function extractWorkforceEventMeta(event, pageUrl) {
  const title = event?.title ? `${event.title} | Connectize Events` : "Event | Connectize";
  const eventSummary = [event?.description, event?.location || event?.venue_name, event?.start_date].filter(Boolean).join(" ");
  const description = truncate(stripHtml(eventSummary || "View this event on Connectize."), 200);
  const image = absoluteAssetUrl(event?.image || event?.organizer_company_logo || event?.organizer_avatar || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "event",
  };
}

function extractMarketplaceListingMeta(listing, pageUrl) {
  const title = listing?.title ? `${listing.title} | Connectize Marketplace` : "Listing | Connectize Marketplace";
  const description = truncate(stripHtml(listing?.description || listing?.subtitle || `Explore this marketplace listing on Connectize.`), 200);
  const image = absoluteAssetUrl(pickFirstImage(listing?.images) || listing?.seller_company_logo || DEFAULT_IMAGE);

  return {
    title,
    description,
    image,
    url: pageUrl,
    type: "product",
  };
}

async function apiGet(endpoint) {
  const response = await fetch(`${API_ORIGIN}${endpoint}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "connectize-meta-renderer",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${endpoint}`);
  }

  return response.json();
}

async function buildMetaForPath(requestPath) {
  const pageUrl = `${SITE_URL}${requestPath}`;
  const pathSegments = getPathSegments(requestPath);

  if (/^\/posts\/[^/]+\/?$/i.test(requestPath)) {
    const id = requestPath.split("/").filter(Boolean)[1];
    const post = await apiGet(`/api/posts/${id}/`);
    return extractPostMeta(post, pageUrl);
  }

  if (/^\/products\/[^/]+\/?$/i.test(requestPath)) {
    const id = requestPath.split("/").filter(Boolean)[1];
    const product = await apiGet(`/api/products/${id}/`);
    return extractProductMeta(product, pageUrl);
  }

  if (/^\/services\/[^/]+\/?$/i.test(requestPath)) {
    const id = requestPath.split("/").filter(Boolean)[1];
    const service = await apiGet(`/api/services/${id}/`);
    return extractServiceMeta(service, pageUrl);
  }

  if (/^\/company\/[^/]+\/?$/i.test(requestPath)) {
    const slug = decodeURIComponent(requestPath.split("/").filter(Boolean)[1]);
    const company = await apiGet(`/api/companies/${slug}/`);
    return extractCompanyMeta(company, pageUrl);
  }

  if (/^\/co\/\d+\/?$/i.test(requestPath)) {
    const id = requestPath.split("/").filter(Boolean)[1];
    const user = await apiGet(`/api/users/${id}`);
    return extractUserMeta(user, pageUrl);
  }

  if (/^\/co\/[^/]+\/?$/i.test(requestPath)) {
    const slug = decodeURIComponent(requestPath.split("/").filter(Boolean)[1]);
    const company = await apiGet(`/api/companies/${slug}/`);
    return extractCompanyMeta(company, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["knowledge", "articles"], ["create"])) {
    const slug = decodeURIComponent(pathSegments[2]);
    const article = await apiGet(`/api/v1/knowledge/articles/${slug}/`);
    return extractKnowledgeArticleMeta(article, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["knowledge", "forums"], ["create", "invite"])) {
    const slug = decodeURIComponent(pathSegments[2]);
    const forum = await apiGet(`/api/v1/knowledge/forums/${slug}/`);
    return extractKnowledgeForumMeta(forum, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["knowledge", "topics"])) {
    const slug = decodeURIComponent(pathSegments[2]);
    const topic = await apiGet(`/api/v1/knowledge/topics/${slug}/`);
    return extractKnowledgeTopicMeta(topic, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["knowledge", "categories"])) {
    const slug = decodeURIComponent(pathSegments[2]);
    const category = await apiGet(`/api/v1/knowledge/categories/${slug}/`);
    return extractKnowledgeCategoryMeta(category, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["knowledge", "tags"])) {
    const slug = decodeURIComponent(pathSegments[2]);
    const tag = await apiGet(`/api/v1/knowledge/tags/${slug}/`);
    return extractKnowledgeTagMeta(tag, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["jobs"], ["create", "saved", "my-posted"])) {
    const id = decodeURIComponent(pathSegments[1]);
    const job = await apiGet(`/api/v1/workforce/jobs/${id}/`);
    return extractWorkforceJobMeta(job, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["professionals"], ["create"])) {
    const id = decodeURIComponent(pathSegments[1]);
    const profile = await apiGet(`/api/v1/workforce/profiles/${id}/`);
    return extractWorkforceProfileMeta(profile, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["events"], ["create", "my-events", "my-registrations", "my-bookmarks", "earnings"])) {
    const id = decodeURIComponent(pathSegments[1]);
    const event = await apiGet(`/api/v1/workforce/events/${id}/`);
    return extractWorkforceEventMeta(event, pageUrl);
  }

  if (isSingleSegmentDetail(requestPath, ["marketplace", "listing"])) {
    const id = decodeURIComponent(pathSegments[2]);
    const listing = await apiGet(`/api/marketplace/listings/${id}/`);
    return extractMarketplaceListingMeta(listing, pageUrl);
  }

  return {
    title: "Connectize - The Social Hub for Oil & Gas",
    description:
      "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
    image: DEFAULT_IMAGE,
    url: pageUrl,
    type: "website",
  };
}

function replaceMeta(html, meta) {
  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);
  const safeImage = escapeHtml(meta.image);
  const safeUrl = escapeHtml(meta.url);
  const safeType = escapeHtml(meta.type || "website");

  const tags = [
    { key: "description", markup: `<meta name="description" content="${safeDescription}" />` },
    { key: "canonical", markup: `<link rel="canonical" href="${safeUrl}" />` },
    { key: "og:type", markup: `<meta property="og:type" content="${safeType}" />` },
    { key: "og:title", markup: `<meta property="og:title" content="${safeTitle}" />` },
    { key: "og:description", markup: `<meta property="og:description" content="${safeDescription}" />` },
    { key: "og:image", markup: `<meta property="og:image" content="${safeImage}" />` },
    { key: "og:image:alt", markup: `<meta property="og:image:alt" content="${safeTitle}" />` },
    { key: "og:url", markup: `<meta property="og:url" content="${safeUrl}" />` },
    { key: "twitter:card", markup: `<meta name="twitter:card" content="summary_large_image" />` },
    { key: "twitter:title", markup: `<meta name="twitter:title" content="${safeTitle}" />` },
    { key: "twitter:description", markup: `<meta name="twitter:description" content="${safeDescription}" />` },
    { key: "twitter:image", markup: `<meta name="twitter:image" content="${safeImage}" />` },
    { key: "twitter:image:alt", markup: `<meta name="twitter:image:alt" content="${safeTitle}" />` },
  ];

  let updatedHtml = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  for (const tag of tags) {
    const attrPattern = tag.key === "canonical"
      ? /<link\s+rel=["']canonical["'][^>]*>/i
      : new RegExp(`<meta\\s+(?:name|property)=["']${tag.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");

    if (attrPattern.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(attrPattern, tag.markup);
      continue;
    }

    updatedHtml = updatedHtml.replace(/<\/head>/i, `  ${tag.markup}\n  </head>`);
  }

  return updatedHtml;
}

export default async function handler(req, res) {
  const requestPath = typeof req.query.path === "string" ? req.query.path : "/";

  try {
    const [template, meta] = await Promise.all([
      readTemplateHtml(),
      buildMetaForPath(requestPath),
    ]);

    const html = replaceMeta(template, meta);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).send(html);
  } catch (error) {
    console.error("[render-meta] falling back to default HTML", error);
    const template = await readTemplateHtml();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(template);
  }
}