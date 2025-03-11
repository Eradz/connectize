import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function SideNavigation({
  array,
  activeSection,
  setActiveSection,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const formattedActiveSection = activeSection
    .replace(/\s+/g, "-")
    .toLowerCase();

  useEffect(() => {
    const element = document.getElementById(formattedActiveSection);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formattedActiveSection]);

  return (
    <div className="relative shrink-0 overflow-hidden">
      <button
        className="md:hidden p-2 sticky top-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      <nav
        className={`md:w-full md:h-full pr-4 md:border-r sticky left-0 top-0 ${
          isOpen ? "w-[130px] h-full border-r" : "w-0 h-0"
        } overflow-hidden transition-[width] md:transition-none duration-300`}
      >
        <ul>
          {array[0].details?.map((item, index) => {
            return (
              <NavItemLi
                key={index}
                heading={item.heading}
                activeSection={formattedActiveSection}
                setActiveSection={setActiveSection}
                setIsOpen={setIsOpen}
              />
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

const NavItemLi = ({ heading, activeSection, setActiveSection, setIsOpen }) => {
  const formattedHeading = heading.replace(/\s+/g, "-").toLowerCase();
  return (
    <li className="mb-2">
      <NavLink
        to={`#${formattedHeading}`}
        className={`block p-2 rounded-md text-gray-700 hover:!bg-gold text-xs ${
          activeSection === formattedHeading ? "font-semibold !bg-gold" : ""
        }`}
        onClick={() => {
          setActiveSection(formattedHeading);
          setIsOpen(false);
        }}
      >
        {heading}
      </NavLink>
    </li>
  );
};
