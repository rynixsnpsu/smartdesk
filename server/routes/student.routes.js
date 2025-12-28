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

module.exports = router;
