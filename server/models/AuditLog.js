const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    ip: {
      type: String,
      index: true
    },
    userAgent: String,
    details: String, // JSON stringified details
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
