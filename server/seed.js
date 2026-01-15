require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Topic = require("./models/Topic");
const connectDB = require("./data/db");

async function seed() {
  try {
    await connectDB();

    // Clear and recreate admin user
    await User.deleteOne({ username: "admin" });
    const admin = await User.create({
      username: "admin",
      email: "admin@smartdesk.com",
      password: "admin123",
      role: "admin",
      isActive: true,
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
    });
    console.log("✅ Admin created:", admin.username);

    // Clear and recreate student user
    await User.deleteOne({ username: "student" });
    const student = await User.create({
      username: "student",
      email: "student@smartdesk.com",
      password: "student123",
      role: "student",
      isActive: true,
      profile: {
        firstName: "John",
        lastName: "Doe",
        studentId: "STU001",
        rollNumber: "2024001"
      }
    });
    console.log("✅ Student created:", student.username);

    // Create sample roles
    const roles = [
      { username: "librarian", email: "librarian@smartdesk.com", password: "lib123", role: "librarian" },
      { username: "hostel_manager", email: "hostel@smartdesk.com", password: "hostel123", role: "hostel_manager" },
      { username: "finance_manager", email: "finance@smartdesk.com", password: "finance123", role: "finance_manager" },
      { username: "academic_manager", email: "academic@smartdesk.com", password: "academic123", role: "academic_manager" },
      { username: "faculty", email: "faculty@smartdesk.com", password: "faculty123", role: "faculty" }
    ];

    for (const roleData of roles) {
      const exists = await User.findOne({ username: roleData.username });
      if (!exists) {
        await User.create({ ...roleData, isActive: true });
        console.log(`✅ ${roleData.role} created: ${roleData.username}`);
      }
    }

    // Verify login works
    const testAdmin = await User.findOne({ username: "admin" }).select("+password");
    const testPass = await testAdmin.comparePassword("admin123");
    console.log("✅ Password verification:", testPass ? "PASS" : "FAIL");

    // Create sample announcements
    const Announcement = require("./models/Announcement");
    await Announcement.deleteMany({}); // Clear existing for testing
    const announcements = [
      {
        title: "Welcome to SmartDesk!",
        content: "Welcome to the new SmartDesk platform. This system will help you manage all your academic activities, view announcements, check attendance, and much more.",
        type: "general",
        priority: "medium",
        targetAudience: "all",
        publishedBy: admin._id
      },
      {
        title: "Semester Registration Open",
        content: "Course registration for the upcoming semester is now open. Please register for your courses before the deadline.",
        type: "academic",
        priority: "high",
        targetAudience: "students",
        publishedBy: admin._id
      },
      {
        title: "Library Hours Extended",
        content: "The library will now be open until 10 PM on weekdays for exam preparation.",
        type: "library",
        priority: "medium",
        targetAudience: "all",
        publishedBy: admin._id
      },
      {
        title: "Hostel Maintenance Notice",
        content: "Hostel maintenance will be conducted this weekend. Please plan accordingly.",
        type: "hostel",
        priority: "medium",
        targetAudience: "students",
        publishedBy: admin._id
      }
    ];

    for (const annData of announcements) {
      await Announcement.create(annData);
    }
    console.log("✅ Sample announcements created");

    console.log("\n✅ Seeding complete!");
    console.log("📝 Default credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Student: student / student123");
    console.log("   Librarian: librarian / lib123");
    console.log("   Hostel Manager: hostel_manager / hostel123");
    console.log("   Finance Manager: finance_manager / finance123");
    console.log("   Academic Manager: academic_manager / academic123");
    console.log("   Faculty: faculty / faculty123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
