const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Get System-wide Statistics
// @route   GET /api/mgmt/stats
const getSystemStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const products = await Product.find();

    // Calculate total items currently in the system
    const totalInventory = products.reduce(
      (sum, p) => sum + p.stockAvailable,
      0,
    );

    // Count how many orders are stuck in "PartChecking" (Production)
    const productionBacklog = await Order.countDocuments({
      status: "PartChecking",
    });

    res.status(200).json({
      totalOrders,
      totalInventory,
      productionBacklog,
      lowStockAlerts: products.filter((p) => p.stockAvailable < 10).length,
      productSummary: products.map((p) => ({
        name: p.productName,
        stock: p.stockAvailable,
      })),
    });
  } catch (error) {
    console.error("Mgmt Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch management stats." });
  }
};

module.exports = { getSystemStats };
