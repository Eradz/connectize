import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 3000,
    host: true, // Allow external connections
    cors: true, // Enable CORS
    hmr: {
      port: 3001 // Use different port for HMR to avoid conflicts
    }
  },
  define: {
    // Ensure environment variables are available in the browser
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    outDir: "build",
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
          ],
          charts: [
            "recharts",
          ],
        },
      },
    },
  },
  envPrefix: ['VITE_', 'REACT_APP_'], // Support both Vite and React env prefixes
});
