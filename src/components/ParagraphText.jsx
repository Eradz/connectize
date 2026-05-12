import clsx from "clsx";
import React from "react";

export default function LightParagraph({
  children,
  center,
  justify,
  asDiv,
  balance = true,
  className: extraClassName,
}) {
  const className = clsx(
    "!max-w-screen-sm lg:max-w-screen-md text-gray-500 xs:!text-sm !text-base",
    balance && "text-balance",
    extraClassName,
    {
      "text-center": center,
      "text-justify": justify,
    }
  );
  return asDiv ? (
    <div className={className}>{children}</div>
  ) : (
    <p className={className}>{children}</p>
  );
}
