const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    type: {
      type: String,
      enum: ["academic", "hostel", "library", "administrative", "recreational", "other"],
      required: true
    },
    address: String,
    floors: {
      type: Number,
      default: 1
    },
    facilities: [String],
    capacity: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Building", buildingSchema);
