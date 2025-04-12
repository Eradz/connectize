import clsx from "clsx";
import React from "react";
import { Link } from "react-router-dom";
import { VerifiedIcon } from "../icon";

export default function Username({ user, noClick = false }) {
  return (
    <div className="flex items-center">
      <Link
        to={`/co/${user?.id}`}
        className={clsx("font-semibold line-clamp-1 break-all", {
          "pointer-events-none": noClick,
        })}
      >
        {user?.first_name || ""} {user?.last_name || ""}
      </Link>

      {user?.verified && <VerifiedIcon color="black" />}
    </div>
  );
}
