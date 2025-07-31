import { useState } from "react";
import { ImageIcon } from "../../icon";
import axios from "axios";
import { toast } from "sonner";
import { Download } from "@mui/icons-material";

export function LoadImageAttachment({ blur, url, width, height }) {
  const [progress, setProgress] = useState(0);

  const [isDownloading, setIsDownloading] = useState(false);

  const [dataUrl, setDataUrl] = useState();
  async function startDownload() {
    try {
      if (isDownloading) return;
      setIsDownloading(true);
      const res = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress(progressEvent) {
          setProgress(Math.round(progressEvent.progress * 100));
        },
        withCredentials: false,
      });

      const reader = new FileReader();
      reader.readAsDataURL(res.data);
      reader.onload = () => {
        const base64data = reader.result;
        setDataUrl(base64data);
      };
    } catch (error) {
      console.log("Image request error:", error);
      toast.error("An error occured while downloading the image");
    } finally {
      setIsDownloading(false);
    }
  }
  return (
    <div className="">
      {dataUrl ? (
        <img src={dataUrl} className="" />
      ) : (
        <div className="relative cursor-pointer" onClick={startDownload}>
          <div className="">
            {blur ? (
              <img
                src={blur}
                className="w-[300px] object-cover"
                style={{
                  aspectRatio: width && height ? `${width}/${height}` : "",
                }}
              />
            ) : (
              <ImageIcon className={""} />
            )}
          </div>

          <div className="absolute bottom-2 right-1 text-white flex items-center">
            {isDownloading && <div className="mr-1">{progress}%</div>}
            <Download />
          </div>
        </div>
      )}
    </div>
  );
}
