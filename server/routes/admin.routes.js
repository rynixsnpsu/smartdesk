const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");
const insightsController = require("../controllers/insights.controller");

router.get("/admin", protect("admin"), adminController.dashboard);
router.get(
  "/api/admin/analytics",
  protect("admin"),
  adminController.analyticsJson
);

router.get(
  "/api/admin/insights",
  protect("admin"),
  insightsController.insightsJson
);

module.exports = router;
