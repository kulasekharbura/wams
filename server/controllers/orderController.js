const Order = require("../models/Order");

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

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status." });
  }
};

module.exports = {
  createOrder,
  getDealerOrders,
  getAllOrders,
  updateOrderStatus,
};
