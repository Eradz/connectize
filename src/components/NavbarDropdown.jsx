import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/userContext";
import { StarOutlined } from "@ant-design/icons";
import { BriefCaseIcon, CompanyIcon, UserGroup } from "../icon";

export default function NavbarDropdown() {
  const { user: currentUser } = useAuth();
  return (
    <Popover>
      <PopoverTrigger>
        <button className="relative bg-gold p-2 md:!py-1.5 rounded-md hover:bg-opacity-80 transition-all duration-300 flex items-center gap-1 text-sm">
          <PlusIcon />
          <span className="max-md:sr-only">New</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="mx-2 !max-w-[240px]">
        <PopoverArrow />
        <section className="flex flex-col divide-y p-1">
          {currentUser?.companies?.length < 1 && (
            <DropDownOption
              to="/create-company"
              text="Create a Company"
              IconName={CompanyIcon}
            />
          )}
          <DropDownOption
            to="/products/listing"
            text="Add New Product"
            IconName={StarOutlined}
          />
          <DropDownOption
            to="/services/add"
            text="Add New Services"
            IconName={BriefCaseIcon}
          />
          <DropDownOption
            IconName={UserGroup}
            to="/co/representatives/manage"
            text="Add Representatives"
          />
        </section>
      </PopoverContent>
    </Popover>
  );
}

function DropDownOption({ to, text, IconName }) {
  return (
    <Link
      to={to}
      className="hover:bg-gold hover:!border-transparent transition-colors duration-300 py-2 px-4 text-sm hover:rounded-md flex items-center gap-2 font-[400] text-black"
    >
      {IconName && <IconName className="size-4 text-lg" />}
      <span> {text}</span>
    </Link>
  );
}
