import React from "react";
import Logo from "../logo";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import Headroom from "react-headroom";
import { ChevronRightIcon } from "@radix-ui/react-icons";

function ProfileNavBar() {
  const { pathname } = useLocation();
  const navItems = [
    {
      name: pathname !== "/bio" ? "Personal Information" : "...",
      to: "/update-profile",
      isLast: false,
    },
    { name: "Contact", to: "/contact", isLast: false },
    { name: "Address", to: "/address", isLast: false },
    { name: pathname === "/bio" ? "Bio" : "...", to: "/bio", isLast: true },
  ];
  return (
    <Headroom>
      <nav className="bg-white w-full z-[1000000]">
        <section className="container max-w-screen-lg flex gap-x-4 flex-wrap justify-between py-2">
          <Logo />

          {pathname !== "/overview" && (
            <ul className="py-2 flex flex-wrap gap-3 pointer-events-none">
              {navItems.map(({ name, to, isLast }) => {
                return (
                  <li key={to} className="flex items-center gap-1">
                    <Link
                      to={to}
                      about={name}
                      className={clsx(
                        "transition-all duration-300 text-gray-500 hover:text-black text-sm",
                        {
                          "border-b-2 border-black text-black pointer-events-none font-semibold":
                            pathname === to,
                        }
                      )}
                    >
                      {name}
                    </Link>
                    {!isLast && <ChevronRightIcon />}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </nav>
    </Headroom>
  );
}

export default ProfileNavBar;
