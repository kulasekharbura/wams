import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mgmt/stats");
        const data = await response.json();
        if (response.ok) setStats(data);
      } catch (error) {
        console.error("Failed to fetch system analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading System Analytics...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Management Authority Dashboard</h2>
        <button
          onClick={logout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <p style={{ color: "#666" }}>
        Welcome back, {user.username}. Monitoring system-wide operations.
      </p>
      <hr />

      {/* --- Key Metrics Tiles --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        <div style={tileStyle("#007bff")}>
          <h3>{stats?.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div style={tileStyle("#28a745")}>
          <h3>{stats?.totalInventory}</h3>
          <p>Total Stock units</p>
        </div>
        <div style={tileStyle("#ffc107", "#000")}>
          <h3>{stats?.productionBacklog}</h3>
          <p>Orders in Production</p>
        </div>
        <div
          style={tileStyle(stats?.lowStockAlerts > 0 ? "#dc3545" : "#6c757d")}
        >
          <h3>{stats?.lowStockAlerts}</h3>
          <p>Low Stock Alerts</p>
        </div>
      </div>

      {/* --- Detailed Inventory Summary --- */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Inventory Health Summary</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th style={{ padding: "1rem" }}>Product Name</th>
              <th style={{ padding: "1rem" }}>Current Stock</th>
              <th style={{ padding: "1rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.productSummary.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #f9f9f9" }}>
                <td style={{ padding: "1rem" }}>{item.name}</td>
                <td style={{ padding: "1rem" }}>{item.stock}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      backgroundColor: item.stock < 10 ? "#ffdce0" : "#d4edda",
                      color: item.stock < 10 ? "#af1e2c" : "#155724",
                    }}
                  >
                    {item.stock < 10 ? "LOW STOCK" : "HEALTHY"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple helper for card styling
const tileStyle = (bgColor, textColor = "#fff") => ({
  backgroundColor: bgColor,
  color: textColor,
  padding: "1.5rem",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
});

export default ManagementDashboard;
