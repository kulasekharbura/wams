const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Product = require("./models/Product");
const Quotation = require("./models/Quotation"); // Added this

const seedDatabase = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wams_db";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Database for seeding...");

    await User.deleteMany();
    await Product.deleteMany();
    await Quotation.deleteMany(); // Clear old quotes
    console.log("Cleared old data.");

    // Seed Users
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
        email: "dealer@wams.com",
        phone: "555-0101",
        role: "Dealer",
      },
      {
        username: "inventory1",
        password: "password123",
        email: "inventory@wams.com",
        phone: "555-0102",
        role: "Inventory Manager",
      },
      {
        username: "supplier1",
        password: "password123",
        email: "supplier@wams.com",
        phone: "555-0103",
        role: "Supplier",
      },
    ]);

    // Seed Products
    await Product.insertMany([
      {
        productId: "P001",
        productName: "Industrial Motor v2",
        unitPrice: 450.0,
        stockAvailable: 50,
      },
      {
        productId: "P002",
        productName: "Conveyor Belt Controller",
        unitPrice: 120.5,
        stockAvailable: 0,
      },
      {
        productId: "P003",
        productName: "Hydraulic Press Valve",
        unitPrice: 85.0,
        stockAvailable: 15,
      },
    ]);

    // Seed an initial RFQ so the Supplier Dashboard has data
    await Quotation.create({
      rfqId: "RFQ-SAMPLE-001",
      partName: "Conveyor Sensors & Logic Boards",
      quantity: 10,
      status: "Pending Quote",
    });

    console.log("Successfully injected test users, products, and initial RFQ!");
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
