import React from "react";

import MessagingPage from "../messages/messaging";

import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import MessagesPage from "../messages";

export default function MessagesLayout() {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  const { user: currentUser } = useAuth();
  return (
    <section className="w-full flex gap-4">
      <SEO
        title={
          room_name ? "Room messaging in connectize" : "Messaging in connectize"
        }
      />
      <section
        className={clsx(
          "lg:max-w-[300px] xl:max-w-[400px] w-full 2xl:max-w-[500px] space-y-6 bg-white h-screen p-4 rounded-md overflow-hidden",
          {
            "max-lg:hidden": room_name,
          }
        )}
      >
        <MessagesPage />
      </section>
      <section
        className={clsx(
          "w-full flex-1 space-y-6 h-screen border border-gray-100 rounded-md",
          {
            "max-lg:hidden": !room_name,
          }
        )}
      >
        {room_name ? (
          <MessagingPage />
        ) : (
          <section className="flex items-center justify-center min-h-full bg-white rounded-md">
            <div className="max-w-screen-xs text-center -translate-y-10 space-y-2">
              <h1 className="text-4xl font-light">
                Hello{" "}
                <span className="font-bold text-gold">
                  {currentUser.first_name}
                </span>
              </h1>
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
