import { visualizer } from "rollup-plugin-visualizer";
// import react from "@vitejs/plugin-react";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter(),

    // react(),
    // visualizer({
    //   open: true,
    // }),
  ],
  server: { port: 3000 },
  build: { outDir: "build/client" },
});
