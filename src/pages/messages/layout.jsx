import React from "react";

import MessagingPage from "../messages/messaging";

import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import SEO from "../../components/SEO";
import MessagesPage from "../messages";

export default function MessagesLayout() {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  return (
    <section className="w-full flex gap-4">
      <SEO
        title={
          room_name ? "Room messaging in connectize" : "Messaging in connectize"
        }
      />
      <section
        className={clsx(
          "lg:max-w-[400px] w-full 2xl:max-w-[500px] space-y-6 bg-white h-screen p-4 rounded-md overflow-hidden",
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
        <MessagingPage />
      </section>
    </section>
  );
}
