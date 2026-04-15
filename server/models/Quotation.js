const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    rfqId: {
      type: String,
      required: true,
      unique: true,
    },
    partName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending Quote", "Quote Submitted", "Order Placed"],
      default: "Pending Quote",
    },
    // These fields will be filled out by the Supplier later
    pricePerUnit: {
      type: Number,
      default: null,
    },
    totalAmount: {
      type: Number,
      default: null,
    },
    expectedDelivery: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quotation", quotationSchema);
