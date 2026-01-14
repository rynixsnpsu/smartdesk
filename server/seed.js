require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = new User({
        username: "admin",
        email: "admin@smartdesk.com",
        password: "admin123",
        role: "admin"
      });
      await admin.save();
      console.log("Admin user created");
    }

    const studentExists = await User.findOne({ username: "25SUUBEADS185" });
    if (!studentExists) {
      const student = new User({
        username: "25SUUBEADS185",
        email: "student@smartdesk.com",
        password: "student123",
        role: "student"
      });
      await student.save();
      console.log("Student user created");
    }

    console.log("Seeding complete");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();