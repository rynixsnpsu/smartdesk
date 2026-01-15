const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const featuresController = require("../controllers/features.controller");

// All routes require authentication
router.use(protect());

// Departments
router.get("/api/departments", featuresController.getAllDepartments);
router.post("/api/departments", protect("admin"), featuresController.createDepartment);

// Courses
router.get("/api/courses", featuresController.getAllCourses);
router.post("/api/courses", protect("admin"), featuresController.createCourse);

// Enrollments
router.post("/api/enrollments", protect("admin"), featuresController.enrollStudent);
router.get("/api/enrollments/student/:studentId", featuresController.getStudentEnrollments);
router.get("/api/enrollments/student/me", protect(), async (req, res) => {
  req.params.studentId = req.user.id;
  featuresController.getStudentEnrollments(req, res);
});

// Attendance
router.post("/api/attendance", protect("admin"), featuresController.markAttendance);
router.get("/api/attendance", featuresController.getAttendanceReport);
// Student can view own attendance
router.get("/api/attendance/me", protect(), async (req, res) => {
  req.query.studentId = req.user.id;
  featuresController.getAttendanceReport(req, res);
});

// Buildings & Rooms
router.get("/api/buildings", featuresController.getAllBuildings);
router.get("/api/rooms", featuresController.getAllRooms);

// Hostel
router.get("/api/hostel/rooms", featuresController.getAllHostelRooms);
router.post("/api/hostel/allocate", protect("admin"), featuresController.allocateHostel);

// Library
router.get("/api/library/books", featuresController.getAllBooks);
router.post("/api/library/issue", protect("admin"), featuresController.issueBook);
router.post("/api/library/return/:issueId", protect("admin"), featuresController.returnBook);
// Student can view own issued books
router.get("/api/library/books/me", protect(), async (req, res) => {
  const issues = await require("../models/BookIssue").find({ student: req.user.id, status: "issued" })
    .populate("book");
  res.json({ books: issues });
});

// Events
router.get("/api/events", featuresController.getAllEvents);
router.post("/api/events", protect("admin"), featuresController.createEvent);

// Announcements (POST, PUT, DELETE require admin auth)
router.post("/api/announcements", protect("admin"), featuresController.createAnnouncement);
router.put("/api/announcements/:id", protect("admin"), featuresController.updateAnnouncement);
router.delete("/api/announcements/:id", protect("admin"), featuresController.deleteAnnouncement);

// Fees
router.get("/api/fees", featuresController.getAllFees);
router.post("/api/fees/pay", featuresController.payFee);
// Student can view own fees
router.get("/api/fees/me", protect(), async (req, res) => {
  req.query.studentId = req.user.id;
  featuresController.getAllFees(req, res);
});

// Scholarships
router.get("/api/scholarships", featuresController.getAllScholarships);

// Notifications
router.get("/api/notifications", featuresController.getUserNotifications);
router.put("/api/notifications/:id/read", featuresController.markNotificationRead);

// Analytics
router.get("/api/stats/comprehensive", protect("admin"), featuresController.getComprehensiveStats);

// Settings
router.get("/api/settings", featuresController.getSettings);
router.put("/api/settings", protect("admin"), featuresController.updateSetting);

module.exports = router;
