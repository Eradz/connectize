import clsx from "clsx";
import React from "react";

export default function ProfileSection({ title, children, className }) {
  return (
    <section
      className={clsx(
        "p-4 border border-gray-200 rounded-md space-y-2 shrink-0 bg-white",
        className
      )}
    >
      <h2 className="font-semibold text-2xl xs:text-xl capitalize">{title}</h2>

      <div>{children} </div>
    </section>
  );
}
