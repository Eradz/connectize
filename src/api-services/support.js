import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

export const sendSupportMessage = async ({email,full_name,message,subject,images, resetForm}) => {
    const result = await makeApiRequest({
      url: `api/support/`,
      method: "POST",
      data: images? {email,full_name,message,subject,images}: {email,full_name,message,subject},
      resetForm,
      contentType: images ? "multipart/form-data" : "application/json",
      type: "public",
    });
  
    if(result?.id){
        toast.success(
            `Support Message has been sent`
          );
    }
    return result;
  };
