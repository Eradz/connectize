import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// CSP headers plugin for development
const cspPlugin = () => {
  return {
    name: 'csp-headers',
    configureServer(server) {
      // Serve .lottie files with correct MIME type
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.lottie')) {
          res.setHeader('Content-Type', 'application/zip');
        }
        next();
      });
      server.middlewares.use((req, res, next) => {
        // Set CSP headers that match Django configuration
        const cspHeader = [
          "default-src 'self'",
          // Stripe iframes & experiments
          "frame-src 'self' https://js.stripe.com https://*.stripe.com https://hooks.stripe.com https://accounts.google.com https://app.termly.io https://www.googletagmanager.com",
          "child-src 'self' https://js.stripe.com https://*.stripe.com",
          // Scripts (keep js.stripe.com first for clarity)
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://js.stripe.com https://*.stripe.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://va.vercel-scripts.com https://accounts.google.com https://apis.google.com https://www.googletagmanager.com https://app.termly.io",
          // Styles
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://app.termly.io",
          // Fonts
          "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com blob:",
          // Images
          "img-src 'self' data: https: http: blob:",
          // Connections (add all Stripe telemetry domains + localhost wildcard)
          "connect-src 'self' https: wss: ws: http://localhost:* http://127.0.0.1:* https://api.stripe.com https://r.stripe.com https://q.stripe.com https://m.stripe.network https://*.stripe.com",
          // Media
          "media-src 'self' data: https: http:",
          // Workers
          "worker-src 'self' blob:",
          // Security
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'self'"
        ].join('; ') + ';';
        
        // Allow disabling or switching to report-only via env vars
        if (process.env.VITE_CSP_REPORT_ONLY === '1') {
          res.setHeader('Content-Security-Policy-Report-Only', cspHeader);
        } else if (process.env.VITE_DISABLE_CSP !== '1') {
          res.setHeader('Content-Security-Policy', cspHeader);
        }
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
  strictPort: true, // Fail instead of auto-incrementing so we notice stale server using old code
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
        // Forward all headers including Authorization
        headers: {
          Connection: 'keep-alive'
        },
        // Forward CSP headers from Django to the frontend
        configure: (proxy, options) => {
          // Log proxy requests for debugging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Ensure Authorization header is forwarded
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
              console.log('[Vite Proxy] Forwarding Authorization header for:', req.url);
            } else {
              console.log('[Vite Proxy] No Authorization header for:', req.url);
            }
          });
          
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
    outDir: "build/client",
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@chakra-ui/react"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  envPrefix: ['VITE_', 'REACT_APP_'], // Support both Vite and React env prefixes
});
