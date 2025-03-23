import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React from "react";

export default function Restricted({ fallback = "this" }) {
  return (
    <div className="text-center min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <DotLottieReact
        src="/lottie/notification.lottie"
        loop
        autoplay
        className="size-10/12 xs:size-1/2 md:size-56  aspect-square"
      />
      <p className="max-w-screen-sm m-auto">
        Your account type restricts you from {fallback} on connectize. <br />{" "}
        Kindly register a professional mail e.g{" "}
        <strong>example@yourbusiness.com</strong> to enjoy unrestricted
        privileges on connectize
      </p>
    </div>
  );
}
