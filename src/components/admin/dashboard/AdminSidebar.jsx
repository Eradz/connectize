import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  DocumentTextIcon,
  BellIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  TruckIcon,
  AcademicCapIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const AdminSidebar = ({ isCollapsed = false, onToggle }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onToggle && onToggle(!collapsed);
  };

  const adminMenuItems = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      path: "/admin",
      exact: true,
    },
    {
      title: "Analytics",
      icon: ChartBarIcon,
      path: "/admin/analytics",
    },
    {
      title: "Users",
      icon: UsersIcon,
      path: "/admin/users",
      submenu: [
        { title: "All Users", path: "/admin/users" },
        { title: "User Analytics", path: "/admin/users/analytics" },
        { title: "User Verification", path: "/admin/users/verification" },
      ],
    },
    {
      title: "Companies",
      icon: BuildingOfficeIcon,
      path: "/admin/companies",
      submenu: [
        { title: "All Companies", path: "/admin/companies" },
        { title: "Company Analytics", path: "/admin/companies/analytics" },
        { title: "Company Verification", path: "/admin/companies/verification" },
        { title: "Company Categories", path: "/admin/companies/categories" },
      ],
    },
    {
      title: "Products",
      icon: CubeIcon,
      path: "/admin/products",
      submenu: [
        { title: "All Products", path: "/admin/products" },
        { title: "Product Analytics", path: "/admin/products/analytics" },
        { title: "Product Categories", path: "/admin/products/categories" },
        { title: "Product Approval", path: "/admin/products/approval" },
      ],
    },
    {
      title: "Services",
      icon: WrenchScrewdriverIcon,
      path: "/admin/services",
      submenu: [
        { title: "All Services", path: "/admin/services" },
        { title: "Service Analytics", path: "/admin/services/analytics" },
        { title: "Service Categories", path: "/admin/services/categories" },
        { title: "Service Approval", path: "/admin/services/approval" },
      ],
    },
    {
      title: "Orders & Sales",
      icon: ShoppingBagIcon,
      path: "/admin/orders",
      submenu: [
        { title: "All Orders", path: "/admin/orders" },
        { title: "Sales Analytics", path: "/admin/orders/analytics" },
        { title: "Revenue Reports", path: "/admin/orders/revenue" },
      ],
    },
    {
      title: "Posts & Content",
      icon: DocumentTextIcon,
      path: "/admin/content",
      submenu: [
        { title: "All Posts", path: "/admin/content" },
        { title: "Create Post", path: "/admin/content/create" },
      ],
    },
    {
      title: "Messages",
      icon: ChatBubbleLeftRightIcon,
      path: "/admin/messages",
      submenu: [
        { title: "Message Overview", path: "/admin/messages" },
        { title: "Message Analytics", path: "/admin/messages/analytics" },
        { title: "Reported Messages", path: "/admin/messages/reports" },
      ],
    },
    {
      title: "Deal Rooms",
      icon: BriefcaseIcon,
      path: "/admin/deals",
      submenu: [
        { title: "All Deal Rooms", path: "/admin/deals" },
        { title: "Deal Analytics", path: "/admin/deals/analytics" },
        { title: "Deal Approvals", path: "/admin/deals/approvals" },
        { title: "Deal Categories", path: "/admin/deals/categories" },
        { title: "Deal Reports", path: "/admin/deals/reports" },
      ],
    },
    {
      title: "Workforce",
      icon: UsersIcon,
      path: "/admin/workforce",
      submenu: [
        { title: "Job Postings", path: "/admin/workforce/jobs" },
        { title: "Professional Profiles", path: "/admin/workforce/profiles" },
        { title: "Job Analytics", path: "/admin/workforce/analytics" },
        { title: "Job Approvals", path: "/admin/workforce/approvals" },
        { title: "Workforce Events", path: "/admin/workforce/events" },
        { title: "Applications", path: "/admin/workforce/applications" },
      ],
    },
    {
      title: "Logistics Hub",
      icon: TruckIcon,
      path: "/admin/logistics",
      submenu: [
        { title: "Logistics Requests", path: "/admin/logistics/requests" },
        { title: "Shipments", path: "/admin/logistics/shipments" },
        { title: "Inventory", path: "/admin/logistics/inventory" },
        { title: "Logistics Analytics", path: "/admin/logistics/analytics" },
        { title: "Logistics Providers", path: "/admin/logistics/providers" },
        { title: "Tracking", path: "/admin/logistics/tracking" },
      ],
    },
    {
      title: "Knowledge Hub",
      icon: AcademicCapIcon,
      path: "/admin/knowledge",
      submenu: [
        { title: "Articles", path: "/admin/knowledge/articles" },
        { title: "Forums", path: "/admin/knowledge/forums" },
        { title: "Categories", path: "/admin/knowledge/categories" },
        { title: "Moderation", path: "/admin/knowledge/moderation" },
        { title: "Knowledge Analytics", path: "/admin/knowledge/analytics" },
        { title: "Content Approval", path: "/admin/knowledge/approvals" },
      ],
    },
    {
      title: "Subscriptions",
      icon: CreditCardIcon,
      path: "/admin/subscriptions",
      submenu: [
        { title: "All Subscriptions", path: "/admin/subscriptions" },
        { title: "Subscription Plans", path: "/admin/subscriptions/plans" },
        { title: "Billing Management", path: "/admin/subscriptions/billing" },
        { title: "Payment Methods", path: "/admin/subscriptions/payments" },
        { title: "Subscription Analytics", path: "/admin/subscriptions/analytics" },
        { title: "Revenue Reports", path: "/admin/subscriptions/revenue" },
        { title: "Plan Management", path: "/admin/subscriptions/plan-management" },
      ],
    },
    {
      title: "Notifications",
      icon: BellIcon,
      path: "/admin/notifications",
      submenu: [
        { title: "Send Notifications", path: "/admin/notifications/send" },
        { title: "Notification Analytics", path: "/admin/notifications/analytics" },
        { title: "Templates", path: "/admin/notifications/templates" },
      ],
    },
    {
      title: "Settings",
      icon: CogIcon,
      path: "/admin/settings",
      submenu: [
        { title: "Platform Settings", path: "/admin/settings/platform" },
        { title: "User Roles", path: "/admin/settings/roles" },
        { title: "System Configuration", path: "/admin/settings/system" },
        { title: "API Keys", path: "/admin/settings/api" },
      ],
    },
  ];

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (title) => {
    if (collapsed) return; // Don't expand submenus when sidebar is collapsed
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div
      className={clsx(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-40 border-r border-gray-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.title];
            const isActive = isActivePath(item.path, item.exact);

            return (
              <li key={item.title}>
                <div>
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={clsx(
                        "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && hasSubmenu && (
                        <svg
                          className={clsx(
                            "w-4 h-4 transition-transform",
                            isExpanded ? "rotate-90" : ""
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={clsx(
                        "flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {hasSubmenu && isExpanded && !collapsed && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          className={clsx(
                            "block px-3 py-2 text-sm rounded-lg transition-colors",
                            isActivePath(subItem.path)
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
