const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");
const Chat = require("../models/chat.model");
const Journal = require("../models/journal.model");
const Appointment = require("../models/appointment.model");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let user;
    // Find user based on role
    if (userRole === "student") {
      user = await Student.findById(userId).select("-password -__v");
    } else {
      user = await Counselor.findById(userId).select("-password -__v");
    }

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = req.body;

    // Prevent updating password through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    let user;
    // Find and update user based on role
    if (userRole === "student") {
      user = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -__v");
    } else {
      user = await Counselor.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -__v");
    }

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only students can access the dashboard
    if (userRole !== "student") {
      return res.status(403).json({
        status: "fail",
        message: "Only students can access the dashboard",
      });
    }

    // Get upcoming appointments (limit to 3)
    const upcomingAppointments = await Appointment.find({
      student: userId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ["Scheduled", "Rescheduled"] },
    })
      .sort({ appointmentDate: 1 })
      .limit(3)
      .populate({
        path: "counselor",
        select: "fullName profilePicture",
      });

    // Get recent chat sessions (limit to 3)
    const recentChats = await Chat.find({
      student: userId,
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    // Get recent journal entries (limit to 3)
    const journalEntries = await Journal.find({
      student: userId,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // Get mood history from journal entries (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const moodHistory = await Journal.find({
      student: userId,
      createdAt: { $gte: oneWeekAgo },
    })
      .select("createdAt mood")
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      data: {
        upcomingAppointments: upcomingAppointments.map((appointment) => ({
          id: appointment._id,
          title: appointment.title,
          dateTime: appointment.appointmentDate,
          location: appointment.location || appointment.type,
          counselor: appointment.counselor
            ? {
                name: appointment.counselor.fullName,
                profilePicture: appointment.counselor.profilePicture,
              }
            : null,
        })),
        recentChats: recentChats.map((chat) => ({
          id: chat._id,
          title: chat.title,
          lastMessage:
            chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : null,
          updatedAt: chat.updatedAt,
        })),
        journalEntries: journalEntries.map((entry) => ({
          id: entry._id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          createdAt: entry.createdAt,
        })),
        moodHistory: moodHistory.map((record) => ({
          date: record.createdAt,
          mood: record.mood,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user by ID (admin or counselor only)
exports.getUserById = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only admins and counselors can look up users by ID
    if (userRole !== "admin" && userRole !== "counselor") {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }

    const userId = req.params.id;

    // Try to find as student first
    let user = await Student.findById(userId).select("-password -__v");

    // If not found as student, try as counselor
    if (!user) {
      user = await Counselor.findById(userId).select("-password -__v");
    }

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
