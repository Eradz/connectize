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
  build: { outDir: "build" },
}));
