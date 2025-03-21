import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { NavProvider } from "./navContext";
import { QueryProvider } from "./queryContext";
import { UserProvider } from "./userContext";

// Create a new QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchInterval: 600000 },
  },
});

const MyProvider = ({ children }) => {
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, [pageLoaded]);

  if (!pageLoaded) {
    return (
      <></>
      // <main className="h-screen flex bg-background items-center justify-center">
      //   <section className="flex flex-col justify-center items-center">
      //     <img src="/images/logo.png" alt="" className="size-10" />
      //     <h2 className="font-bold text-lg ">Connectize</h2>
      //   </section>
      // </main>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <NavProvider>
            <ChakraProvider>
              <QueryProvider>{children}</QueryProvider>
            </ChakraProvider>
          </NavProvider>
        </UserProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default MyProvider;
