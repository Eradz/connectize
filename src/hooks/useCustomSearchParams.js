import { useLocation, useSearchParams } from "react-router-dom";

export const useCustomSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const updateSearchParams = (newParams) => {
    const updatedParams = new URLSearchParams(searchParams);

    console.log("It got here");
    // Update or delete parameters based on newParams
    Object.entries(newParams).forEach(([key, value]) => {
      console.log("It got here 2");
      if (value !== null && value !== undefined) {
        updatedParams.set(key, value); // Add or update parameter
      } else {
        console.log("It got here 2");
        updatedParams.delete(key); // Remove parameter if null or undefined
      }
    });

    console.log("It got here 3");
    setSearchParams(updatedParams); // Apply updated parameters
  };

  return { pathname, searchParams, updateSearchParams };
};
