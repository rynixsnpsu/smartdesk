const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["general", "academic", "hostel", "library", "event", "urgent"],
      default: "general",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "faculty", "admin", "specific"],
      default: "all"
    },
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    attachments: [String],
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
