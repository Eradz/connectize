import { createWriteStream, mkdirSync } from "fs";
import { SitemapStream } from "sitemap";
import { pipeline } from "stream/promises";

const publicRoutes = [
  "/feed",
  "/companies",
  "/marketplace",
  "/products/listing",
  "/services",
  "/knowledge",
  "/knowledge/articles",
  "/knowledge/forums",
  "/knowledge/topics",
  "/knowledge/categories",
  "/workforce/jobs",
  "/professionals",
  "/workforce/events",
  "/deal-rooms",
  "/bidding",
  "/logistics",
  "/logistics/requests",
  "/support",
  "/privacy-policy",
  "/terms-and-conditions",
];

(async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: "https://connectize.co" });

  mkdirSync("./public", { recursive: true });
  const writeStream = createWriteStream("./public/sitemap.xml");

  publicRoutes.forEach((route) => {
    sitemap.write({
      url: route,
      changefreq: route === "/feed" ? "daily" : "weekly",
      priority: route === "/feed" ? 1 : 0.8,
    });
  });

  sitemap.end();

  await pipeline(sitemap, writeStream);
})()
  .then(() => {
    console.log("✅ Sitemap generated successfully!");
  })
  .catch((err) => {
    console.error("Error generating sitemap:", err);
  });
