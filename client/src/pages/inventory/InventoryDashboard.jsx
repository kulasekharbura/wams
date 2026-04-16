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
      const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const prodData = await prodRes.json();
      if (prodRes.ok) setProductStock(prodData);

      const ordRes = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
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
        // Deduct from stock directly
        await fetch(
          `${import.meta.env.VITE_API_URL}/products/${productId}/stock`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantityDeducted: quantityNeeded }),
          },
        );
      } else {
        nextState = getNextOrderState(
          nextState,
          ORDER_ACTIONS.STOCK_UNAVAILABLE,
        );
      }

      await fetch(`${import.meta.env.VITE_API_URL}/orders/${mongoId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextState }),
      });
      fetchData(); // Refresh both lists
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  const handleRequestQuote = async (order) => {
    try {
      const rfqData = {
        rfqId: `RFQ-${order.orderId.split("-")[1] || Math.floor(Math.random() * 1000)}`,
        partName: `Raw Materials for ${order.productName}`,
        quantity: order.quantity,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/quotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rfqData),
      });

      if (res.ok) {
        // Automatically transition order to PendingParts
        await fetch(
          `${import.meta.env.VITE_API_URL}/orders/${order._id}/status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: ORDER_STATES.PENDING_PARTS }),
          },
        );
        alert(`RFQ ${rfqData.rfqId} sent to Supplier Dashboard!`);
        fetchData();
      }
    } catch (error) {
      console.error("Error sending RFQ:", error);
    }
  };

  // Helper method for standard sequential status updates
  const handleUpdateStatus = async (
    mongoId,
    nextAction,
    currentStatus,
    additionalData = {},
  ) => {
    const nextState = getNextOrderState(currentStatus, nextAction);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${mongoId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextState,
            productId: additionalData.productId,
            quantity: additionalData.quantity,
          }),
        },
      );

      if (res.ok) {
        fetchData();
        alert(`Order moved to: ${nextState}`);
      }
    } catch (error) {
      console.error("Status update failed:", error);
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
        {/* Stock Panel */}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            height: "fit-content",
          }}
        >
          <h3>Stock</h3>
          {productStock.map((p) => (
            <div key={p._id} style={{ marginBottom: "0.5rem" }}>
              {p.productName}: <strong>{p.stockAvailable}</strong>
            </div>
          ))}
        </div>

        {/* Order Queue Panel */}
        <div
          style={{
            flex: 2,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>Order Queue</h3>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "0.5rem" }}>Order ID</th>
                <th>Product</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{o.orderId}</td>
                  <td>{o.productName}</td>
                  <td>
                    <small
                      style={{
                        backgroundColor: "#e9ecef",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {o.status}
                    </small>
                  </td>
                  <td>
                    {/* Step: Initial Processing */}
                    {o.status === ORDER_STATES.UNPROCESSED && (
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

                    {/* Step: Requesting Parts */}
                    {o.status === ORDER_STATES.PART_CHECKING && (
                      <button
                        onClick={() => handleRequestQuote(o)}
                        style={{
                          backgroundColor: "#ffc107",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Request Quote
                      </button>
                    )}

                    {/* Step: Receiving Parts */}
                    {o.status === ORDER_STATES.PENDING_PARTS && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            o._id,
                            ORDER_ACTIONS.PARTS_DELIVERED,
                            o.status,
                          )
                        }
                        style={{
                          backgroundColor: "#17a2b8",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Receive Parts & Start Mfg
                      </button>
                    )}

                    {/* Step: Finishing Production */}
                    {o.status === ORDER_STATES.IN_PRODUCTION && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            o._id,
                            ORDER_ACTIONS.PRODUCTION_DONE,
                            o.status,
                            { productId: o.productId, quantity: o.quantity },
                          )
                        }
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Complete Production
                      </button>
                    )}

                    {/* Step: Billing */}
                    {o.status === ORDER_STATES.PRODUCTION_COMPLETED && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            o._id,
                            ORDER_ACTIONS.GENERATE_BILL,
                            o.status,
                          )
                        }
                        style={{
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Generate Bill
                      </button>
                    )}

                    {/* Final Step: Fulfillment */}
                    {o.status === ORDER_STATES.PENDING_BILLING && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            o._id,
                            ORDER_ACTIONS.PAYMENT_OK,
                            o.status,
                          )
                        }
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Confirm Payment & Fulfill
                      </button>
                    )}

                    {o.status === ORDER_STATES.FULFILLED && (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Fulfilled
                      </span>
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
