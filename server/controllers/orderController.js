const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const { orderId, dealerId, productId, productName, quantity } = req.body;
    const newOrder = await Order.create({
      orderId,
      dealerId,
      productId,
      productName,
      quantity,
    });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to place order." });
  }
};

const getDealerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ dealerId: req.params.dealerId }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all orders." });
  }
};

// Unified Status Updater with Business Logic embedded
const updateOrderStatus = async (req, res) => {
  try {
    const { status, productId, quantity } = req.body;
    const orderId = req.params.id;

    // Phase 3 Step 5: Update product stock when production completes
    if (status === "ProductionCompleted" && productId && quantity) {
      const product = await Product.findOne({ productId });
      if (product) {
        product.stockAvailable += quantity;
        await product.save();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error });
  }
};

// Optional dedicated fulfillment endpoint if you wish to expand payment logic later
const fulfillOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "FulfilledOrder" },
      { new: true },
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Fulfillment failed" });
  }
};

module.exports = {
  createOrder,
  getDealerOrders,
  getAllOrders,
  updateOrderStatus,
  fulfillOrder,
};
