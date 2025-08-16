import { Outlet, Scripts } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import MyProvider from "../context/provider";
import { Toaster } from "sonner";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../index.css";
export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
      </head>
      <body>
        <MyProvider>
          {/* <App /> */}
          <Outlet />
        </MyProvider>
        <Toaster
          position="top-center"
          closeButton
          duration={5000}
          pauseWhenPageIsHidden
        />
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
