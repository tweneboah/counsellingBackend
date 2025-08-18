const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Authentication routes
router.post("/register/student", authController.registerStudent);
router.post(
  "/register/counselor",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  authController.registerCounselor
);
router.post("/register/admin", authController.registerAdmin);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/validate-reset-token", authController.validateResetToken);
router.post(
  "/change-password",
  authMiddleware.protect,
  authController.changePassword
);
router.post("/logout", authController.logout);

module.exports = router;
