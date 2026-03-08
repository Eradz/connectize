import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://connectize.co";
const API_ORIGIN = (process.env.VITE_API_BASE_URL || "https://about.connectize.co").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/seo/default-image.png`;
const TEMPLATE_PATH = path.join(__dirname, "..", "index.html");

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

function extractPostMeta(post, pageUrl) {
  const companyName = post?.company?.company_name || post?.company_name || "Connectize";
  const body = truncate(stripHtml(post?.body || "Read this industry post on Connectize."), 200);
  const image = absoluteAssetUrl(post?.images?.[0]?.image || post?.images?.[0]);

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

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${safeDescription}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${safeUrl}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/i, `<meta property="og:type" content="${safeType}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${safeDescription}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/i, `<meta property="og:image" content="${safeImage}" />`)
    .replace(/<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/i, `<meta property="og:image:alt" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${safeUrl}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${safeDescription}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:image" content="${safeImage}" />`)
    .replace(/<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:image:alt" content="${safeTitle}" />`);
}

export default async function handler(req, res) {
  const requestPath = typeof req.query.path === "string" ? req.query.path : "/";

  try {
    const [template, meta] = await Promise.all([
      fs.readFile(TEMPLATE_PATH, "utf8"),
      buildMetaForPath(requestPath),
    ]);

    const html = replaceMeta(template, meta);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).send(html);
  } catch (error) {
    console.error("[render-meta] falling back to default HTML", error);
    const template = await fs.readFile(TEMPLATE_PATH, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(template);
  }
}