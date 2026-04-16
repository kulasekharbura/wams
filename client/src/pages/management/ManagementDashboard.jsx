import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/mgmt/stats`,
      );
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);

      const ordersRes = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      const ordersData = await ordersRes.json();
      if (ordersRes.ok) setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch system data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprovePO = async (mongoId) => {
    try {
      // Management approval pushes PendingParts straight to InProduction
      await fetch(`${import.meta.env.VITE_API_URL}/orders/${mongoId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "InProduction" }),
      });
      fetchData(); // Refresh Queue
      alert("Manufacturing Plan & Supplier Order Approved.");
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

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
          <h3>{stats?.totalOrders || 0}</h3>
          <p>Total Orders</p>
        </div>
        <div style={tileStyle("#28a745")}>
          <h3>{stats?.totalInventory || 0}</h3>
          <p>Total Stock units</p>
        </div>
        <div style={tileStyle("#ffc107", "#000")}>
          <h3>{stats?.productionBacklog || 0}</h3>
          <p>Orders in Production</p>
        </div>
        <div
          style={tileStyle(stats?.lowStockAlerts > 0 ? "#dc3545" : "#6c757d")}
        >
          <h3>{stats?.lowStockAlerts || 0}</h3>
          <p>Low Stock Alerts</p>
        </div>
      </div>

      {/* --- Approvals Queue --- */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1.5rem",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          backgroundColor: "#fffdf5",
        }}
      >
        <h3>Approvals Queue (Pending Supplier Orders)</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "1rem" }}>Order ID</th>
              <th style={{ padding: "1rem" }}>Product</th>
              <th style={{ padding: "1rem" }}>Current State</th>
              <th style={{ padding: "1rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter((o) => o.status === "PendingParts").length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No pending manufacturing plans require approval.
                </td>
              </tr>
            ) : (
              orders
                .filter((o) => o.status === "PendingParts")
                .map((o) => (
                  <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "1rem" }}>{o.orderId}</td>
                    <td style={{ padding: "1rem" }}>{o.productName}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          color: "#856404",
                          backgroundColor: "#fff3cd",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        Waiting Approval
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        onClick={() => handleApprovePO(o._id)}
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Approve Plan
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
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
              <th style={{ padding: "1rem" }}>Health Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.productSummary?.map((item, index) => (
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
