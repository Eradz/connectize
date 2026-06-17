import clsx from "clsx";
import { Link } from "react-router-dom";
import { VerifiedIcon } from "../icon";

export default function Username({ user, noClick = false }) {
  const username =
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.display_name ||
    user?.username ||
    user?.email ||
    "User";
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
