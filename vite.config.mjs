import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      threshold: 10240,
      deleteOriginalAssets: mode === "capacitor",
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
}));
