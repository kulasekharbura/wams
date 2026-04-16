const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Product = require("./models/Product");
const Quotation = require("./models/Quotation");
const Order = require("./models/Order"); // Added Order model to clear old orders

const seedDatabase = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wams_db";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Database for seeding...");

    // 1. CLEAR ALL EXISTING DATA
    await User.deleteMany();
    await Product.deleteMany();
    await Quotation.deleteMany();
    await Order.deleteMany();
    console.log("Cleared old data (Users, Products, Quotations, Orders).");

    // 2. SEED USERS (Added Management Authority and an extra Dealer)
    await User.insertMany([
      {
        username: "admin",
        password: "password123",
        email: "admin@wams.com",
        phone: "555-0100",
        role: "Administrator",
      },
      {
        username: "dealer1",
        password: "password123",
        email: "dealer1@wams.com",
        phone: "555-0101",
        role: "Dealer",
      },
      {
        username: "dealer2",
        password: "password123",
        email: "dealer2@wams.com",
        phone: "555-0102",
        role: "Dealer",
      },
      {
        username: "inventory1",
        password: "password123",
        email: "inventory@wams.com",
        phone: "555-0103",
        role: "Inventory Manager",
      },
      {
        username: "supplier1",
        password: "password123",
        email: "supplier@wams.com",
        phone: "555-0104",
        role: "Supplier",
      },
      {
        username: "mgmt1",
        password: "password123",
        email: "mgmt@wams.com",
        phone: "555-0105",
        role: "Management Authority",
      },
    ]);

    // 3. SEED PRODUCTS (Varied stock levels to test different flows)
    await Product.insertMany([
      {
        productId: "P001",
        productName: "Industrial Motor v2",
        unitPrice: 450.0,
        stockAvailable: 150, // High stock - will go straight to Billing
      },
      {
        productId: "P002",
        productName: "Conveyor Belt Controller",
        unitPrice: 120.5,
        stockAvailable: 0, // Zero stock - will force "PartChecking" / RFQ flow
      },
      {
        productId: "P003",
        productName: "Hydraulic Press Valve",
        unitPrice: 85.0,
        stockAvailable: 5, // Low stock - ordering > 5 will trigger RFQ flow
      },
      {
        productId: "P004",
        productName: "Automated Robotic Arm",
        unitPrice: 2500.0,
        stockAvailable: 12, // Medium stock
      },
      {
        productId: "P005",
        productName: "Proximity Sensor Pack",
        unitPrice: 45.0,
        stockAvailable: 300, // Very high stock
      },
    ]);

    // 4. SEED INITIAL RFQ (Status set exactly to "Pending" to show in Supplier Dashboard)
    await Quotation.create({
      rfqId: "RFQ-SAMPLE-999",
      partName: "Raw Materials for Conveyor Belt Controller",
      quantity: 50,
      status: "Pending Quote",
    });

    console.log(
      "Successfully injected fresh test users, diverse products, and an initial RFQ!",
    );
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
