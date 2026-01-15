const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const configController = require("../controllers/config.controller");

router.use(protect("admin"));

router.get("/api/config", configController.getAllConfigs);
router.get("/api/config/category/:category", configController.getConfigByCategory);
router.put("/api/config", configController.updateConfig);
router.put("/api/config/bulk", configController.bulkUpdateConfigs);
router.delete("/api/config/:key", configController.resetConfig);

module.exports = router;
