const User = require("../models/User");

/**
 * Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role && ["student", "admin"].includes(role)) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

/**
 * Create user (admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role = "student" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password required" });
    }

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if user exists
    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      user: user.toJSON()
    });
  } catch (err) {
    console.error("Create user error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};

/**
 * Update user (admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user.id && isActive === false) {
      return res.status(400).json({ error: "Cannot deactivate yourself" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role && ["student", "admin"].includes(role)) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (err) {
    console.error("Update user error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

/**
 * Delete user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
