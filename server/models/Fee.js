const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["tuition", "hostel", "library", "lab", "sports", "other"],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date,
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "waived"],
      default: "pending",
      index: true
    },
    semester: String,
    academicYear: String,
    paymentMethod: String,
    transactionId: String,
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
