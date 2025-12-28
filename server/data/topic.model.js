const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 1
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
      default: "Other"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
