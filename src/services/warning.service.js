const Student = require("../models/student.model");

const WarningService = {
  // Send warning to student when content is flagged
  sendContentFlaggedWarning: async (studentId, flagData, issuedBy) => {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      const warningMessage = generateWarningMessage(flagData);
      
      const warning = {
        message: warningMessage,
        reason: flagData.reason || "Content flagged for review",
        severity: flagData.severity || "medium",
        type: "content_flagged",
        issuedBy: issuedBy,
        issuedAt: new Date(),
        acknowledged: false,
      };

      student.warnings.push(warning);
      await student.save();

      return {
        success: true,
        warning: warning,
        message: "Warning sent to student successfully",
      };
    } catch (error) {
      console.error("Error sending warning to student:", error);
      throw error;
    }
  },

  // Get student warnings
  getStudentWarnings: async (studentId, page = 1, limit = 10) => {
    try {
      const student = await Student.findById(studentId)
        .populate("warnings.issuedBy", "fullName")
        .select("warnings");

      if (!student) {
        throw new Error("Student not found");
      }

      const warnings = student.warnings
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
        .slice((page - 1) * limit, page * limit);

      const totalWarnings = student.warnings.length;
      const unacknowledgedCount = student.warnings.filter(w => !w.acknowledged).length;

      return {
        warnings,
        totalWarnings,
        unacknowledgedCount,
        totalPages: Math.ceil(totalWarnings / limit),
        currentPage: parseInt(page),
      };
    } catch (error) {
      console.error("Error getting student warnings:", error);
      throw error;
    }
  },

  // Acknowledge warning
  acknowledgeWarning: async (studentId, warningId) => {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      const warning = student.warnings.id(warningId);
      if (!warning) {
        throw new Error("Warning not found");
      }

      warning.acknowledged = true;
      warning.acknowledgedAt = new Date();
      await student.save();

      return {
        success: true,
        message: "Warning acknowledged successfully",
      };
    } catch (error) {
      console.error("Error acknowledging warning:", error);
      throw error;
    }
  },

  // Get warning statistics for admin dashboard
  getWarningStats: async () => {
    try {
      const students = await Student.find({}, "warnings");
      
      let totalWarnings = 0;
      let unacknowledgedWarnings = 0;
      let severityBreakdown = { low: 0, medium: 0, high: 0 };
      let typeBreakdown = { content_flagged: 0, behavioral: 0, academic: 0, general: 0 };

      students.forEach(student => {
        student.warnings.forEach(warning => {
          totalWarnings++;
          if (!warning.acknowledged) {
            unacknowledgedWarnings++;
          }
          severityBreakdown[warning.severity]++;
          typeBreakdown[warning.type]++;
        });
      });

      return {
        totalWarnings,
        unacknowledgedWarnings,
        severityBreakdown,
        typeBreakdown,
      };
    } catch (error) {
      console.error("Error getting warning stats:", error);
      throw error;
    }
  },
};

// Helper function to generate appropriate warning messages
function generateWarningMessage(flagData) {
  const { severity, type, reason } = flagData;

  const messages = {
    content_flagged: {
      low: "Please be mindful of the content you share in the counseling platform. Your recent message has been flagged for review.",
      medium: "Your recent content has been flagged for containing inappropriate material. Please ensure your communications remain respectful and appropriate.",
      high: "Your content has been flagged for serious policy violations. Continued inappropriate behavior may result in account restrictions.",
    },
    behavioral: {
      low: "Please maintain respectful communication with counselors and staff.",
      medium: "Your behavior has been flagged as concerning. Please adhere to our community guidelines.",
      high: "Serious behavioral concerns have been raised. Please review our code of conduct immediately.",
    },
    academic: {
      low: "We've noticed some academic concerns. Please consider reaching out for additional support.",
      medium: "Your academic situation requires attention. Please schedule a meeting with your counselor.",
      high: "Urgent academic intervention needed. Please contact the counseling center immediately.",
    },
    general: {
      low: "This is a general reminder about our platform guidelines.",
      medium: "Please review our terms of service and community guidelines.",
      high: "Important: Your account requires immediate attention due to policy violations.",
    },
  };

  const baseMessage = messages[type]?.[severity] || messages.general.medium;
  
  if (reason) {
    return `${baseMessage}\n\nReason: ${reason}`;
  }
  
  return baseMessage;
}

module.exports = WarningService; 