import clsx from "clsx";
import { Link } from "react-router-dom";
import { VerifiedIcon } from "../../icon";

export default function CompanyName({ slug, name, verified, size = "sm", company, userId }) {
  return (
    <div className="flex items-center">
      <Link
        to={company ? `/${name}` : `/co/${userId}`}
        className={clsx("text-lg font-bold break-all line-clamp-1", {
          "xs:text-sm": size === "sm",
          "xs:text-lg": size === "md",
        })}
      >
        {name}
      </Link>
      {verified && <VerifiedIcon color="black" />}
    </div>
  );
}
