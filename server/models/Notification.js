const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "announcement"],
      default: "info",
      index: true
    },
    category: {
      type: String,
      enum: ["academic", "hostel", "library", "fee", "event", "general"],
      default: "general"
    },
    link: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
