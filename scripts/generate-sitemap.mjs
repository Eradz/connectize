import { createWriteStream } from "fs";
import { SitemapStream } from "sitemap";
import { pipeline } from "stream/promises";
import { getRoutesFromApp } from "./generate-app-routes.mjs";

(async function generateSitemap() {
  const routes = [...new Set(getRoutesFromApp())];
  const sitemap = new SitemapStream({ hostname: "https://connectize.co" });

  const writeStream = createWriteStream("./build/sitemap.xml");

  routes.forEach((route) => {
    sitemap.write({ url: route, changefreq: "weekly", priority: 0.8 });
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
