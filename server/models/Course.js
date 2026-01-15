const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    capacity: {
      type: Number,
      default: 50
    },
    enrolled: {
      type: Number,
      default: 0
    },
    schedule: {
      day: String,
      time: String,
      room: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
