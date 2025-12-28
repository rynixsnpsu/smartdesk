const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try later."
});

exports.feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30
});
