import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
// We no longer need ORDER_STATES here; the backend schema handles the default state!

const DealerDashboard = () => {
  const { user, logout } = useAuth();

  const availableProducts = [
    { id: "P001", name: "Industrial Motor v2", price: 450.0 },
    { id: "P002", name: "Conveyor Belt Controller", price: 120.5 },
    { id: "P003", name: "Hydraulic Press Valve", price: 85.0 },
  ];

  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(
    availableProducts[0].id,
  );
  const [quantity, setQuantity] = useState(1);

  // --- NEW: Fetch real orders on load ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/dealer/${user._id}`,
        );
        const data = await response.json();
        if (response.ok) setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    if (user && user._id) {
      fetchOrders();
    }
  }, [user]);

  // --- UPDATE: Post real order to backend ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const productDetails = availableProducts.find(
      (p) => p.id === selectedProduct,
    );

    const newOrderPayload = {
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      dealerId: user._id, // Send the actual database ID of the user
      productId: productDetails.id,
      productName: productDetails.name,
      quantity: parseInt(quantity),
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrderPayload),
      });

      const savedOrder = await response.json();

      if (response.ok) {
        // Update the UI with the real order returned from MongoDB
        setOrders([savedOrder, ...orders]);
        setQuantity(1);
        alert(`Order ${savedOrder.orderId} placed and saved to database!`);
      } else {
        alert(savedOrder.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Could not connect to server.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Dealer Portal - Welcome, {user.username}</h2>
        <button
          onClick={logout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <hr />

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Place New Product Request</h3>
        <form
          onSubmit={handlePlaceOrder}
          style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label>Select Product:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ padding: "0.5rem" }}
            >
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", width: "100px" }}
          >
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: "0.5rem" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              height: "37px",
            }}
          >
            Submit Order
          </button>
        </form>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>My Orders Status</h3>
        {orders.length === 0 ? (
          <p>No orders placed yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "0.5rem" }}>Order ID</th>
                <th style={{ padding: "0.5rem" }}>Date</th>
                <th style={{ padding: "0.5rem" }}>Product</th>
                <th style={{ padding: "0.5rem" }}>Qty</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id || order.orderId}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "0.5rem" }}>{order.orderId}</td>
                  {/* Format the MongoDB timestamp */}
                  <td style={{ padding: "0.5rem" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{order.productName}</td>
                  <td style={{ padding: "0.5rem" }}>{order.quantity}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor:
                          order.status === "UnprocessedOrder"
                            ? "#fff3cd"
                            : "#d4edda",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;
