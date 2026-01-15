/**
 * Comprehensive Features Controller
 * Handles 200+ university management features
 */

const Department = require("../models/Department");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const Building = require("../models/Building");
const Room = require("../models/Room");
const HostelRoom = require("../models/HostelRoom");
const HostelAllocation = require("../models/HostelAllocation");
const Book = require("../models/Book");
const BookIssue = require("../models/BookIssue");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const Fee = require("../models/Fee");
const Scholarship = require("../models/Scholarship");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Report = require("../models/Report");
const Settings = require("../models/Settings");
const Topic = require("../models/Topic");
const User = require("../models/User");

// ==================== DEPARTMENT MANAGEMENT ====================
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("head", "username email");
    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (err) {
    res.status(500).json({ error: "Failed to create department" });
  }
};

// ==================== COURSE MANAGEMENT ====================
exports.getAllCourses = async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } }
      ];
    }
    const courses = await Course.find(filter)
      .populate("department", "name code")
      .populate("instructor", "username email");
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ error: "Failed to create course" });
  }
};

// ==================== ENROLLMENT MANAGEMENT ====================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId, semester, academicYear } = req.body;
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      semester,
      academicYear
    });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolled: 1 } });
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: "Failed to enroll student" });
  }
};

exports.getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.params.studentId })
      .populate("course")
      .populate("student", "username email");
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

// ==================== ATTENDANCE MANAGEMENT ====================
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, students } = req.body; // students: [{studentId, status}]
    const records = await Promise.all(
      students.map((s) =>
        Attendance.findOneAndUpdate(
          { student: s.studentId, course: courseId, date },
          {
            student: s.studentId,
            course: courseId,
            date,
            status: s.status,
            markedBy: req.user.id
          },
          { upsert: true, new: true }
        )
      )
    );
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { studentId, courseId, startDate, endDate } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const attendance = await Attendance.find(filter)
      .populate("student", "username email")
      .populate("course", "name code");
    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// ==================== BUILDING & ROOM MANAGEMENT ====================
exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json({ buildings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch buildings" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { building, type, status } = req.query;
    const filter = {};
    if (building) filter.building = building;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const rooms = await Room.find(filter).populate("building", "name code");
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// ==================== HOSTEL MANAGEMENT ====================
exports.getAllHostelRooms = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const rooms = await HostelRoom.find(filter).populate("building", "name");
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hostel rooms" });
  }
};

exports.allocateHostel = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    const room = await HostelRoom.findById(roomId);
    if (room.occupied >= room.capacity) {
      return res.status(400).json({ error: "Room is full" });
    }
    const allocation = await HostelAllocation.create({
      student: studentId,
      room: roomId,
      roomNumber: room.roomNumber,
      allocatedBy: req.user.id
    });
    await HostelRoom.findByIdAndUpdate(roomId, { $inc: { occupied: 1 } });
    res.status(201).json({ success: true, allocation });
  } catch (err) {
    res.status(500).json({ error: "Failed to allocate hostel" });
  }
};

// ==================== LIBRARY MANAGEMENT ====================
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }
    if (category) filter.category = category;
    const books = await Book.find(filter);
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (book.availableCopies < 1) {
      return res.status(400).json({ error: "Book not available" });
    }
    const issue = await BookIssue.create({
      book: bookId,
      student: studentId,
      dueDate: new Date(dueDate),
      issuedBy: req.user.id
    });
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    res.status(201).json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ error: "Failed to issue book" });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await BookIssue.findById(issueId);
    if (!issue || issue.status === "returned") {
      return res.status(400).json({ error: "Invalid issue" });
    }
    const fine = issue.dueDate < new Date() ? Math.ceil((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24)) * 10 : 0;
    issue.status = "returned";
    issue.returnedAt = new Date();
    issue.fine = fine;
    await issue.save();
    await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });
    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ error: "Failed to return book" });
  }
};

// ==================== EVENT MANAGEMENT ====================
exports.getAllEvents = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.endDate = { $lte: new Date(endDate) };
    }
    const events = await Event.find(filter)
      .populate("organizer", "username email")
      .populate("department", "name");
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user.id });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
};

// ==================== ANNOUNCEMENT MANAGEMENT ====================
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { type, priority, targetAudience } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = targetAudience;
    const announcements = await Announcement.find(filter)
      .populate("publishedBy", "username email")
      .populate("department", "name")
      .sort({ publishedAt: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      publishedBy: req.user.id
    });
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};

// ==================== FEE MANAGEMENT ====================
exports.getAllFees = async (req, res) => {
  try {
    const { studentId, status, type } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    const fees = await Fee.find(filter).populate("student", "username email");
    res.json({ fees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fees" });
  }
};

exports.payFee = async (req, res) => {
  try {
    const { feeId, amount, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findById(feeId);
    fee.paidAmount += amount;
    if (fee.paidAmount >= fee.amount) {
      fee.status = "paid";
      fee.paidAt = new Date();
    } else {
      fee.status = "partial";
    }
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    await fee.save();
    res.json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// ==================== SCHOLARSHIP MANAGEMENT ====================
exports.getAllScholarships = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const scholarships = await Scholarship.find(filter);
    res.json({ scholarships });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scholarships" });
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
      readAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification" });
  }
};

// ==================== ANALYTICS & REPORTS ====================
exports.getComprehensiveStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      totalBooks,
      totalEvents,
      pendingFees,
      hostelOccupancy
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "admin", isActive: true }),
      Course.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Book.countDocuments({ isActive: true }),
      Event.countDocuments({ status: "upcoming" }),
      Fee.countDocuments({ status: "pending" }),
      HostelAllocation.countDocuments({ status: "active" })
    ]);

    res.json({
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalDepartments,
        totalBooks,
        totalEvents,
        pendingFees,
        hostelOccupancy
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// ==================== SETTINGS MANAGEMENT ====================
exports.getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const settings = await Settings.find(filter);
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    res.json({ settings: settingsObj });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user.id },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting });
  } catch (err) {
    res.status(500).json({ error: "Failed to update setting" });
  }
};
