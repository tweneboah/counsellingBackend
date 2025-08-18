const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    age: {
      type: Number,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed", "Other"],
    },
    level: {
      type: String,
      trim: true,
    },
    programmeOfStudy: {
      type: String,
      trim: true,
    },
    residentialStatus: {
      type: String,
      enum: ["On-Campus", "Off-Campus", "Hostel", "Other"],
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Twi", "Ewe", "Hausa", "Other"],
      default: "English",
    },
    reasonForCounseling: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
    previousCounselingHistory: {
      hasPreviousCounseling: {
        type: Boolean,
        default: false,
      },
      details: String,
    },
    profilePicture: {
      type: String,
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    warnings: [{
      message: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      type: {
        type: String,
        enum: ["content_flagged", "behavioral", "academic", "general"],
        default: "general",
      },
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Counselor",
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
      acknowledged: {
        type: Boolean,
        default: false,
      },
      acknowledgedAt: {
        type: Date,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
studentSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
