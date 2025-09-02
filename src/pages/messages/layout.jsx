import MessagingPage from "../messages/messaging";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import clsx from "clsx";
import { useSearchParams } from "react-router";
import { CircleTitleSubtitleSkeleton } from "../../components/admin/feeds/TopServiceSuggestions";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";

import MessagesPage from "../messages";

export const meta = () =>
  createSEO({
    title: "Messaging in connectize",
  });

export default function MessagesLayout() {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  const { user: currentUser, loading } = useAuth();

  return (
    <section className="w-full h-full flex gap-4">
      <SEO
        title={
          room_name ? "Peer messaging in connectize" : "Messaging in connectize"
        }
      />
      <section
        className={clsx(
          "lg:max-w-[300px] min-w-[250px] xl:max-w-[400px] w-full 2xl:max-w-[500px] space-y-6 bg-white h-full p-4 rounded-md overflow-hidden",
          {
            "max-lg:hidden": room_name,
          }
        )}
      >
        <MessagesPage />
      </section>
      <section
        className={clsx(
          "w-full flex-1 h-97vh h-full border border-gray-100 rounded-md",
          {
            "max-lg:hidden": !room_name,
          }
        )}
      >
        {room_name ? (
          <MessagingPage />
        ) : (
          <section className="flex items-center justify-center min-h-full bg-white rounded-md">
            <div className="max-w-screen-xs text-center -translate-y-16 space-y-1 flex items-center flex-col">
              <DotLottieReact
                src="/lottie/notification.lottie"
                loop
                autoplay
                className="size-40 pointer-events-none shrink-0"
              />
              {loading ? (
                <CircleTitleSubtitleSkeleton />
              ) : (
                <h1 className="text-3xl font-light">
                  <span className="font-bold text-gold">
                    {currentUser?.first_name},
                  </span>
                </h1>
              )}
              <HeadingText weight="semibold">
                Welcome to Connectize Messaging
              </HeadingText>
              <LightParagraph>Select a user to start messaging</LightParagraph>
            </div>
          </section>
        )}
      </section>
    </section>
  );
}
