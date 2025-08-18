const Appointment = require("../models/appointment.model");
const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");

// Get available counselors for scheduling appointments
exports.getAvailableCounselors = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const options = {
      select: "fullName department staffId isActive",
      sort: { fullName: 1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // Only return active counselors who can take appointments
    const query = { isActive: true, role: { $in: ["counselor", "admin"] } };

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

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      counselorId,
      title,
      description,
      appointmentDate,
      duration,
      type,
      reason,
      zoomLink,
      location,
      notes,
    } = req.body;

    const studentId = req.user.id;

    // Validate required fields
    if (!counselorId || !title || !appointmentDate || !type || !reason) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please provide counselor, title, date, type, and reason for the appointment",
      });
    }

    // Validate that appointmentDate is a valid date
    const appointmentDateObj = new Date(appointmentDate);
    if (isNaN(appointmentDateObj.getTime())) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid appointment date format",
      });
    }

    // Check if appointment date is in the future
    const now = new Date();
    if (appointmentDateObj < now) {
      return res.status(400).json({
        status: "fail",
        message: "Appointment date must be in the future",
      });
    }

    // Check if counselor exists
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({
        status: "fail",
        message: "Counselor not found",
      });
    }

    // Check if the requested time slot is available
    // Get the date portion for the query
    const requestDate = new Date(appointmentDateObj);
    requestDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(requestDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find existing appointments for this counselor on this day
    const existingAppointments = await Appointment.find({
      counselor: counselorId,
      appointmentDate: {
        $gte: requestDate,
        $lt: nextDay,
      },
      status: { $ne: "Cancelled" },
    });

    // Check for conflicts - convert everything to minutes for comparison
    const requestHour = appointmentDateObj.getHours();
    const requestMinutes = appointmentDateObj.getMinutes();
    const requestStartTime = requestHour * 60 + requestMinutes;
    const requestEndTime = requestStartTime + (duration || 60);

    const hasConflict = existingAppointments.some((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      const aptHour = aptDate.getHours();
      const aptMinutes = aptDate.getMinutes();
      const aptStartTime = aptHour * 60 + aptMinutes;
      const aptEndTime = aptStartTime + (apt.duration || 60);

      // Check for overlap
      return (
        (requestStartTime >= aptStartTime && requestStartTime < aptEndTime) || // Start during existing appointment
        (requestEndTime > aptStartTime && requestEndTime <= aptEndTime) || // End during existing appointment
        (requestStartTime <= aptStartTime && requestEndTime >= aptEndTime) // Contains existing appointment
      );
    });

    if (hasConflict) {
      return res.status(400).json({
        status: "fail",
        message:
          "The selected time slot is no longer available. Please choose another time.",
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      student: studentId,
      counselor: counselorId,
      title,
      description,
      appointmentDate,
      duration: duration || 60,
      type,
      reason,
      zoomLink,
      location,
      notes,
      status: "Scheduled",
    });

    res.status(201).json({
      status: "success",
      data: {
        appointment,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all appointments for a student
exports.getStudentAppointments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { student: studentId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const options = {
      sort: { appointmentDate: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      populate: {
        path: "counselor",
        select: "fullName department",
      },
    };

    const appointments = await Appointment.find(query, null, options);
    const totalAppointments = await Appointment.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: appointments.length,
      totalAppointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      data: {
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all appointments for a counselor
exports.getCounselorAppointments = async (req, res) => {
  try {
    const counselorId = req.user.id;
    const { page = 1, limit = 10, status, date } = req.query;

    const query = { counselor: counselorId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by date if provided (for specific day)
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const options = {
      sort: { appointmentDate: 1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      populate: {
        path: "student",
        select: "fullName studentId email phoneNumber programmeOfStudy",
      },
    };

    const appointments = await Appointment.find(query, null, options);
    const totalAppointments = await Appointment.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: appointments.length,
      totalAppointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      data: {
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a specific appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role (students can only see their own appointments)
    const query = { _id: appointmentId };

    if (userRole === "student") {
      query.student = userId;
    } else if (userRole === "counselor") {
      query.counselor = userId;
    }
    // Admins can see all appointments

    const appointment = await Appointment.findOne(query)
      .populate("student", "fullName studentId email phoneNumber")
      .populate("counselor", "fullName department");

    if (!appointment) {
      return res.status(404).json({
        status: "fail",
        message: "Appointment not found or access denied",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        appointment,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const {
      title,
      description,
      appointmentDate,
      duration,
      type,
      reason,
      zoomLink,
      location,
      notes,
      status,
      followUpRequired,
      followUpNotes,
    } = req.body;

    // Build query based on user role
    const query = { _id: appointmentId };

    if (userRole === "student") {
      query.student = userId;

      // Students can only update limited fields and only if appointment is still scheduled
      query.status = "Scheduled";
    } else if (userRole === "counselor") {
      query.counselor = userId;
    }
    // Admins can update any appointment

    // Find the appointment
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        status: "fail",
        message: "Appointment not found or cannot be modified",
      });
    }

    // Update fields based on user role
    if (userRole === "student") {
      // Students can only cancel or update specific fields
      if (status === "Cancelled") {
        appointment.status = "Cancelled";
      }

      if (title) appointment.title = title;
      if (description) appointment.description = description;
      if (notes) appointment.notes = notes;

      // Students cannot change the date or counselor
    } else {
      // Counselors and admins can update all fields
      if (title) appointment.title = title;
      if (description) appointment.description = description;
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      if (duration) appointment.duration = duration;
      if (type) appointment.type = type;
      if (reason) appointment.reason = reason;
      if (zoomLink !== undefined) appointment.zoomLink = zoomLink;
      if (location !== undefined) appointment.location = location;
      if (notes !== undefined) appointment.notes = notes;
      if (status) appointment.status = status;
      if (followUpRequired !== undefined)
        appointment.followUpRequired = followUpRequired;
      if (followUpNotes !== undefined)
        appointment.followUpNotes = followUpNotes;
    }

    await appointment.save();

    res.status(200).json({
      status: "success",
      data: {
        appointment,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role
    const query = {
      _id: appointmentId,
      status: "Scheduled", // Can only cancel scheduled appointments
    };

    if (userRole === "student") {
      query.student = userId;
    } else if (userRole === "counselor") {
      query.counselor = userId;
    }
    // Admins can cancel any appointment

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        status: "fail",
        message: "Appointment not found or cannot be cancelled",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully",
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get available time slots for a counselor
exports.getCounselorTimeSlots = async (req, res) => {
  try {
    const counselorId = req.params.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a date",
      });
    }

    // Check if counselor exists
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({
        status: "fail",
        message: "Counselor not found",
      });
    }

    // Get the selected date and the next day
    const selectedDate = new Date(date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all appointments for the counselor on the selected date
    const appointments = await Appointment.find({
      counselor: counselorId,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDay,
      },
      status: { $ne: "Cancelled" },
    });

    // Define working hours (8 AM to 5 PM)
    const workingHours = {
      start: 8, // 8 AM
      end: 17, // 5 PM
    };

    // Create available time slots (every 30 minutes)
    const timeSlots = [];
    let slotIndex = 0;
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      // Create two slots per hour (at :00 and :30)
      for (let minutes of [0, 30]) {
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minutes, 0, 0);

        // Check if this slot conflicts with existing appointments
        const isAvailable = !appointments.some((apt) => {
          const aptDate = new Date(apt.appointmentDate);
          const aptHour = aptDate.getHours();
          const aptMinutes = aptDate.getMinutes();
          const aptDuration = apt.duration || 60;

          // Convert appointment time to minutes for easier comparison
          const appointmentStartTime = aptHour * 60 + aptMinutes;
          const appointmentEndTime = appointmentStartTime + aptDuration;

          // Convert current slot to minutes
          const slotTime = hour * 60 + minutes;

          // Check if this slot falls within the appointment time
          return (
            slotTime >= appointmentStartTime && slotTime < appointmentEndTime
          );
        });

        // Only include available slots and slots that are in the future
        const now = new Date();
        if (slotDate > now) {
          timeSlots.push({
            id: `slot-${slotIndex}`,
            time: slotDate.toISOString(),
            formattedTime: `${hour.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}`,
            available: isAvailable,
          });
          slotIndex++;
        }
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        counselorId,
        counselorName: counselor.fullName,
        date: selectedDate.toISOString().split("T")[0],
        timeSlots,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
