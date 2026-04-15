const express = require("express");
const router = express.Router();
const {
  createRFQ,
  getQuotations,
  submitQuote,
} = require("../controllers/quotationController");

router.post("/", createRFQ);
router.get("/", getQuotations);
router.put("/:id", submitQuote);

module.exports = router;
