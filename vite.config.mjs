import { visualizer } from "rollup-plugin-visualizer";
// import react from "@vitejs/plugin-react";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

// Streamlined config: rely on default optimizeDeps. If stale cache errors reoccur, just
// remove node_modules/.vite or bump a dummy env var when starting dev (e.g. VITE_BUSTER).
// NOTE: Removed @vitejs/plugin-react to avoid RefreshRuntime conflict with @react-router/dev

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: 3000,
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    force: false,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router',
      '@vercel/analytics/react',
      'sonner',
    ],
  },
  build: { outDir: 'build/client' },
});
