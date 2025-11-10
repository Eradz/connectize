import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
// import {HelmetProvider} from 'react-helmet-async';
import { queryClient } from "../lib/utils";
import { NavProvider } from "./navContext";
import { QueryProvider } from "./queryContext";
import { UserProvider } from "./userContext";
import { FeatureFlagProvider } from "./featureFlagContext";

const MyProvider = ({ children }) => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <FeatureFlagProvider>
            <NavProvider>
              <ChakraProvider>
                <QueryProvider>{children}</QueryProvider>
              </ChakraProvider>
            </NavProvider>
          </FeatureFlagProvider>
        </UserProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default MyProvider;
