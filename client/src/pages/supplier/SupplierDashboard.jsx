import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState({}); // Store input values for quotes

  const fetchRFQs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/quotations");
      if (res.ok) {
        const data = await res.json();
        // FIXED: Filter specifically for "Pending Quote" to match the database schema
        setRfqs(data.filter((q) => q.status === "Pending Quote"));
      }
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleQuoteChange = (rfqId, value) => {
    setQuotes({ ...quotes, [rfqId]: value });
  };

  const handleSubmitQuote = async (rfqId, mongoId) => {
    const price = quotes[rfqId];
    if (!price || isNaN(price) || price <= 0)
      return alert("Please enter a valid price amount.");

    try {
      const res = await fetch(
        `http://localhost:5000/api/quotations/${mongoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Quote Submitted", // Updates to the next stage in the schema
            pricePerUnit: parseFloat(price),
          }),
        },
      );

      if (res.ok) {
        alert("Quotation submitted to Management for approval.");
        setQuotes({ ...quotes, [rfqId]: "" });
        fetchRFQs(); // Remove from pending list
      }
    } catch (error) {
      console.error("Failed to submit quote:", error);
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
        <h2>Supplier Portal - {user.username}</h2>
        <button onClick={logout} style={{ padding: "0.5rem 1rem" }}>
          Logout
        </button>
      </div>
      <p style={{ color: "#666" }}>
        Review Requests for Quotation (RFQs) and submit your pricing.
      </p>
      <hr />

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Pending RFQs</h3>
        <table
          style={{
            width: "100%",
            textAlign: "left",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "0.5rem" }}>RFQ ID</th>
              <th>Requested Part</th>
              <th>Quantity Required</th>
              <th>Your Quote ($)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: "1rem", textAlign: "center" }}
                >
                  No pending RFQs at this time.
                </td>
              </tr>
            ) : (
              rfqs.map((rfq) => (
                <tr key={rfq._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem", fontWeight: "bold" }}>
                    {rfq.rfqId}
                  </td>
                  <td>{rfq.partName}</td>
                  <td>{rfq.quantity} units</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter price..."
                      value={quotes[rfq.rfqId] || ""}
                      onChange={(e) =>
                        handleQuoteChange(rfq.rfqId, e.target.value)
                      }
                      style={{
                        padding: "0.4rem",
                        width: "120px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleSubmitQuote(rfq.rfqId, rfq._id)}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Submit Quote
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierDashboard;
