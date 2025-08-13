import React from "react";

const AdminBasic = () => {
  return (
    <div style={{
      padding: "20px", 
      backgroundColor: "#e8f5e8", 
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{color: "#2e7d32", margin: "0 0 10px 0"}}>
        ✅ Admin Component Working - Step 2
      </h1>
      <p style={{color: "#333", fontSize: "16px"}}>
        Basic React component is functional!
      </p>
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#c8e6c9",
        borderRadius: "8px"
      }}>
        <h3 style={{margin: "0 0 10px 0", color: "#1b5e20"}}>Status:</h3>
        <ul style={{margin: 0, paddingLeft: "20px"}}>
          <li>✅ Basic routing works</li>
          <li>✅ React component creation works</li>
          <li>🔄 Next: Add layout structure</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminBasic;
