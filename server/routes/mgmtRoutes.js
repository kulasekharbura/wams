const express = require("express");
const router = express.Router();

// Import the controller logic
const { getSystemStats } = require("../controllers/mgmtController");

/**
 * @route   GET /api/mgmt/stats
 * @desc    Get high-level system analytics for Management Authority
 * @access  Private (In a full build, you would add middleware here to check roles)
 */
router.get("/stats", getSystemStats);

// Export the router to be used in server.js
module.exports = router;
