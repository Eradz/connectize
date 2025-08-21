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
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MyProvider>
        <App />
      </MyProvider>
      <Toaster
        position="top-center"
        closeButton
        duration={5000}
        pauseWhenPageIsHidden
      />
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
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
