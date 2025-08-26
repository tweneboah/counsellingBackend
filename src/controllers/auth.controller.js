const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");
const emailService = require("../services/email.service");

// Generate JWT tokens
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

// Register Student
exports.registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      email,
      password,
      phoneNumber,
      age,
      dateOfBirth,
      gender,
      maritalStatus,
      level,
      programmeOfStudy,
      residentialStatus,
      preferredLanguage,
      reasonForCounseling,
      emergencyContact,
      previousCounselingHistory,
      consentGiven,
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }],
    });

    if (existingStudent) {
      return res.status(400).json({
        status: "fail",
        message: "Student with this email or ID already exists",
      });
    }

    // Create new student
    const student = await Student.create({
      fullName,
      studentId,
      email,
      password,
      phoneNumber,
      age,
      dateOfBirth,
      gender,
      maritalStatus,
      level,
      programmeOfStudy,
      residentialStatus,
      preferredLanguage,
      reasonForCounseling,
      emergencyContact,
      previousCounselingHistory,
      consentGiven,
    });

    // Generate tokens
    const token = generateToken(student._id, "student");
    const refreshToken = generateRefreshToken(student._id, "student");

    // Update last login
    student.lastLogin = Date.now();
    await student.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      token,
      refreshToken,
      data: {
        user: {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          studentId: student.studentId,
          role: "student",
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

// Register Counselor (Admin only)
exports.registerCounselor = async (req, res) => {
  try {
    const {
      fullName,
      staffId,
      email,
      password,
      phoneNumber,
      gender,
      department,
      role,
      permissions,
    } = req.body;

    // Check if counselor already exists
    const existingCounselor = await Counselor.findOne({
      $or: [{ email }, { staffId }],
    });

    if (existingCounselor) {
      return res.status(400).json({
        status: "fail",
        message: "Counselor with this email or ID already exists",
      });
    }

    // Create new counselor
    const counselor = await Counselor.create({
      fullName,
      staffId,
      email,
      password,
      phoneNumber,
      gender,
      department,
      role,
      permissions,
    });

    // Generate tokens
    const token = generateToken(counselor._id, counselor.role);
    const refreshToken = generateRefreshToken(counselor._id, counselor.role);

    // Update last login
    counselor.lastLogin = Date.now();
    await counselor.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      token,
      refreshToken,
      data: {
        user: {
          id: counselor._id,
          fullName: counselor.fullName,
          email: counselor.email,
          staffId: counselor.staffId,
          role: counselor.role,
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

// Register Admin (with special admin code)
exports.registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      staffId,
      email,
      password,
      phoneNumber,
      gender,
      department,
      permissions,
      adminCode,
    } = req.body;

    // Validate admin code
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || "admin123";

    if (adminCode !== validAdminCode) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid admin registration code",
      });
    }

    // Check if counselor already exists
    const existingAdmin = await Counselor.findOne({
      $or: [{ email }, { staffId }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        status: "fail",
        message: "Admin with this email or ID already exists",
      });
    }

    // Create new admin with admin role
    const admin = await Counselor.create({
      fullName,
      staffId,
      email,
      password,
      phoneNumber,
      gender,
      department,
      role: "admin", // Force role as admin
      permissions: {
        viewStudents: true,
        editProfiles: true,
        scheduleAppointments: true,
        viewReports: true,
        manageUsers: true,
      }, // Default admin permissions
    });

    // Generate tokens
    const token = generateToken(admin._id, "admin");
    const refreshToken = generateRefreshToken(admin._id, "admin");

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      token,
      refreshToken,
      data: {
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          staffId: admin.staffId,
          role: "admin",
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

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    let user;
    let role;

    // Validate userType
    if (!userType || (userType !== "student" && userType !== "counselor")) {
      return res.status(400).json({
        status: "fail",
        message: "Please select a valid user type (Student or Counselor)",
      });
    }

    // Check for role mismatch by looking in both collections
    const studentUser = await Student.findOne({ email }).select("+password");
    const counselorUser = await Counselor.findOne({ email }).select("+password");

    // Handle role mismatch scenarios
    if (userType === "student" && !studentUser && counselorUser) {
      return res.status(401).json({
        status: "fail",
        message: "This email is registered as a counselor account. Please select 'Counselor' from the user type dropdown and try again.",
      });
    }

    if (userType === "counselor" && !counselorUser && studentUser) {
      return res.status(401).json({
        status: "fail",
        message: "This email is registered as a student account. Please select 'Student' from the user type dropdown and try again.",
      });
    }

    // Set user and role based on userType
    if (userType === "student") {
      user = studentUser;
      role = "student";
    } else if (userType === "counselor") {
      user = counselorUser;
      role = user ? user.role : "counselor";
    }

    // Check if user exists and password is correct
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "No account found with this email address. Please check your email or register for a new account.",
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password. Please check your password and try again.",
      });
    }

    // Generate tokens
    const token = generateToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      refreshToken,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role,
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

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide refresh token",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    let user;
    let role = decoded.role;

    // Find user based on role
    if (role === "student" || role === "counselee") {
      user = await Student.findById(decoded.id);
      role = "student";
    } else {
      user = await Counselor.findById(decoded.id);
      role = user ? user.role : "counselor";
    }

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    // Generate new token
    const token = generateToken(user._id, role);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Invalid or expired refresh token",
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  console.log(`🔍 FORGOT PASSWORD REQUEST RECEIVED:`);
  console.log(`   📋 Request Body:`, req.body);
  console.log(`   🌐 Request Headers:`, req.headers);
  console.log(`   📍 Request URL:`, req.url);
  console.log(`   📍 Request Method:`, req.method);
  
  try {
    const { email, userType } = req.body;

    if (!userType) {
      return res.status(400).json({
        status: "fail",
        message: "User type is required",
      });
    }

    let user;

    // Find user based on userType
    if (userType === "student") {
      user = await Student.findOne({ email });
    } else if (userType === "counselor") {
      user = await Counselor.findOne({ email });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user type. Must be 'student' or 'counselor'",
      });
    }

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        status: "success",
        message: "If an account with that email exists, we have sent a password reset link",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    try {
      console.log(`🚀 ATTEMPTING TO SEND PASSWORD RESET EMAIL:`);
      console.log(`   📧 To: ${user.email}`);
      console.log(`   👤 User: ${user.fullName}`);
      console.log(`   🏷️  Type: ${userType}`);
      console.log(`   🔑 Token: ${resetToken.substring(0, 8)}...`);
      
      // Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        userType,
        user.fullName
      );

      console.log(`✅ EMAIL SENT SUCCESSFULLY!`);
      console.log(`   📨 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Sent to: ${user.email}`);

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to your email address",
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error(`❌ FAILED TO SEND PASSWORD RESET EMAIL:`);
      console.error(`   📧 To: ${user.email}`);
      console.error(`   ⚠️  Error: ${emailError.message}`);
      console.error(`   📊 Full Error:`, emailError);
      
      res.status(500).json({
        status: "error",
        message: "Failed to send password reset email. Please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, userType } = req.body;

    if (!token || !password || !userType) {
      return res.status(400).json({
        status: "fail",
        message: "Token, password, and user type are required",
      });
    }

    // Hash the token to compare with the one in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user;

    // Find user based on userType
    if (userType === "student") {
      user = await Student.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else if (userType === "counselor") {
      user = await Counselor.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user type. Must be 'student' or 'counselor'",
      });
    }

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    // Update password and clear reset token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(
      user._id,
      userType === "student" ? "student" : user.role
    );
    const refreshToken = generateRefreshToken(
      user._id,
      userType === "student" ? "student" : user.role
    );

    res.status(200).json({
      status: "success",
      token: jwtToken,
      refreshToken,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Validate Reset Token
exports.validateResetToken = async (req, res) => {
  try {
    const { token, userType } = req.body;

    if (!token || !userType) {
      return res.status(400).json({
        status: "fail",
        message: "Token and user type are required",
      });
    }

    // Hash the token to compare with the one in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user;

    // Find user based on userType
    if (userType === "student") {
      user = await Student.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else if (userType === "counselor") {
      user = await Counselor.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user type. Must be 'student' or 'counselor'",
      });
    }

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Token is valid",
      data: {
        tokenValid: true,
        expiresAt: user.passwordResetExpires,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let user;

    // Find user based on role
    if (userRole === "student") {
      user = await Student.findById(userId).select("+password");
    } else {
      user = await Counselor.findById(userId).select("+password");
    }

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Logout (just a placeholder as actual logout happens client-side)
exports.logout = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
