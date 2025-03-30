import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    compression(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/connectizelogo.png", "/offline.html"],
      manifest: {
        name: "Connectize",
        short_name: "Connectize",
        description: "Stay connected with Connectize!",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.connectize\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 1 day
            },
          },
          {
            urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|woff2|ttf|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
            },
          },
          {
            urlPattern: /\/offline\.html$/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "offline-cache" },
          },
        ],
      },
    }),
  ],
  server: { port: 3000 },
  build: {
    outDir: "build",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("lodash")) return "lodash";
            return "vendor";
          }
        },
      },
    },
  },
});
