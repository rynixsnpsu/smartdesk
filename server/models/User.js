const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: [
        "admin",
        "student",
        "faculty",
        "librarian",
        "hostel_manager",
        "finance_manager",
        "academic_manager",
        "infrastructure_manager",
        "event_manager",
        "super_admin"
      ],
      default: "student",
      index: true
    },
    permissions: [{
      type: String,
      enum: [
        // Academic
        "manage_departments", "manage_courses", "manage_enrollments", "manage_grades",
        // Student
        "manage_students", "view_student_data", "manage_student_profiles",
        // Attendance
        "mark_attendance", "view_attendance", "manage_attendance",
        // Faculty
        "manage_faculty", "view_faculty_data",
        // Infrastructure
        "manage_buildings", "manage_rooms", "manage_facilities",
        // Hostel
        "manage_hostel", "allocate_rooms", "manage_mess",
        // Library
        "manage_books", "issue_books", "manage_library",
        // Events
        "manage_events", "create_events",
        // Financial
        "manage_fees", "manage_scholarships", "view_financial_data",
        // Announcements
        "create_announcements", "manage_announcements",
        // Analytics
        "view_analytics", "generate_reports",
        // System
        "manage_users", "manage_roles", "manage_settings", "view_audit_logs"
      ]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      address: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"]
      },
      photo: String,
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      },
      studentId: String,
      rollNumber: String,
      admissionDate: Date,
      graduationDate: Date
    },
    lastLogin: {
      type: Date
    },
    lastLoginIP: {
      type: String
    },
    lastActivity: {
      type: Date
    },
    passwordHistory: [{
      type: String
    }],
    loginAttempts: {
      count: { type: Number, default: 0 },
      lastAttempt: Date,
      lockedUntil: Date
    },
    activityLog: [{
      action: String,
      timestamp: Date,
      ip: String
    }],
    deviceFingerprints: [{
      fingerprint: String,
      lastUsed: Date
    }],
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "dark"
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      },
      language: {
        type: String,
        default: "en"
      }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "super_admin" || this.role === "admin") return true;
  return this.permissions.includes(permission);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
