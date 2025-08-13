import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import {
  Squares2X2Icon,
  UsersIcon,
  BuildingOffice2Icon,
  CubeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const menuItems = useMemo(() => ([
    { path: "/admin", label: "Dashboard", Icon: Squares2X2Icon },
    { path: "/admin/users", label: "Users", Icon: UsersIcon },
    { path: "/admin/companies", label: "Companies", Icon: BuildingOffice2Icon },
    { path: "/admin/products", label: "Products", Icon: CubeIcon },
    { path: "/admin/services", label: "Services", Icon: WrenchScrewdriverIcon },
    { path: "/admin/posts", label: "Posts", Icon: DocumentTextIcon },
    { path: "/admin/messages", label: "Messages", Icon: ChatBubbleLeftRightIcon },
    { path: "/admin/notifications", label: "Notifications", Icon: BellIcon },
    { path: "/admin/analytics", label: "Analytics", Icon: ChartBarIcon },
    { path: "/admin/settings", label: "Settings", Icon: Cog6ToothIcon },
  ]), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gray-50 to-gray-100 dark:from-dark dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar Mobile Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`absolute left-0 top-0 h-full w-80 glass-dark backdrop-blur-xl shadow-strong transform transition-all duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar menuItems={menuItems} pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 flex-col shadow-soft">
        <Sidebar menuItems={menuItems} pathname={pathname} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

const Sidebar = ({ menuItems, pathname, onNavigate }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <div className="font-display font-semibold text-lg text-gray-900 dark:text-white">Connectize</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hidden">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 select-none ${
                active
                  ? "bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50 shadow-soft"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors duration-200 ${
                active 
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              }`}>
                {item.Icon && <item.Icon className="h-5 w-5" aria-hidden="true" />}
              </div>
              <span className="font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-500 shadow-glow animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
          <div>v2.0.0 • © 2025 Connectize</div>
          <div className="mt-1 text-gray-400 dark:text-gray-500">Admin Dashboard</div>
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ onMenu, theme, onToggleTheme }) => {
  return (
    <header className="h-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 flex items-center px-4 lg:px-8 sticky top-0 z-30 shadow-soft">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenu}
        className="lg:hidden mr-3 !p-2 !h-10 !w-10"
      >
        <span className="sr-only">Open menu</span>
        <Bars3Icon className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
        <h1 className="font-display font-semibold text-xl text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <Input
              placeholder="Search anything..."
              className="w-72 pl-11 pr-16 !py-2.5 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60"
              icon={MagnifyingGlassIcon}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-200/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 rounded border border-gray-300/60 dark:border-gray-600/60">
                <CommandLineIcon className="w-3 h-3 mr-1" />
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="!p-2 !h-10 !w-10 relative"
        >
          <BellIcon className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          className="!p-2 !h-10 !w-10"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200/60 dark:border-gray-700/60">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Admin User</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">admin@connectize.com</div>
          </div>
          <Avatar
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
            alt="Admin User"
            size="md"
            status="online"
            className="cursor-pointer hover:ring-4 hover:ring-primary-100 dark:hover:ring-primary-900/30 transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminLayout;
