import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const SupplierDashboard = () => {
  const { user, logout } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // --- 1. Fetch Real RFQs from MongoDB ---
  const fetchQuotations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/quotations");
      const data = await response.json();
      if (response.ok) setRfqs(data);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // --- 2. Submit Real Quote to Backend ---
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!selectedRfq) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/quotations/${selectedRfq._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pricePerUnit: parseFloat(pricePerUnit),
            expectedDelivery: deliveryDate,
          }),
        },
      );

      if (response.ok) {
        alert(`Quotation submitted successfully for ${selectedRfq.rfqId}!`);
        setSelectedRfq(null);
        setPricePerUnit("");
        setDeliveryDate("");
        fetchQuotations(); // Refresh the list
      } else {
        alert("Failed to submit quotation.");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Supplier Portal - Welcome, {user.username}</h2>
        <button
          onClick={logout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <hr />

      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        {/* Left Column: Pending RFQs */}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>Pending RFQs</h3>
          {rfqs.filter((r) => r.status === "Pending Quote").length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {rfqs
                .filter((r) => r.status === "Pending Quote")
                .map((rfq) => (
                  <li
                    key={rfq._id}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <strong>{rfq.rfqId}</strong>: {rfq.quantity}x {rfq.partName}
                    <br />
                    <button
                      onClick={() => setSelectedRfq(rfq)}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.4rem 0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Draft Quote
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Right Column: Submission Form */}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: selectedRfq ? "#f0f7ff" : "transparent",
          }}
        >
          <h3>Submit Quotation</h3>
          {!selectedRfq ? (
            <p>Select an RFQ to begin.</p>
          ) : (
            <form
              onSubmit={handleSubmitQuote}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <strong>Item:</strong> {selectedRfq.partName}
              </div>
              <div>
                <label>Price Per Unit ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div>
                <label>Delivery Date:</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "0.75rem",
                  cursor: "pointer",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Submit Official Quote
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom: History Table */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Submitted Quotations History</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "0.5rem" }}>RFQ ID</th>
              <th style={{ padding: "0.5rem" }}>Part</th>
              <th style={{ padding: "0.5rem" }}>Total Amount</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rfqs
              .filter((r) => r.status === "Quote Submitted")
              .map((rfq) => (
                <tr key={rfq._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{rfq.rfqId}</td>
                  <td style={{ padding: "0.5rem" }}>{rfq.partName}</td>
                  <td style={{ padding: "0.5rem" }}>
                    ${rfq.totalAmount?.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.5rem", color: "green" }}>
                    {rfq.status}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierDashboard;
