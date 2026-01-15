const express = require("express");
const router = express.Router();
const { rateLimit, securityHeaders, optionalAuth, protect } = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

// Apply security headers
router.use(securityHeaders);

// Login route with rate limiting
router.post("/login", rateLimit, authController.login);

// Logout route
router.get("/logout", optionalAuth, authController.logout);
router.post("/logout", optionalAuth, authController.logout);

// Get current user (requires authentication)
router.get("/api/auth/me", protect(), authController.getMe);

// Change password (requires authentication)
router.post("/api/auth/change-password", protect(), authController.changePassword);

// Refresh token
router.post("/api/auth/refresh", authController.refreshToken);

module.exports = router;
