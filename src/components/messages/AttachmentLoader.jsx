import { useState } from "react";
import { ImageIcon } from "../../icon";
import axios from "axios";

export function LoadImageAttachment({ blur, url, size }) {
  const [progress, setProgress] = useState(0);

  const [dataUrl, setDataUrl] = useState();
  async function startDownload() {
    try {
      const res = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress(progressEvent) {
          setProgress(Math.round(progressEvent.progress * 100));
        },
        withCredentials: !true,
      });

      const reader = new FileReader();
      reader.readAsDataURL(res.data);
      reader.onload = () => {
        const base64data = reader.result;
        setDataUrl(base64data);
      };
    } catch (error) {
      console.log("Image request error:", error);
    }
  }
  return (
    <div className="">
      {dataUrl ? (
        <img src={dataUrl} />
      ) : (
        <div className="relative">
          <div className="" onClick={startDownload}>
            <ImageIcon className={"w-full"} />
          </div>

          <div className="">{progress}%</div>
        </div>
      )}
    </div>
  );
}
