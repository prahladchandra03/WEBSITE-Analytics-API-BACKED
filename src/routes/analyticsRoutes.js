const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticesController");
const authenticateApiKey = require("../middleware/authenticateApiKey");

// Event Data Collection
router.post(
  "/analytics/collect",
  authenticateApiKey,
  analyticsController.collectEvent
);

// Analytics Endpoints
router.get(
  "/analytics/event-summary",
  authenticateApiKey,
  analyticsController.getEventSummary
);
router.get(
  "/analytics/user-stats",
  authenticateApiKey,
  analyticsController.getUserStats
);

module.exports = router;
