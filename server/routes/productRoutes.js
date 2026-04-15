const express = require("express");
const router = express.Router();
const {
  getProducts,
  updateProductStock,
} = require("../controllers/productController");

router.get("/", getProducts);
router.put("/:productId/stock", updateProductStock);

module.exports = router;
