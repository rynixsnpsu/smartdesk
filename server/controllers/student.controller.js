const Topic = require("../models/Topic");
const Course = require("../models/Course");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const BookIssue = require("../models/BookIssue");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const Enrollment = require("../models/Enrollment");
const { findSimilarTopic } = require("../ai/similarity");
const { classifyCategory } = require("../ai/category");

/**
 * Get student dashboard data
 */
exports.dashboard = (req, res) => {
  res.json({ ok: true, role: req.user?.role || null, user: req.user });
};

/**
 * Submit feedback (non-blocking AI)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { topic, description } = req.body;

    if (!topic || !description) {
      return res.status(400).json({ error: "Topic and description required" });
    }

    // Save to DB first (non-blocking)
    const existingTopics = await Topic.find({}, "topic");
    const topicNames = existingTopics.map((t) => t.topic);

    let similarity = { matched: false };
    let category = "Other";

    // Try AI similarity check (non-blocking, fallback on error)
    try {
      similarity = await findSimilarTopic(topic, topicNames);
    } catch (err) {
      console.error("Similarity check failed, using fallback:", err);
    }

    if (similarity.matched && similarity.matchedTopic) {
      await Topic.findOneAndUpdate(
        { topic: similarity.matchedTopic },
        { $inc: { votes: 1 } }
      );
      return res.json({
        message: "Feedback submitted successfully (merged with existing topic)",
        topic: similarity.matchedTopic,
        merged: true,
      });
    }

    // Try AI category classification (non-blocking, fallback on error)
    try {
      category = await classifyCategory(topic, description);
    } catch (err) {
      console.error("Category classification failed, using fallback:", err);
      // Fallback: simple keyword matching
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes("professor") || lowerDesc.includes("teacher") || lowerDesc.includes("faculty")) {
        category = "Faculty";
      } else if (lowerDesc.includes("wifi") || lowerDesc.includes("internet") || lowerDesc.includes("network")) {
        category = "Infrastructure";
      } else if (lowerDesc.includes("hostel") || lowerDesc.includes("dorm") || lowerDesc.includes("room")) {
        category = "Hostel";
      } else if (lowerDesc.includes("course") || lowerDesc.includes("class") || lowerDesc.includes("exam")) {
        category = "Academics";
      }
    }

    // Create new topic
    const newTopic = await Topic.create({
      topic,
      description,
      category,
      votes: 1,
      createdBy: req.user.id,
    });

    res.json({
      message: "Feedback submitted successfully",
      topic: newTopic.topic,
      category: newTopic.category,
      merged: false,
    });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

/**
 * Get top topics
 */
exports.topTopicsJson = async (req, res) => {
  try {
    const topTopics = await Topic.find({})
      .sort({ votes: -1 })
      .limit(10)
      .select("topic category votes");

    res.json({ topTopics });
  } catch (err) {
    console.error("Top topics error:", err);
    res.status(500).json({ error: "Failed to fetch top topics" });
  }
};

/**
 * Get student courses
 */
exports.getCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "name code credits")
      .populate("course.instructor", "username email")
      .select("-__v");

    res.json({ enrollments });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/**
 * Get student attendance
 */
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id })
      .populate("course", "name code")
      .sort({ date: -1 })
      .select("-__v");

    res.json({ attendance });
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

/**
 * Get student fees
 */
exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.user.id })
      .sort({ dueDate: 1 })
      .select("-__v");

    res.json({ fees });
  } catch (err) {
    console.error("Get fees error:", err);
    res.status(500).json({ error: "Failed to fetch fees" });
  }
};

/**
 * Get student library books
 */
exports.getLibrary = async (req, res) => {
  try {
    const issues = await BookIssue.find({ student: req.user.id })
      .populate("book", "title author isbn")
      .sort({ issueDate: -1 })
      .select("-__v");

    res.json({ issues });
  } catch (err) {
    console.error("Get library error:", err);
    res.status(500).json({ error: "Failed to fetch library books" });
  }
};

/**
 * Get student events
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { status: "upcoming" },
        { status: "ongoing" }
      ]
    })
      .sort({ startDate: 1 })
      .limit(20)
      .select("-__v");

    res.json({ events });
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/**
 * Get student announcements
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      publishedAt: { $lte: new Date() }
    })
      .sort({ publishedAt: -1 })
      .limit(20)
      .select("-__v");

    res.json({ announcements });
  } catch (err) {
    console.error("Get announcements error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};
