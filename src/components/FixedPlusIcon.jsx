import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/userContext";
import { PlusIcon } from "@radix-ui/react-icons";
import { StarOutlined } from "@ant-design/icons";
import { BriefCaseIcon, CompanyIcon, UserGroup } from "../icon";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Pencil, PencilIcon, X } from "lucide-react";
import { webRoutes } from "../lib/webRoutes";
import { CompanyUserType } from "../lib/helpers/types";
import { useGetCurrentCompany } from "../hooks";

export default function FixedPlusIcon() {
  const { user: currentUser } = useAuth();
  const { data: companies = [], isLoading } = useGetCurrentCompany();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    ...(currentUser?.companies?.length < 1 
      ? [{
          to: "/create-company",
          text: "Create a Company",
          IconName: CompanyIcon,
          color: "bg-purple-500"
        }]
      : []
    ),
    {
        to: `${webRoutes.marketplaceCreateListing}/?type=product`,
        text: "Add Product",
        IconName: StarOutlined,
        color: "bg-green-500"
    },
    {
        to: currentUser?.user_type === CompanyUserType ? webRoutes.createCompany : webRoutes.representativeManage,
        text: (currentUser?.user_type === CompanyUserType && companies?.length < 1) ? "Create Company" : "Manage Representatives",
        IconName: UserGroup,
        color: "bg-pink-500"
    },
    {
      to: webRoutes.createPost,
      text: "Create Post",
      IconName: Pencil,
      color: "bg-blue-500"
    },
  ];

  const angle = 120 / menuItems.length;

  return (
    <div className="">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay/Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 z-30"
            />
            
            {/* Menu Items positioned in a circle */}
            {menuItems.map((item, index) => {
              const itemAngle = (angle * index + 150) * (Math.PI / 180);
              const radius = 100; // Distance from center
              const x = Math.cos(itemAngle) * radius;
              const y = Math.sin(itemAngle) * radius;

              return (
                <motion.div
                  key={index}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="absolute flex gap-2 items-center min-w-max z-[40]"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    bottom: 8,
                    right: -20
                  }}
                >
                    <span className="text-white text-sm bg-mid_grey rounded-lg p-2">{item.text}</span>
                  <Link
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}
                    title={item.text}
                  >
                    {typeof item.IconName === 'function' ? (
                      <item.IconName className="w-6 h-6 text-white" />
                    ) : (
                      <item.IconName className="text-2xl text-white" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-4 rounded-full transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:shadow-xl z-40 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gold hover:bg-custom_yellow'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PlusIcon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
