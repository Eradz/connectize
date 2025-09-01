import { Links, Meta, Outlet, Scripts, useNavigation } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import MyProvider from "../context/provider";
import { Toaster } from "sonner";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../index.css";
import { frontendUrl } from "../lib/helpers";
import { createSEO } from "../components/SEO";
import { useEffect, useRef } from "react";

export const meta = createSEO({
  title: "Welcome to connectize",
  description:
    "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
});

export function Layout({ children }) {
  // const location = useLocation();
  // const currentUrl = `${frontendUrl()}${location.pathname}`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F7F7F7 " />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={"true"}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />

        <meta
          name="description"
          content="Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!"
        />
        <meta
          name="keywords"
          content="social media, connect, chat, share, friends, networking, oil and gas networking, energy professionals, oil and gas social platform, energy industry collaboration, oil and gas jobs, upstream, midstream, downstream, energy sector networking, oil and gas suppliers, industry insights, oil and gas investments"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.webp" />

        <link rel="manifest" href="/manifest.json" />

        {/* <link rel="canonical" href={currentUrl} /> */}

        {/* <title>Welcome to connectize</title> */}

        <Meta />
        <Links />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <MyProvider>{children}</MyProvider>
        <Toaster
          position="top-center"
          closeButton
          duration={5000}
          pauseWhenPageIsHidden
        />
        <Analytics />
        {/* <ScrollRestoration /> */}

        {/* <script></script> */}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalSpinner() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const ref = useRef(null);
  const currentWidthRef = useRef(0);
  const intervalId = useRef(undefined);

  function updateProgress(progress) {
    if (!ref.current?.style) return;
    currentWidthRef.current = progress;
    ref.current.style.width = currentWidthRef.current + "%";
  }

  function reset() {
    clearInterval(intervalId.current);
    intervalId.current = undefined;
    updateProgress(0);
  }
  useEffect(() => {
    console.log(isNavigating ? "Loading..." : "Navigation Ended");

    if (!ref.current) return;

    if (!isNavigating && intervalId.current) {
      console.log("Closed Loader");

      reset();
    } else {
      // console.log("About Interval called");
      updateProgress(
        currentWidthRef.current ? currentWidthRef.current + 25 : 75
      );

      const newId = setInterval(() => {
        if (!ref.current?.style) return;
        currentWidthRef.current = currentWidthRef.current
          ? currentWidthRef.current + 25
          : 75;

        if (currentWidthRef.current >= 100) {
          currentWidthRef.current = 95;
          updateProgress(currentWidthRef.current);
          // clearInterval(intervalId.current);
          reset();
          console.log("Cleared Loader Interval");
        } else {
          updateProgress(currentWidthRef.current);
        }
        // console.log("Interval called", currentWidthRef);
      }, 2000);

      intervalId.current = newId;
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [isNavigating]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
      <div
        ref={ref}
        // style={{ width: `${currentWidthRef.current}%` }}
        className={`h-full bg-gold rounded-full transition-all duration-500 ${isNavigating ? "" : " "}`}
      ></div>
    </div>
  );
}
export default function App() {
  return (
    <>
      {/* {isNavigating && <GlobalSpinner />} */}
      {<GlobalSpinner />}
      <Outlet />
    </>
  );
}
