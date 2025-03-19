import clsx from "clsx";
import React from "react";

export default function LightParagraph({ children, center, justify }) {
  return (
    <p
      className={clsx(
        "!max-w-screen-sm lg:max-w-screen-md text-gray-500 xs:!text-sm !text-base text-balance",
        {
          "text-center": center,
          "text-justify": justify,
        }
      )}
    >
      {children}
    </p>
  );
}
