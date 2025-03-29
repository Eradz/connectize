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
      includeAssets: [
        "/favicon.svg",
        "/logo192.png",
        "/logo512.png",
        "/connectizelogo.png",
        "/offline.html",
      ],
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
