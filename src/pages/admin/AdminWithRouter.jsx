import React from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import AdminDashboardStep4 from "./AdminDashboardStep4";
import AdminUsersStep4 from "./AdminUsersStep4";
import AdminWithAPI from "./AdminWithAPI";

const AdminWithRouter = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/companies", label: "Companies", icon: "🏢" },
    { path: "/admin/api-test", label: "API Test", icon: "🔌" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: "250px",
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "20px"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#ecf0f1" }}>
          Admin Panel
        </h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: "10px" }}>
                <Link
                  to={item.path}
                  style={{
                    display: "block",
                    padding: "10px",
                    backgroundColor: location.pathname === item.path ? "#34495e" : "#2c3e50",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "white",
                    border: location.pathname === item.path ? "2px solid #3498db" : "2px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "#ecf0f1" }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderBottom: "1px solid #bdc3c7",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ margin: 0, color: "#2c3e50" }}>
            ✅ Admin Router Working - Step 4
          </h1>
          <p style={{ margin: "5px 0 0 0", color: "#7f8c8d" }}>
            Current route: {location.pathname}
          </p>
        </div>

        {/* Content Area */}
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<AdminDashboardStep4 />} />
            <Route path="/users" element={<AdminUsersStep4 />} />
            <Route path="/api-test" element={<AdminWithAPI />} />
            <Route path="/companies" element={
              <div style={{
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>
                  🏢 Companies Management
                </h2>
                <p style={{ color: "#34495e" }}>
                  Companies page - Router navigation working!
                </p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminWithRouter;
