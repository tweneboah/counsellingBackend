const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Journal title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Journal content is required"],
    },
    mood: {
      type: String,
      enum: [
        "Happy",
        "Sad",
        "Anxious",
        "Calm",
        "Stressed",
        "Angry",
        "Confused",
        "Neutral",
        "Other",
      ],
      default: "Neutral",
    },
    tags: {
      type: [String],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    isAnonymized: {
      type: Boolean,
      default: false,
    },
    aiAnalysis: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Journal = mongoose.model("Journal", journalSchema);

module.exports = Journal;
