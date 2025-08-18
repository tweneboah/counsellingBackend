const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");

// Protect routes - authentication check
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    let currentUser;
    if (decoded.role === "student") {
      currentUser = await Student.findById(decoded.id);
    } else {
      currentUser = await Counselor.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "This user account has been deactivated",
      });
    }

    // Grant access to protected route
    req.user = {
      id: currentUser._id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Your token has expired. Please log in again.",
      });
    }
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Restrict to certain roles - more robust version
exports.restrictTo = function () {
  const roles = Array.from(arguments);
  return function (req, res, next) {
    // Ensure req.user and req.user.role exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// Check consent for students
exports.checkConsent = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return next();
    }

    const student = await Student.findById(req.user.id);

    if (!student.consentGiven) {
      return res.status(403).json({
        status: "fail",
        message: "You must provide consent before using this service",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
