const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    value: mongoose.Schema.Types.Mixed,
    category: {
      type: String,
      enum: ["academic", "financial", "hostel", "library", "general", "ai"],
      default: "general"
    },
    description: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
