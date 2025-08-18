const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

// Protect all user routes with authentication middleware
router.use(authMiddleware.protect);

// Get user profile
router.get("/profile", userController.getProfile);

// Update user profile
router.patch("/profile", userController.updateProfile);

// Get dashboard data
router.get("/dashboard", userController.getDashboardData);

// Legacy placeholder routes
router.get("/:id", userController.getUserById);

module.exports = router;
