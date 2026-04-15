import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ORDER_STATES,
  ORDER_ACTIONS,
  getNextOrderState,
} from "../../utils/stateMachine";

const InventoryDashboard = () => {
  const { user, logout } = useAuth();
  const [productStock, setProductStock] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    try {
      const prodRes = await fetch("http://localhost:5000/api/products");
      const prodData = await prodRes.json();
      if (prodRes.ok) setProductStock(prodData);

      const ordRes = await fetch("http://localhost:5000/api/orders");
      const ordData = await ordRes.json();
      if (ordRes.ok) setOrders(ordData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessOrder = async (
    orderId,
    productId,
    quantityNeeded,
    currentStatus,
    mongoId,
  ) => {
    try {
      let nextState = getNextOrderState(currentStatus, ORDER_ACTIONS.PROCESS);
      const product = productStock.find((p) => p.productId === productId);
      const stockAvailable = product
        ? product.stockAvailable >= quantityNeeded
        : false;

      if (stockAvailable) {
        nextState = getNextOrderState(nextState, ORDER_ACTIONS.STOCK_AVAILABLE);
        await fetch(`http://localhost:5000/api/products/${productId}/stock`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantityDeducted: quantityNeeded }),
        });
      } else {
        nextState = getNextOrderState(
          nextState,
          ORDER_ACTIONS.STOCK_UNAVAILABLE,
        );
      }

      await fetch(`http://localhost:5000/api/orders/${mongoId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextState }),
      });
      fetchData(); // Refresh both lists
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  // --- NEW: Trigger Request to Supplier ---
  const handleRequestQuote = async (order) => {
    try {
      const rfqData = {
        rfqId: `RFQ-${order.orderId.split("-")[1]}`,
        partName: `Raw Materials for ${order.productName}`,
        quantity: order.quantity,
      };

      const res = await fetch("http://localhost:5000/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rfqData),
      });

      if (res.ok) alert(`RFQ ${rfqData.rfqId} sent to Supplier Dashboard!`);
    } catch (error) {
      console.error("Error sending RFQ:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Inventory Manager Dashboard - {user.username}</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <hr />
      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>Stock</h3>
          {productStock.map((p) => (
            <div key={p._id}>
              {p.productName}: <strong>{p.stockAvailable}</strong>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 2,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>Order Queue</h3>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{o.orderId}</td>
                  <td>{o.productName}</td>
                  <td>
                    <small>{o.status}</small>
                  </td>
                  <td>
                    {o.status === "UnprocessedOrder" && (
                      <button
                        onClick={() =>
                          handleProcessOrder(
                            o.orderId,
                            o.productId,
                            o.quantity,
                            o.status,
                            o._id,
                          )
                        }
                      >
                        Process
                      </button>
                    )}
                    {/* BUTTON TO SEND TO SUPPLIER */}
                    {o.status === "PartChecking" && (
                      <button
                        onClick={() => handleRequestQuote(o)}
                        style={{
                          backgroundColor: "#ffc107",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px",
                        }}
                      >
                        Request Quote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
