const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const topicController = require("../controllers/topic.controller");

// All routes require admin role
router.use(protect("admin"));

router.get("/api/topics", topicController.getAllTopics);
router.get("/api/topics/:id", topicController.getTopicById);
router.post("/api/topics", topicController.createTopic);
router.put("/api/topics/:id", topicController.updateTopic);
router.delete("/api/topics/:id", topicController.deleteTopic);

module.exports = router;
