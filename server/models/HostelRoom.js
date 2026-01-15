const mongoose = require("mongoose");

const hostelRoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true
    },
    floor: Number,
    capacity: {
      type: Number,
      default: 2,
      min: 1,
      max: 4
    },
    occupied: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ["single", "double", "triple", "quad"],
      default: "double"
    },
    facilities: [String],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
      index: true
    },
    rent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelRoom", hostelRoomSchema);
