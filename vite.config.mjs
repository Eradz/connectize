import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { 
    port: 3000,
    host: true, // Allow external connections
    cors: true, // Enable CORS
    // Enable HTTPS for Stripe compatibility in development
    https: process.env.VITE_STRIPE_DEV_MODE ? false : undefined,
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
