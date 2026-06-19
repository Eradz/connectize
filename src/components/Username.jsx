import clsx from "clsx";
import { Link } from "react-router-dom";
import { VerifiedIcon } from "../icon";
import { getUserDisplayName } from "../lib/userDisplay";

export default function Username({ user, noClick = false }) {
  const username = getUserDisplayName(user);
  return (
    <div className="flex items-center">
      <Link
        to={`/co/${user?.id}`}
        className={clsx("font-semibold line-clamp-1 break-all", {
          "pointer-events-none": noClick,
        })}
      >
        {username}
      </Link>

      {user?.verified && <VerifiedIcon color="black" />}
    </div>
  );
}
