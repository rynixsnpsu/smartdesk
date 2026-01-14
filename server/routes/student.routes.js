const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

// DEBUG CHECK (temporary)
console.log("studentController:", studentController);

router.get(
  "/student",
  protect("student"),
  studentController.dashboard
);

router.post(
  "/student/feedback",
  protect("student"),
  studentController.submitFeedback
);

router.get(
  "/api/student/top-topics",
  protect("student"),
  studentController.topTopicsJson
);

module.exports = router;
