const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const mgmtRoutes = require("./routes/mgmtRoutes");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://YOUR-VERCEL-URL.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/mgmt", mgmtRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "WAMS Backend is operational",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wams_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("-----------------------------------------");
    console.log("Successfully connected to MongoDB.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("-----------------------------------------");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
