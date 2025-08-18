const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);

// Restrict to admin and counselor
router.use(authMiddleware.restrictTo("admin", "counselor"));

// Dashboard analytics
router.get("/dashboard", adminController.getDashboardAnalytics);

// Student management routes
router.get("/students", adminController.getAllStudents);
router.get("/students/:id", adminController.getStudentById);
router.patch(
  "/students/:id",
  authMiddleware.restrictTo("admin"),
  adminController.updateStudent
);
router.patch(
  "/students/:id/status",
  authMiddleware.restrictTo("admin"),
  adminController.toggleStudentStatus
);

// Counselor management routes
router.get("/counselors", adminController.getAllCounselors);
router.patch(
  "/counselors/:id",
  authMiddleware.restrictTo("admin"),
  adminController.updateCounselor
);
router.patch(
  "/counselors/:id/status",
  authMiddleware.restrictTo("admin"),
  adminController.toggleCounselorStatus
);



// Chat sessions management
router.get("/chat-sessions", adminController.getChatSessions);
router.get("/chat-sessions/:id/history", adminController.getChatHistory);
router.get("/chat-sessions/:id/export", adminController.exportChatHistory);

// Journal management
router.get("/journals", adminController.getAllJournals);

// Warning management
router.get("/students/:studentId/warnings", adminController.getStudentWarnings);
router.get("/warnings/stats", adminController.getWarningStats);

module.exports = router;
