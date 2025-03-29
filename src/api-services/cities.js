import axios from "axios";
import { toast } from "sonner";

export const getCities = async ({ countryCode='ng', stateCode='ak' }) => {
  var config = {
    method: "get",
    url: `https://api.countrystatecity.in/v1/countries/${countryCode.toUpperCase()}/states/${stateCode.toUpperCase()}/cities`,
    headers: {
      "X-CSCAPI-KEY": "API_KEY",
    },
  };

  try {
    const response = await axios(config);
    return response.data[0].name;
  } catch (error) {
      toast.error("Error getting cities");
      return null
  }
};
