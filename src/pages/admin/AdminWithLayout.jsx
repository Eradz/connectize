import React from "react";

const AdminWithLayout = () => {
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
            <li style={{ marginBottom: "10px" }}>
              <div style={{
                padding: "10px",
                backgroundColor: "#34495e",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
                📊 Dashboard
              </div>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <div style={{
                padding: "10px",
                backgroundColor: "#34495e",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
                👥 Users
              </div>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <div style={{
                padding: "10px",
                backgroundColor: "#34495e",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
                🏢 Companies
              </div>
            </li>
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
            ✅ Admin Layout Working - Step 3
          </h1>
        </div>

        {/* Content Area */}
        <div style={{ padding: "20px" }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: "#27ae60", margin: "0 0 15px 0" }}>
              Layout Structure Test
            </h2>
            <div style={{
              padding: "15px",
              backgroundColor: "#d5f4e6",
              borderRadius: "6px"
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#1e8449" }}>Progress:</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#2c3e50" }}>
                <li>✅ Basic routing works</li>
                <li>✅ React component creation works</li>
                <li>✅ Layout with sidebar works</li>
                <li>🔄 Next: Add React Router navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithLayout;
