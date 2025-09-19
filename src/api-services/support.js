import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

export const sendSupportMessage = async ({email,full_name,message,subject,image}) => {
    const result = await makeApiRequest({
      url: `api/support/`,
      method: "POST",
      data: {email,full_name,message,subject,image}
    });
  
    if(result?.id){
        toast.success(
            `Support Message has been sent`
          );
    }
    return result;
  };