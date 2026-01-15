const mongoose = require("mongoose");

const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnedAt: Date,
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "lost"],
      default: "issued",
      index: true
    },
    fine: {
      type: Number,
      default: 0
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookIssue", bookIssueSchema);
