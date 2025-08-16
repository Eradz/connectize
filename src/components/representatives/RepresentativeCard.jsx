import React from "react";
import Username from "../Username";
import { ConJoinedImages } from "../ResponsiveNav";
import { motion } from "framer-motion";
import { capitalizeFirst } from "../../lib/utils";
import { Link } from "react-router";
import ConnectButton from "../ConnectButton";
import { useAuth } from "../../context/userContext";

export default function RepresentativeCard({ user, company, role }) {
  const { user: currentUser } = useAuth();
  return (
    <motion.div
      key={user?.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center flex-col gap-6 bg-white rounded-md px-4 py-8"
    >
      <ConJoinedImages
        array={[
          {
            name: `${company?.company_name}`,
            src: company?.logo || "/images/default-company-logo.png",
            href: `/${company?.slug}`,
          },
          {
            name: `${user?.first_name} ${user?.last_name}`,
            src: user?.avatar,
            href: `/co/${user?.id}`,
          },
        ]}
        size={50}
        sizeVariant="sm"
      />
      <div className="flex flex-col items-center text-center">
        <Username user={user} />
        <small className="text-gray-400 line-clamp-2">
          {capitalizeFirst(user?.role)}
        </small>
        <small className="text-gray-400 line-clamp-2">
          {capitalizeFirst(role)} representative at{" "}
          <Link to={`/${company?.slug}`} className="!text-black keep-all">
            {company?.company_name}
          </Link>
        </small>
      </div>

      <div className="">
        {currentUser?.id !== user?.id && (
          <ConnectButton
            first_name={user?.first_name}
            id={user?.id}
            slug={user?.id}
          />
        )}
      </div>
    </motion.div>
  );
}
