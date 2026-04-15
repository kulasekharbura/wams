const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// --- 1. Import All Routes ---
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const mgmtRoutes = require("./routes/mgmtRoutes"); // NEW: Management Authority

// --- 2. Middleware ---
app.use(cors()); // Allows your Vite frontend (port 5173) to communicate with this server
app.use(express.json()); // Allows parsing of JSON data from frontend requests

// --- 3. Mount Routes to API Paths ---
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/mgmt", mgmtRoutes); // NEW: Management Authority path

// --- 4. System Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "WAMS Backend is operational",
    timestamp: new Date().toISOString(),
  });
});

// --- 5. Database Connection & Server Startup ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wams_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("-----------------------------------------");
    console.log("✅ Successfully connected to MongoDB.");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("-----------------------------------------");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
