import React from "react";

const AdminDashboardStep4 = () => {
  return (
    <div style={{
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>
        📊 Dashboard Page
      </h2>
      <p style={{ color: "#34495e", marginBottom: "15px" }}>
        This is the admin dashboard page.
      </p>
      <div style={{
        padding: "15px",
        backgroundColor: "#e8f5e8",
        borderRadius: "6px",
        border: "1px solid #27ae60"
      }}>
        <strong>✅ Success:</strong> Individual admin pages work!
      </div>
    </div>
  );
};

export default AdminDashboardStep4;
