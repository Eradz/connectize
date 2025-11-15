import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useNav } from "../../context/navContext";

function Logo({
  className,
  url = "/",
  height = "60px",
  width = "60px",
  size,
  imageUrl,
}) {
  const { toggleNav } = useNav();
  return (
    <Link
      to={url}
      className={clsx(
        "w-fit shrink-0 block transition-all duration-500",
        className
      )}
      onClick={() => toggleNav(false)}
    >
      <img
        src={imageUrl || "/images/logo.png"}
        style={{ height: size || height, width: size || width }}
        alt="connectize logo"
      />
    </Link>
  );
}

export default Logo;
