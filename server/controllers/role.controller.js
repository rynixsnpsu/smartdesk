const User = require("../models/User");

/**
 * Get all roles and their permissions
 */
exports.getRoles = (req, res) => {
  const roles = {
    super_admin: {
      name: "Super Admin",
      description: "Full system access",
      permissions: ["*"]
    },
    admin: {
      name: "Administrator",
      description: "Full administrative access",
      permissions: [
        "manage_departments", "manage_courses", "manage_enrollments", "manage_grades",
        "manage_students", "view_student_data", "manage_student_profiles",
        "mark_attendance", "view_attendance", "manage_attendance",
        "manage_faculty", "view_faculty_data",
        "manage_buildings", "manage_rooms", "manage_facilities",
        "manage_hostel", "allocate_rooms", "manage_mess",
        "manage_books", "issue_books", "manage_library",
        "manage_events", "create_events",
        "manage_fees", "manage_scholarships", "view_financial_data",
        "create_announcements", "manage_announcements",
        "view_analytics", "generate_reports",
        "manage_users", "manage_roles", "manage_settings", "view_audit_logs"
      ]
    },
    academic_manager: {
      name: "Academic Manager",
      description: "Manage academic operations",
      permissions: [
        "manage_departments", "manage_courses", "manage_enrollments", "manage_grades",
        "view_student_data", "view_attendance", "view_analytics"
      ]
    },
    faculty: {
      name: "Faculty",
      description: "Teaching staff",
      permissions: [
        "view_student_data", "mark_attendance", "view_attendance",
        "manage_courses", "view_analytics"
      ]
    },
    librarian: {
      name: "Librarian",
      description: "Library management",
      permissions: [
        "manage_books", "issue_books", "manage_library", "view_analytics"
      ]
    },
    hostel_manager: {
      name: "Hostel Manager",
      description: "Hostel operations",
      permissions: [
        "manage_hostel", "allocate_rooms", "manage_mess", "view_analytics"
      ]
    },
    finance_manager: {
      name: "Finance Manager",
      description: "Financial operations",
      permissions: [
        "manage_fees", "manage_scholarships", "view_financial_data", "view_analytics"
      ]
    },
    infrastructure_manager: {
      name: "Infrastructure Manager",
      description: "Infrastructure management",
      permissions: [
        "manage_buildings", "manage_rooms", "manage_facilities", "view_analytics"
      ]
    },
    event_manager: {
      name: "Event Manager",
      description: "Event management",
      permissions: [
        "manage_events", "create_events", "view_analytics"
      ]
    },
    student: {
      name: "Student",
      description: "Student access",
      permissions: [
        "view_student_data"
      ]
    }
  };

  res.json({ roles });
};

/**
 * Update user role and permissions
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    // Prevent changing super_admin role
    const user = await User.findById(userId);
    if (user.role === "super_admin" && role !== "super_admin") {
      return res.status(400).json({ error: "Cannot change super admin role" });
    }

    // Prevent self-demotion from admin
    if (user._id.toString() === req.user.id && role !== "admin" && role !== "super_admin") {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    user.role = role;
    if (permissions) {
      user.permissions = permissions;
    }
    await user.save();

    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};

/**
 * Get user permissions
 */
exports.getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      role: user.role,
      permissions: user.permissions || []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get permissions" });
  }
};
