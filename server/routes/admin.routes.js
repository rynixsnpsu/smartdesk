const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/admin", protect("admin"), adminController.dashboard);

module.exports = router;
