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
    <BrowserRouter>
      <MyProvider>
        {/* <div className="text-2xl font-bold">Ill stay here for now</div> */}
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
