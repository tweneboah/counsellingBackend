const express = require("express");
const appointmentController = require("../controllers/appointment.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all appointment routes
router.use(authMiddleware.protect);

// Public endpoint for getting available counselors (accessible to students)
router.get(
  "/available-counselors",
  appointmentController.getAvailableCounselors
);

// Routes for students
router.post(
  "/",
  authMiddleware.restrictTo("student"),
  appointmentController.createAppointment
);
router.get(
  "/student",
  authMiddleware.restrictTo("student"),
  appointmentController.getStudentAppointments
);

// Routes for counselors
router.get(
  "/counselor",
  authMiddleware.restrictTo("counselor", "admin"),
  appointmentController.getCounselorAppointments
);

// Get available time slots for a counselor
router.get(
  "/counselor/:id/timeslots",
  appointmentController.getCounselorTimeSlots
);

// Routes for both (with appropriate access control)
router.get("/:id", appointmentController.getAppointmentById);
router.patch("/:id", appointmentController.updateAppointment);
router.patch("/:id/cancel", appointmentController.cancelAppointment);

module.exports = router;
