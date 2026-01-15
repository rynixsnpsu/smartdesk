const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: String,
    type: {
      type: String,
      enum: ["academic", "cultural", "sports", "workshop", "seminar", "conference", "other"],
      default: "other",
      index: true
    },
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true
    },
    location: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    maxAttendees: Number,
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
