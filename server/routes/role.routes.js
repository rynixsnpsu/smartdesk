const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const roleController = require("../controllers/role.controller");

router.get("/api/roles", protect(), roleController.getRoles);
router.get("/api/permissions", protect(), roleController.getUserPermissions);
router.put("/api/users/:userId/role", protect("admin"), roleController.updateUserRole);

module.exports = router;
