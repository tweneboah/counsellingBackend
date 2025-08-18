const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const Student = require("../models/student.model");
const Counselor = require("../models/counselor.model");

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI ||
      "mongodb://localhost:27017/counseling-platform";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB for seeding");
    seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Sample data
const adminData = {
  fullName: "Admin User",
  staffId: "ADMIN001",
  email: "admin@example.com",
  password: "admin123456",
  phoneNumber: "+233123456789",
  gender: "Male",
  department: "Counseling Department",
  role: "admin",
  permissions: {
    viewStudents: true,
    editProfiles: true,
    scheduleAppointments: true,
    viewReports: true,
    manageUsers: true,
  },
};

const counselorData = {
  fullName: "John Counselor",
  staffId: "STAFF001",
  email: "counselor@example.com",
  password: "counselor123456",
  phoneNumber: "+233123456780",
  gender: "Male",
  department: "Counseling Department",
  role: "counselor",
  permissions: {
    viewStudents: true,
    editProfiles: false,
    scheduleAppointments: true,
    viewReports: true,
    manageUsers: false,
  },
};

const studentData = {
  fullName: "Jane Student",
  studentId: "STU001",
  email: "student@example.com",
  password: "student123456",
  phoneNumber: "+233123456781",
  age: 22,
  dateOfBirth: new Date(2002, 0, 1),
  gender: "Female",
  maritalStatus: "Single",
  level: "Level 300",
  programmeOfStudy: "Computer Science",
  residentialStatus: "On-Campus",
  preferredLanguage: "English",
  reasonForCounseling: ["stress", "academic"],
  emergencyContact: {
    name: "Parent Name",
    relationship: "Parent",
    phoneNumber: "+233123456782",
  },
  previousCounselingHistory: {
    hasPreviousCounseling: false,
  },
  consentGiven: true,
};

async function seedDatabase() {
  try {
    // Clear existing data
    await Student.deleteMany({});
    await Counselor.deleteMany({});

    console.log("Existing data cleared");

    // Create admin user
    const salt = await bcrypt.genSalt(
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    );
    adminData.password = await bcrypt.hash(adminData.password, salt);
    await Counselor.create(adminData);
    console.log("Admin user created");

    // Create counselor
    counselorData.password = await bcrypt.hash(counselorData.password, salt);
    await Counselor.create(counselorData);
    console.log("Counselor created");

    // Create student
    studentData.password = await bcrypt.hash(studentData.password, salt);
    await Student.create(studentData);
    console.log("Student created");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}
