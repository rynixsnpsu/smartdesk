const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    author: {
      type: String,
      required: true,
      index: true
    },
    publisher: String,
    publicationYear: Number,
    category: {
      type: String,
      index: true
    },
    totalCopies: {
      type: Number,
      default: 1,
      min: 1
    },
    availableCopies: {
      type: Number,
      default: 1
    },
    location: String,
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
