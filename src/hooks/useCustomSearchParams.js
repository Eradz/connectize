import { useLocation, useSearchParams } from "react-router";

export const useCustomSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const updateSearchParams = (newParams) => {
    const updatedParams = new URLSearchParams(searchParams);

    // Update or delete parameters based on newParams
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        updatedParams.set(key, value); // Add or update parameter
      } else {
        updatedParams.delete(key); // Remove parameter if null or undefined
      }
    });

    setSearchParams(updatedParams); // Apply updated parameters
  };

  return { pathname, searchParams, updateSearchParams };
};
