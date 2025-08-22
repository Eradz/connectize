import {
  FacebookIcon,
  FacebookShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  LinkedinShareButton,
  LinkedinIcon,
  XIcon,
  TwitterShareButton,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
} from "react-share";
import {
  attemptNavigatorShare,
  copyTextToClipboard,
  openInNewTab,
} from "../lib/utils";
import { useState } from "react";
import ReusableModal from "./custom/ResusableModal";
import { CopyIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
/**
 *
 * @param shareData *(optional)* this is either undefined or an object with title, text. It gets passed to the navigator.share method if the method is available. If this parameter is undefined window.open is used instead and it gets passed url
 * @param url *(required)* this is the url to share. It gets added to navigator.share as the url in share data, or gets passed to window.open if either the navigator.share is not available or the ```shareData``` param is not passed
 */
export default function CustomShareButton({
  children,
  shareData,
  url,
  modalTitle = "Share to",
}) {
  const [isSharing, setIsSharing] = useState(false);

  async function share() {
    if (shareData) {
      const naigatorShareSuccessful = await attemptNavigatorShare({
        text: shareData.text,
        title: shareData.title,
        url,
      });

      if (naigatorShareSuccessful) return;
    }

    setIsSharing(true);
  }

  return (
    <>
      <SocialShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        url={url}
        title={modalTitle}
      />
      <div onClick={share}>{children}</div>
    </>
  );
}
function SocialShareModal({ isOpen, onClose, title, url }) {
  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footerContent={<></>}
    >
      <div className="flex items-center space-x-3 mb-3">
        <FacebookShareButton
          openShareDialogOnClick={false}
          onClick={(_, link) => {
            openInNewTab(link);
          }}
          url={url}
        >
          <FacebookIcon round size={40} />
        </FacebookShareButton>
        <WhatsappShareButton
          onClick={(_, link) => {
            openInNewTab(link);
          }}
          openShareDialogOnClick={false}
          url={url}
        >
          <WhatsappIcon round size={40} />
        </WhatsappShareButton>

        <LinkedinShareButton
          onClick={(_, link) => {
            openInNewTab(link);
          }}
          openShareDialogOnClick={false}
          url={url}
        >
          <LinkedinIcon round size={40} />
        </LinkedinShareButton>

        <TwitterShareButton
          onClick={(_, link) => {
            openInNewTab(link);
          }}
          openShareDialogOnClick={false}
          url={url}
        >
          <XIcon round size={40} />
        </TwitterShareButton>
        <FacebookMessengerShareButton
          onClick={(_, link) => {
            openInNewTab(link);
          }}
          openShareDialogOnClick={false}
          url={url}
        >
          <FacebookMessengerIcon round size={40} />
        </FacebookMessengerShareButton>
      </div>

      <div className="flex items-center py-3 px-3 rounded-md bg-background">
        <p className="flex-1 font-medium line-clamp-1 ml-3">{url}</p>{" "}
        <button
          className="font-bold flex items-center hover:opacity-80"
          onClick={async () => {
            await copyTextToClipboard(url);
            toast("Copied URL to clipboard");
          }}
        >
          Copy <CopyIcon className="ml-2" />
        </button>
      </div>
    </ReusableModal>
  );
}
