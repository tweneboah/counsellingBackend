const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");
const Chat = require("../models/chat.model");
const Journal = require("../models/journal.model");
const Appointment = require("../models/appointment.model");
const WarningService = require("../services/warning.service");

// Get all students (with pagination)
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    let query = {};

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } },
          { programmeOfStudy: { $regex: search, $options: "i" } },
        ],
      };
    }

    const options = {
      select: "-password -passwordResetToken -passwordResetExpires",
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const students = await Student.find(query, null, options);
    const totalStudents = await Student.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: students.length,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: parseInt(page),
      data: {
        students,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a specific student
exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId).select(
      "-password -passwordResetToken -passwordResetExpires"
    );

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

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Fields that shouldn't be updated directly
    const restrictedFields = [
      "password",
      "passwordResetToken",
      "passwordResetExpires",
    ];

    // Remove restricted fields from request body
    const updatedData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key]) => !restrictedFields.includes(key)
      )
    );

    const student = await Student.findByIdAndUpdate(studentId, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password -passwordResetToken -passwordResetExpires");

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

// Toggle student account status
exports.toggleStudentStatus = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "isActive field is required",
      });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passwordResetToken -passwordResetExpires");

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

// Get all counselors
exports.getAllCounselors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    let query = {};

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { staffId: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
        ],
      };
    }

    const options = {
      select: "-password -passwordResetToken -passwordResetExpires",
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const counselors = await Counselor.find(query, null, options);
    const totalCounselors = await Counselor.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: counselors.length,
      totalCounselors,
      totalPages: Math.ceil(totalCounselors / limit),
      currentPage: parseInt(page),
      data: {
        counselors,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update counselor details
exports.updateCounselor = async (req, res) => {
  try {
    const counselorId = req.params.id;

    // Fields that shouldn't be updated directly
    const restrictedFields = [
      "password",
      "passwordResetToken",
      "passwordResetExpires",
    ];

    // Remove restricted fields from request body
    const updatedData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key]) => !restrictedFields.includes(key)
      )
    );

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passwordResetToken -passwordResetExpires");

    if (!counselor) {
      return res.status(404).json({
        status: "fail",
        message: "Counselor not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        counselor,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Toggle counselor account status
exports.toggleCounselorStatus = async (req, res) => {
  try {
    const counselorId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "isActive field is required",
      });
    }

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passwordResetToken -passwordResetExpires");

    if (!counselor) {
      return res.status(404).json({
        status: "fail",
        message: "Counselor not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        counselor,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};









// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get counts
    const totalStudents = await Student.countDocuments();
    const totalCounselors = await Counselor.countDocuments();
    const totalChats = await Chat.countDocuments();
    const totalFlaggedChats = await Chat.countDocuments({
      flaggedForReview: true,
    });
    const totalJournals = await Journal.countDocuments();
    const totalFlaggedJournals = await Journal.countDocuments({
      flaggedForReview: true,
    });
    const totalAppointments = await Appointment.countDocuments();

    // Get recent registrations (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentStudentCount = await Student.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // Calculate chat metrics
    const chatMetrics = await Chat.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: { $size: "$messages" } },
          averageMessagesPerChat: { $avg: { $size: "$messages" } },
        },
      },
    ]);

    // Most common categories
    const chatCategories = await Chat.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Recent activity
    const recentChats = await Chat.find({}, null, {
      sort: { updatedAt: -1 },
      limit: 5,
      populate: {
        path: "student",
        select: "fullName",
      },
    });

    const recentAppointments = await Appointment.find({}, null, {
      sort: { createdAt: -1 },
      limit: 5,
      populate: [
        {
          path: "student",
          select: "fullName",
        },
        {
          path: "counselor",
          select: "fullName",
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data: {
        counts: {
          totalStudents,
          totalCounselors,
          totalChats,
          totalFlaggedChats,
          totalJournals,
          totalFlaggedJournals,
          totalAppointments,
          recentStudentCount,
        },
        chatMetrics: chatMetrics[0] || {
          totalMessages: 0,
          averageMessagesPerChat: 0,
        },
        categoryBreakdown: chatCategories,
        recentActivity: {
          chats: recentChats.map((chat) => ({
            id: chat._id,
            title: chat.title,
            studentName: chat.student ? chat.student.fullName : "Unknown",
            timestamp: chat.updatedAt,
          })),
          appointments: recentAppointments.map((apt) => ({
            id: apt._id,
            title: apt.title,
            studentName: apt.student ? apt.student.fullName : "Unknown",
            counselorName: apt.counselor ? apt.counselor.fullName : "Unknown",
            date: apt.appointmentDate,
            status: apt.status,
          })),
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

// Chat Sessions Management
exports.getChatSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Build query object
    const query = {};

    // Add status filter if provided
    if (status === "active") {
      query.isActive = true;
    } else if (status === "completed") {
      query.isActive = false;
    } else if (status === "flagged") {
      query.flaggedForReview = true;
    }

    // Find all matching chats
    let chatQuery = Chat.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate({
        path: "student",
        select: "fullName email studentId",
      });

    // Count total matching documents for pagination
    const totalItems = await Chat.countDocuments(query);

    // Execute the query
    const chats = await chatQuery;

    // Transform the data to match the frontend expectations
    const chatSessions = chats.map((chat) => {
      return {
        id: chat._id,
        studentId: chat.student?._id || "unknown",
        studentName: chat.student?.fullName || "Unknown Student",
        studentEmail: chat.student?.email || "unknown@example.com",
        startDate: chat.startedAt,
        status: chat.isActive ? "active" : "completed",
        messagesCount: chat.messages?.length || 0,
        lastMessageDate:
          chat.messages?.length > 0
            ? chat.messages[chat.messages.length - 1].timestamp
            : chat.updatedAt,
        topic:
          chat.title ||
          (chat.category
            ? chat.category.charAt(0).toUpperCase() + chat.category.slice(1)
            : "Uncategorized"),
      };
    });

    // Filter results if search parameter is provided
    let filteredSessions = chatSessions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSessions = chatSessions.filter(
        (session) =>
          (session.studentName &&
            session.studentName.toLowerCase().includes(searchLower)) ||
          (session.studentEmail &&
            session.studentEmail.toLowerCase().includes(searchLower)) ||
          (session.topic && session.topic.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        chatSessions: filteredSessions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get chat sessions",
      error: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the chat by ID
    const chat = await Chat.findById(id).populate({
      path: "student",
      select: "fullName email",
    });

    if (!chat) {
      return res.status(404).json({
        status: "fail",
        message: "Chat session not found",
      });
    }

    // Transform messages to match the frontend expected format
    const messages = chat.messages.map((message, index) => ({
      id: message._id || `msg-${index}`,
      role: message.sender === "student" ? "student" : "assistant",
      content: message.content,
      timestamp: message.timestamp,
    }));

    res.status(200).json({
      status: "success",
      data: {
        sessionId: id,
        studentName: chat.student?.fullName || "Unknown",
        studentEmail: chat.student?.email || "unknown@example.com",
        topic: chat.title || chat.category,
        startDate: chat.startedAt,
        status: chat.isActive ? "active" : "completed",
        messages,
      },
    });
  } catch (error) {
    console.error(
      `Error getting chat history for session ${req.params.id}:`,
      error
    );
    res.status(500).json({
      status: "error",
      message: "Failed to get chat history",
      error: error.message,
    });
  }
};









// Get all journals for admin review
exports.getAllJournals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    let query = {};



    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      populate: {
        path: "student",
        select: "fullName studentId email",
      },
    };

    const journals = await Journal.find(query, null, options);
    const totalJournals = await Journal.countDocuments(query);

    // Format the response
    const formattedJournals = journals.map((journal) => {
      return {
        _id: journal._id,
        id: journal._id,
        title: journal.title,
        content: journal.content?.substring(0, 200) + (journal.content?.length > 200 ? "..." : ""),
        fullContent: journal.content,
        studentName: journal.student?.fullName || "Unknown Student",
        studentId: journal.student?.studentId || "N/A",
        mood: journal.mood,
        createdAt: journal.createdAt,
        isPrivate: journal.isPrivate,
        tags: journal.tags,
      };
    });

    res.status(200).json({
      status: "success",
      results: formattedJournals.length,
      totalCount: totalJournals,
      totalPages: Math.ceil(totalJournals / limit),
      currentPage: parseInt(page),
      data: {
        journals: formattedJournals,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Warning-related endpoints
exports.getStudentWarnings = async (req, res) => {
  try {
    const { studentId } = req.params;
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

exports.getWarningStats = async (req, res) => {
  try {
    const stats = await WarningService.getWarningStats();

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.exportChatHistory = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { format = "text" } = req.query;

    // Find the chat
    const chat = await Chat.findById(chatId).populate({
      path: "student",
      select: "fullName email",
    });

    if (!chat) {
      return res.status(404).json({
        status: "fail",
        message: "Chat session not found",
      });
    }

    // Format the chat data depending on the requested format
    let data;
    let contentType;
    let fileName = `chat-history-${chatId}.${
      format === "json" ? "json" : "txt"
    }`;

    if (format === "json") {
      // JSON format
      data = JSON.stringify(
        {
          id: chat._id,
          student: {
            id: chat.student?._id,
            name: chat.student?.fullName || "Unknown Student",
            email: chat.student?.email || "unknown@example.com",
          },
          title: chat.title,
          category: chat.category,
          startedAt: chat.startedAt,
          endedAt: chat.endedAt,
          messages: chat.messages.map((msg) => ({
            id: msg._id,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
            flagged: msg.flagged || false,
          })),
        },
        null,
        2
      );
      contentType = "application/json";
    } else {
      // Text format
      const studentName = chat.student?.fullName || "Unknown Student";

      let textContent = `Chat History with ${studentName}\n`;
      textContent += `Date: ${new Date().toDateString()}\n`;
      textContent += `Session ID: ${chat._id}\n`;
      textContent += `Total Messages: ${chat.messages.length}\n\n`;
      textContent += `=======================================\n\n`;

      chat.messages.forEach((message) => {
        const timestamp = new Date(message.timestamp).toLocaleString();
        textContent += `[${timestamp}] ${
          message.sender === "student" ? studentName : "AI Counselor"
        }:\n`;
        textContent += `${message.content}\n\n`;
      });

      data = textContent;
      contentType = "text/plain";
    }

    // Send the data as a downloadable file
    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    res.send(data);
  } catch (error) {
    console.error(
      `Error exporting chat history for session ${req.params.id}:`,
      error
    );
    res.status(500).json({
      status: "error",
      message: "Failed to export chat history",
      error: error.message,
    });
  }
};
