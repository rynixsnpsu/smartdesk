const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    description: String,
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ["merit", "need-based", "sports", "cultural", "research", "other"],
      default: "merit",
      index: true
    },
    eligibilityCriteria: String,
    applicationDeadline: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["open", "closed", "awarded"],
      default: "open",
      index: true
    },
    maxRecipients: Number,
    currentRecipients: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);
