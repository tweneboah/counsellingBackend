const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const counselorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    staffId: {
      type: String,
      required: [true, "Staff ID is required"],
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "counselor", "moderator"],
      default: "counselor",
    },
    permissions: {
      viewStudents: {
        type: Boolean,
        default: true,
      },
      editProfiles: {
        type: Boolean,
        default: false,
      },
      scheduleAppointments: {
        type: Boolean,
        default: true,
      },
      viewReports: {
        type: Boolean,
        default: false,
      },
      manageUsers: {
        type: Boolean,
        default: false,
      },
    },
    profilePicture: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
counselorSchema.pre("save", async function (next) {
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
counselorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Counselor = mongoose.model("Counselor", counselorSchema);

module.exports = Counselor;
