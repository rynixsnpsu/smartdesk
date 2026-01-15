/**
 * Role-based access control middleware
 */

// Role to permission mapping
const ROLE_PERMISSIONS = {
  super_admin: ["*"], // All permissions
  admin: [
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
  ],
  academic_manager: [
    "manage_departments", "manage_courses", "manage_enrollments", "manage_grades",
    "view_student_data", "view_attendance", "view_analytics"
  ],
  faculty: [
    "view_student_data", "mark_attendance", "view_attendance",
    "manage_courses", "view_analytics"
  ],
  librarian: [
    "manage_books", "issue_books", "manage_library", "view_analytics"
  ],
  hostel_manager: [
    "manage_hostel", "allocate_rooms", "manage_mess", "view_analytics"
  ],
  finance_manager: [
    "manage_fees", "manage_scholarships", "view_financial_data", "view_analytics"
  ],
  infrastructure_manager: [
    "manage_buildings", "manage_rooms", "manage_facilities", "view_analytics"
  ],
  event_manager: [
    "manage_events", "create_events", "view_analytics"
  ],
  student: [
    "view_student_data" // Limited to own data
  ]
};

/**
 * Check if user has specific permission
 */
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = req.user;
      
      // Super admin has all permissions
      if (user.role === "super_admin") {
        return next();
      }

      // Check role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      if (rolePermissions.includes("*") || rolePermissions.includes(permission)) {
        return next();
      }

      // Check user-specific permissions
      if (user.permissions && user.permissions.includes(permission)) {
        return next();
      }

      // For students, allow viewing own data
      if (permission === "view_student_data" && user.role === "student") {
        if (req.params.id === user.id || req.query.studentId === user.id) {
          return next();
        }
      }

      return res.status(403).json({ error: "Insufficient permissions" });
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

/**
 * Check if user has any of the specified roles
 */
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (roles.includes(req.user.role) || req.user.role === "super_admin") {
      return next();
    }

    return res.status(403).json({ error: "Insufficient role privileges" });
  };
};

/**
 * Check if user can manage resource (own or admin)
 */
exports.canManage = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = req.user;
      
      // Super admin and admin can manage everything
      if (user.role === "super_admin" || user.role === "admin") {
        return next();
      }

      // Check if user owns the resource
      const resourceId = req.params.id || req.body.id;
      if (resourceType === "user" && resourceId === user.id) {
        return next();
      }

      // Check role-specific management permissions
      const managePermission = `manage_${resourceType}`;
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      
      if (rolePermissions.includes(managePermission) || 
          (user.permissions && user.permissions.includes(managePermission))) {
        return next();
      }

      return res.status(403).json({ error: "Cannot manage this resource" });
    } catch (err) {
      console.error("Management check error:", err);
      res.status(500).json({ error: "Management check failed" });
    }
  };
};
