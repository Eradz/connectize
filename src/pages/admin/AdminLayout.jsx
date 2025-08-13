import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

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
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/companies", label: "Companies", icon: "🏢" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/services", label: "Services", icon: "🔧" },
    { path: "/admin/posts", label: "Posts", icon: "📝" },
    { path: "/admin/messages", label: "Messages", icon: "💬" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ]), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar (mobile overlay) */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar menuItems={menuItems} pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
        <Sidebar menuItems={menuItems} pathname={pathname} />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
        <main className="p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

const Sidebar = ({ menuItems, pathname, onNavigate }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">Cz</div>
        <div className="ml-3">
          <div className="text-sm font-semibold">Connectize</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all select-none ${
                active
                  ? "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-900/50"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        v1.0 • © Connectize
      </div>
    </div>
  );
};

const Topbar = ({ onMenu, theme, onToggleTheme }) => {
  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      {/* Mobile menu */}
      <button type="button" onClick={onMenu} className="lg:hidden mr-2 p-2 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
        <span className="sr-only">Open menu</span>☰
      </button>
      <div className="font-semibold">Admin Dashboard</div>
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search…"
              className="w-64 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">⌘K</span>
          </div>
        </div>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '🌞'}
        </button>
        {/* User */}
        <button type="button" className="ml-1 p-1 pl-2 pr-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
          <span className="inline-block w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default AdminLayout;
