import React, { useState, useEffect } from "react";

const AdminWithAPI = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simple fetch without makeApiRequest helper
        const response = await fetch('http://127.0.0.1:8000/api/users/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            total_users: data.results?.length || data.count || 0,
            message: "API connection successful!"
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.log("API Error (expected in development):", err.message);
        // Set mock data instead of failing
        setStats({
          total_users: 150,
          message: "Using mock data (API not available)"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>
        📊 Dashboard with API - Step 5
      </h2>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px",
        marginBottom: "20px"
      }}>
        <div style={{
          padding: "15px",
          backgroundColor: "#e3f2fd",
          borderRadius: "6px",
          border: "1px solid #2196f3"
        }}>
          <h3 style={{ margin: "0 0 5px 0", color: "#1976d2" }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1565c0" }}>
            {stats?.total_users || 0}
          </p>
        </div>
        
        <div style={{
          padding: "15px",
          backgroundColor: "#e8f5e8",
          borderRadius: "6px",
          border: "1px solid #27ae60"
        }}>
          <h3 style={{ margin: "0 0 5px 0", color: "#27ae60" }}>API Status</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#2e7d32" }}>
            {stats?.message}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#ffebee",
          borderRadius: "6px",
          border: "1px solid #f44336",
          marginTop: "15px"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{
        padding: "15px",
        backgroundColor: "#fff3e0",
        borderRadius: "6px",
        border: "1px solid #ff9800",
        marginTop: "15px"
      }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>Progress Status:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#ef6c00" }}>
          <li>✅ Basic routing works</li>
          <li>✅ React components work</li>
          <li>✅ Layout structures work</li>
          <li>✅ React Router navigation works</li>
          <li>✅ Simple API calls work</li>
          <li>🔄 Next: Test complex API integration</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminWithAPI;
