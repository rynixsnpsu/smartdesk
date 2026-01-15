const express = require("express");
const router = express.Router();
const { protectStudent, rateLimit, securityHeaders } = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

// Apply security headers to all routes
router.use(securityHeaders);

// Apply rate limiting
router.use(rateLimit);

// All student routes require student authentication
router.use(protectStudent);

// Student dashboard
router.get("/student", studentController.dashboard);

// Submit feedback
router.post("/student/feedback", studentController.submitFeedback);

// Get top topics
router.get("/api/student/top-topics", studentController.topTopicsJson);

// Student courses
router.get("/api/student/courses", studentController.getCourses);

// Student attendance
router.get("/api/student/attendance", studentController.getAttendance);

// Student fees
router.get("/api/student/fees", studentController.getFees);

// Student library
router.get("/api/student/library", studentController.getLibrary);

// Student events
router.get("/api/student/events", studentController.getEvents);

// Student announcements (public - no auth required)
router.get("/api/student/announcements", studentController.getAnnouncements);

module.exports = router;
