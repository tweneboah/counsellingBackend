const Student = require("../models/student.model");
const WarningService = require("../services/warning.service");

// Get student warnings
exports.getMyWarnings = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await WarningService.getStudentWarnings(studentId, page, limit);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Acknowledge a warning
exports.acknowledgeWarning = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { warningId } = req.params;

    const result = await WarningService.acknowledgeWarning(studentId, warningId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const student = await Student.findById(studentId).select("-password");
    
    if (!student) {
      return res.status(404).json({
        status: "fail",
        message: "Student not found",
      });
    }

    // Get warning count
    const unacknowledgedWarnings = student.warnings.filter(w => !w.acknowledged).length;

    res.status(200).json({
      status: "success",
      data: {
        student: {
          ...student.toObject(),
          unacknowledgedWarnings,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.studentId;
    delete updates.warnings;

    const student = await Student.findByIdAndUpdate(
      studentId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        status: "fail",
        message: "Student not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}; 