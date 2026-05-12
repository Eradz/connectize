import { Analytics } from "@vercel/analytics/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import MyProvider from "./context/provider";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./index.css";

console.log("Index.jsx is loading");

const STALE_ASSET_RELOAD_KEY = "connectize:stale-asset-reload";

const getCurrentBuildAsset = () => {
  const entryScript = Array.from(document.scripts).find((script) =>
    script.src.includes("/assets/index-")
  );
  return entryScript?.src || window.location.origin;
};

const reloadForStaleAsset = () => {
  const reloadMarker = `${window.location.pathname}:${getCurrentBuildAsset()}`;
  try {
    if (sessionStorage.getItem(STALE_ASSET_RELOAD_KEY) === reloadMarker) {
      return false;
    }

    sessionStorage.setItem(STALE_ASSET_RELOAD_KEY, reloadMarker);
  } catch (error) {
    console.warn("Unable to store stale asset reload marker", error);
  }
  window.location.reload();
  return true;
};

const isChunkLoadError = (reason) => {
  const message = String(reason?.message || reason || "");
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("not a valid JavaScript MIME type")
  );
};

window.addEventListener("vite:preloadError", (event) => {
  if (reloadForStaleAsset()) {
    event.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (!isChunkLoadError(event.reason)) return;
  if (reloadForStaleAsset()) {
    event.preventDefault();
  }
});

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error) && reloadForStaleAsset()) {
      return;
    }
    console.error(error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const title = this.state.isChunkError
      ? "Unable to load the latest app version"
      : "Unable to load this page";
    const message = this.state.isChunkError
      ? "The app received an outdated page asset. Refresh to load the latest version."
      : "Something went wrong while opening this page. Refresh to try again.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-6">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          <button
            type="button"
            className="mt-5 rounded-md bg-[#F7C948] px-5 py-2 text-sm font-semibold text-gray-950"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}

// Filter out Grammarly extension errors in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    // Filter out Grammarly and extension-related Stripe errors
    const message = args[0]?.toString() || '';
    if (
      message.includes('Grammarly.js') ||
      message.includes('mainCS.common.chunk.js') ||
      (message.includes('Blocked a frame') && message.includes('js.stripe.com') && message.includes('localhost:3000'))
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));

const appTree = (
  <BrowserRouter>
    <RootErrorBoundary>
      <MyProvider>
        <App />
      </MyProvider>
      <Toaster
        position="top-center"
        closeButton
        duration={5000}
        pauseWhenPageIsHidden
      />
    </RootErrorBoundary>
  </BrowserRouter>
);

root.render(
  import.meta.env.DEV ? (
    <>
      {appTree}
    </>
  ) : (
    <React.StrictMode>
      {appTree}
      <Analytics />
    </React.StrictMode>
  )
);

// registerSW({ immediate: true });

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/service-worker.js").catch((error) => {
//       if (process.env.NODE_ENV === "development")
//         console.error("Service Worker registration failed:", error);
//     });
//   });
// }
