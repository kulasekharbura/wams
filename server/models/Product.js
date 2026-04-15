const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    productName: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    stockAvailable: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
