const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        "Administrator",
        "Inventory Manager",
        "Dealer",
        "Management Authority",
        "Supplier",
      ],
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true },
); // Automatically creates createdAt and updatedAt fields

module.exports = mongoose.model("User", userSchema);
