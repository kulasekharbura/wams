import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const DealerDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // New Order Form State
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const fetchData = async () => {
    try {
      // Fetch available products catalog
      const prodRes = await fetch("http://localhost:5000/api/products");
      if (prodRes.ok) setProducts(await prodRes.json());

      // Fetch ONLY this dealer's orders
      const ordRes = await fetch(
        `http://localhost:5000/api/orders/dealer/${user._id}`,
      );
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert("Please select a product");

    const productDetails = products.find(
      (p) => p.productId === selectedProduct,
    );

    const newOrder = {
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      dealerId: user._id,
      productId: productDetails.productId,
      productName: productDetails.productName,
      quantity: parseInt(quantity),
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        alert("Order placed successfully!");
        setSelectedProduct("");
        setQuantity(1);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  const handleCancelOrder = async (mongoId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      // We can reuse the status update endpoint to move it to a 'Cancelled' state or delete it
      const res = await fetch(
        `http://localhost:5000/api/orders/${mongoId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Cancelled" }),
        },
      );
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to cancel order:", error);
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
        <h2>Dealer Portal - {user.username}</h2>
        <button onClick={logout} style={{ padding: "0.5rem 1rem" }}>
          Logout
        </button>
      </div>
      <hr />

      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        {/* --- New Order Form --- */}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            height: "fit-content",
          }}
        >
          <h3>Place New Order</h3>
          <form
            onSubmit={handlePlaceOrder}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label>Select Product:</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <option value="">-- Choose a Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "0.75rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Submit Order
            </button>
          </form>
        </div>

        {/* --- Order History & Tracking --- */}
        <div
          style={{
            flex: 2,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>My Orders</h3>
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
                <th>Qty</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: "1rem", textAlign: "center" }}
                  >
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>{o.orderId}</td>
                    <td>{o.productName}</td>
                    <td>{o.quantity}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor:
                            o.status === "FulfilledOrder"
                              ? "#d4edda"
                              : "#e9ecef",
                          color:
                            o.status === "FulfilledOrder" ? "#155724" : "black",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {/* Phase 3 Step 1: Dealer maintains ability to cancel only at UnprocessedOrder phase */}
                      {o.status === "UnprocessedOrder" ? (
                        <button
                          onClick={() => handleCancelOrder(o._id)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;
