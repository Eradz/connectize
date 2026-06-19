import axios from "axios";
import { toast } from "sonner";

export const getCities = async ({ countryCode='ng', stateCode='ak' }) => {
  const apiKey = import.meta.env.VITE_COUNTRY_STATE_CITY_API_KEY;

  if (!apiKey) {
    return [];
  }

  const config = {
    method: "get",
    url: `https://api.countrystatecity.in/v1/countries/${countryCode.toUpperCase()}/states/${stateCode.toUpperCase()}/cities`,
    headers: {
      "X-CSCAPI-KEY": apiKey,
    },
  };

  try {
    const response = await axios(config);
    return Array.isArray(response.data) ? response.data.map((city) => city.name).filter(Boolean) : [];
  } catch (error) {
      toast.error("Error getting cities");
      return [];
  }
};
