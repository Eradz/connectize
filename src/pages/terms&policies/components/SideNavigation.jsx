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
        type="button"
        aria-label={isOpen ? "Close sections" : "Open sections"}
        className="md:hidden sticky top-0 inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-[#DFD9C8] bg-[#FCFAF5] text-sm text-[#3E4A61]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span aria-hidden="true" className="inline-flex flex-col gap-[3px]">
          <span className="block w-4 h-[2px] bg-current rounded-sm" />
          <span className="block w-4 h-[2px] bg-current rounded-sm" />
          <span className="block w-4 h-[2px] bg-current rounded-sm" />
        </span>
        <span>Sections</span>
      </button>

      <nav
        className={`md:w-full md:h-full pr-6 md:border-r md:border-[#DFD9C8] sticky left-0 top-0 ${
          isOpen ? "w-[220px] h-full border-r border-[#DFD9C8]" : "w-0 h-0"
        } overflow-hidden transition-[width] md:transition-none duration-300`}
      >
        <div className="hidden md:block font-mono text-[11px] tracking-[0.12em] uppercase text-[#7A561F] mb-4 pt-1">
          On this page
        </div>
        <ul className="flex flex-col md:flex-row gap-1.5 md:justify-between text-[14px] ">
          {array[0].details?.map((item, index) => {
            return (
              <NavItemLi
                key={index}
                index={index}
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

const NavItemLi = ({
  index,
  heading,
  activeSection,
  setActiveSection,
  setIsOpen,
}) => {
  const formattedHeading = heading.replace(/\s+/g, "-").toLowerCase();
  const isActive = activeSection === formattedHeading;
  const number = String(index + 1).padStart(2, "0");

  return (
    <li className="mb-1">
      <NavLink
        to={`#${formattedHeading}`}
        className={`flex items-baseline gap-2.5 py-2 px-2.5 rounded-sm text-[14px] border-l-2 transition-colors duration-150 ${
          isActive
            ? "font-medium text-[#12203A] bg-gold border-l-[#9C6F2E]"
            : "text-[#6E7688] border-l-transparent hover:text-[#12203A] hover:bg-[#E9E4D6]"
        }`}
        onClick={() => {
          setActiveSection(formattedHeading);
          setIsOpen(false);
        }}
      >
        <span
          className={`font-mono text-[11px] shrink-0 ${
            isActive ? "text-[#7A561F]" : "text-[#DFD9C8]"
          }`}
        >
          {number}
        </span>
        <span>{heading}</span>
      </NavLink>
    </li>
  );
};