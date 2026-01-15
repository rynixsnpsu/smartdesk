const mongoose = require("mongoose");

const hostelAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelRoom",
      required: true,
      index: true
    },
    roomNumber: String,
    allocatedAt: {
      type: Date,
      default: Date.now
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["active", "vacated", "transferred"],
      default: "active",
      index: true
    },
    vacatedAt: Date,
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelAllocation", hostelAllocationSchema);
