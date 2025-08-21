import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// CSP headers plugin for development
const cspPlugin = () => {
  return {
    name: 'csp-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set CSP headers that match Django configuration
        const cspHeader = "default-src 'self'; " +
                         "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://va.vercel-scripts.com https://js.stripe.com; " +
                         "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; " +
                         "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com blob:; " +
                         "img-src 'self' data: https: http: blob:; " +
                         "connect-src 'self' https: wss: ws:; " +
                         "media-src 'self' data: https: http:; " +
                         "object-src 'none'; " +
                         "base-uri 'self'; " +
                         "frame-ancestors 'self';";
        
        res.setHeader('Content-Security-Policy', cspHeader);
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), cspPlugin()],
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
    },
    // Proxy API requests to Django backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Forward CSP headers from Django to the frontend
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward CSP headers from Django
            if (proxyRes.headers['content-security-policy']) {
              res.setHeader('content-security-policy', proxyRes.headers['content-security-policy']);
            }
            if (proxyRes.headers['content-security-policy-report-only']) {
              res.setHeader('content-security-policy-report-only', proxyRes.headers['content-security-policy-report-only']);
            }
          });
        }
      }
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
