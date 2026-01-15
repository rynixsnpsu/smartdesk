const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
      index: true
    },
    floor: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["classroom", "lab", "office", "hostel", "library", "meeting", "other"],
      required: true
    },
    capacity: {
      type: Number,
      default: 30
    },
    facilities: [String],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

roomSchema.index({ building: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
