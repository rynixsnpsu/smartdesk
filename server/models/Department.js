const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
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
    description: String,
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    contactEmail: String,
    contactPhone: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
