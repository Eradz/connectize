import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  
  const menuItems = [
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
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "256px", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", margin: 0 }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>
            Connectize Dashboard
          </p>
        </div>
        
        {/* Navigation */}
        <nav style={{ padding: "16px" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: "8px" }}>
                <Link
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: pathname === item.path ? "#1d4ed8" : "#374151",
                    backgroundColor: pathname === item.path ? "#dbeafe" : "transparent",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.path) {
                      e.target.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.path) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "18px", marginRight: "12px" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Top Header */}
        <div style={{ 
          backgroundColor: "white", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", 
          borderBottom: "1px solid #e5e7eb", 
          padding: "16px" 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: 0 }}>
              Admin Dashboard
            </h2>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Layout Working ✅
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main style={{ padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;   { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/companies", label: "Companies", icon: "🏢" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/services", label: "Services", icon: "🔧" },
    { path: "/admin/posts", label: "Posts", icon: "📝" },
    { path: "/admin/messages", label: "Messages", icon: "💬" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];eact";
import { Outlet, Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { pathname } = useLocation();
  
  console.log("AdminLayout rendering...");

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/companies", label: "Companies", icon: "🏢" },
    { path: "/admin/products", label: "Products", icon: "�" },
    { path: "/admin/services", label: "Services", icon: "�" },
    { path: "/admin/posts", label: "Posts", icon: "📝" },
    { path: "/admin/messages", label: "Messages", icon: "💬" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin/analytics", label: "Analytics", icon: "�" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">Connectize Dashboard</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            <div className="text-sm text-gray-600">
              Admin Layout Working - No Auth Required
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
