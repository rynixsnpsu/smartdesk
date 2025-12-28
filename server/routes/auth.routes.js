const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimit.middleware");
const authController = require("../controllers/auth.controller");

router.post("/login", loginLimiter, authController.login);

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.redirect("/login");
});

module.exports = router;
