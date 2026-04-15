const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId, // Links to the User who placed it
      ref: "User",
      required: true,
    },
    productId: {
      type: String, // In a full build, this would link to a Product schema
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "UnprocessedOrder",
        "StockChecking",
        "PartChecking",
        "PendingParts",
        "InProduction",
        "ProductionCompleted",
        "PendingBilling",
        "FulfilledOrder",
      ],
      default: "UnprocessedOrder", // Every order starts here
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
