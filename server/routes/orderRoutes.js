const express = require("express");
const router = express.Router();
const {
  createOrder,
  getDealerOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/dealer/:dealerId", getDealerOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
