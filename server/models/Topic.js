const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 1,
      min: 0
    },
    category: {
      type: String,
      enum: [
        "Academics",
        "Faculty",
        "Infrastructure",
        "Hostel",
        "Administration",
        "Other"
      ],
      default: "Other",
      index: true
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    }
  },
  { timestamps: true }
);

// Index for search
topicSchema.index({ topic: "text", description: "text" });

module.exports = mongoose.model("Topic", topicSchema);
