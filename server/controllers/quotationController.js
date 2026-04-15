const Quotation = require("../models/Quotation");

// @desc    Create a new RFQ (Inventory Manager)
// @route   POST /api/quotations
const createRFQ = async (req, res) => {
  try {
    const { rfqId, partName, quantity } = req.body;
    const newRFQ = await Quotation.create({ rfqId, partName, quantity });
    res.status(201).json(newRFQ);
  } catch (error) {
    res.status(500).json({ message: "Failed to create RFQ." });
  }
};

// @desc    Get all Quotations (Supplier & Inventory Manager)
// @route   GET /api/quotations
const getQuotations = async (req, res) => {
  try {
    const quotes = await Quotation.find().sort({ createdAt: -1 });
    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quotations." });
  }
};

// @desc    Submit a Quote (Supplier)
// @route   PUT /api/quotations/:id
const submitQuote = async (req, res) => {
  try {
    const { pricePerUnit, expectedDelivery } = req.body;

    // Find the RFQ
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "RFQ not found" });

    // Update with Supplier details
    quote.pricePerUnit = pricePerUnit;
    quote.totalAmount = pricePerUnit * quote.quantity;
    quote.expectedDelivery = expectedDelivery;
    quote.status = "Quote Submitted";

    await quote.save();
    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit quote." });
  }
};

module.exports = { createRFQ, getQuotations, submitQuote };
