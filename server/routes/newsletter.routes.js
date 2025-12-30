const express = require("express");
const router = express.Router();

const newsletterController = require("../controllers/newsletter.controller");

// POST: subscribe email
router.post("/post", newsletterController.subscribe);

module.exports = router;
