import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/userContext";
// Pull unread notifications count from the AdminData context used by the admin shell
import { useAdminData } from "../../../pages/admin/ComprehensiveAdmin";
import { logOutCurrentUser } from "../../../api-services/users";
import { avatarStyle } from "../../ResponsiveNav";

const AdminNavbar = () => {
  const { user: currentUser } = useAuth();
  const { unreadNotificationsCount, refreshUnreadCount } = useAdminData?.() || { unreadNotificationsCount: 0, refreshUnreadCount: () => {} };
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await logOutCurrentUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Ensure badge is populated on mount
  useEffect(() => {
    try { refreshUnreadCount(); } catch {}
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link to="/admin" className="flex items-center space-x-3">
            <img
              src="/connectizelogo.png"
              alt="Connectize"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">
              Admin Dashboard
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, companies, products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Link to="/admin/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" aria-label="Notifications">
            <BellIcon className="h-6 w-6" />
            {Number(unreadNotificationsCount) > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] leading-none rounded-full">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </Link>

          {/* Quick Actions */}
          <Link
            to="/admin/settings"
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </Link>

          {/* User Menu */}
          <Menu>
            <MenuButton as="div" className="cursor-pointer">
              <div className="flex items-center space-x-3">
                <Avatar
                  name={`${currentUser?.first_name} ${currentUser?.last_name}`}
                  src={currentUser?.profile_picture}
                  size="sm"
                  style={avatarStyle}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.first_name} {currentUser?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </MenuButton>
            <MenuList className="border border-gray-200 shadow-lg">
              <MenuItem as="div" className="px-4 py-2">
                <Link
                  to="/profile"
                  className="flex items-center w-full text-gray-700 hover:text-gray-900"
                >
                  <UserCircleIcon className="h-5 w-5 mr-3" />
                  My Profile
                </Link>
              </MenuItem>
              <MenuItem as="div" className="px-4 py-2">
                <Link
                  to="/admin/settings"
                  className="flex items-center w-full text-gray-700 hover:text-gray-900"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-3" />
                  Settings
                </Link>
              </MenuItem>
              <MenuItem as="div" className="px-4 py-2 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-red-600 hover:text-red-800"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
