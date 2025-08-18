const express = require("express");
const studentController = require("../controllers/student.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Profile routes
router.get("/profile", studentController.getProfile);
router.patch("/profile", studentController.updateProfile);

// Warning routes
router.get("/warnings", studentController.getMyWarnings);
router.patch("/warnings/:warningId/acknowledge", studentController.acknowledgeWarning);

module.exports = router; 