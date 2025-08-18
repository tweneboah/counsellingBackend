const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Appointment title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    duration: {
      type: Number, // Duration in minutes
      default: 60,
    },
    type: {
      type: String,
      enum: ["In-Person", "Zoom", "Phone"],
      required: [true, "Appointment type is required"],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled", "No-Show"],
      default: "Scheduled",
    },
    reason: {
      type: String,
      enum: ["Academic", "Personal", "Emotional", "Career", "Other"],
      required: [true, "Reason for appointment is required"],
    },
    zoomLink: {
      type: String,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
