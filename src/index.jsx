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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Root safe-area wrapper ensures entire app respects notches & home indicator */}
    <div className="safe-area-x safe-area-y min-h-screen flex flex-col no-horizontal-overflow" id="app-safe-wrapper">
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
    </div>
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
