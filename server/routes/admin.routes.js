const express = require("express");
const router = express.Router();
const { protectAdmin, rateLimit, securityHeaders } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");
const insightsController = require("../controllers/insights.controller");

// Apply security headers to all routes
router.use(securityHeaders);

// Apply rate limiting (stricter for admin)
router.use(rateLimit);

// All routes require admin role - STRICT AUTHENTICATION
router.use(protectAdmin);

// Analytics routes
router.get("/api/admin/analytics", adminController.analyticsJson);
router.get("/api/admin/stats", adminController.getDashboardStats);
router.get("/api/admin/insights", insightsController.getInsights);

module.exports = router;
