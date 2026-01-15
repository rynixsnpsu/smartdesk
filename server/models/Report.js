const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["analytics", "academic", "financial", "attendance", "custom"],
      required: true,
      index: true
    },
    description: String,
    filters: mongoose.Schema.Types.Mixed,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    filePath: String,
    format: {
      type: String,
      enum: ["pdf", "excel", "csv", "json"],
      default: "pdf"
    },
    status: {
      type: String,
      enum: ["pending", "generating", "completed", "failed"],
      default: "pending"
    },
    expiresAt: Date,
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
