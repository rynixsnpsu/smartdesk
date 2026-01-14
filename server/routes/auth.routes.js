const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimit.middleware");
const authController = require("../controllers/auth.controller");

router.post("/login", loginLimiter, authController.login);

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
  });

  const accept = String(req.headers.accept || "");
  if (accept.includes("application/json") || req.path.startsWith("/api")) {
    return res.json({ ok: true });
  }

  res.redirect("/login");
});

module.exports = router;
