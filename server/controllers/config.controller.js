/**
 * Configuration Controller - Makes everything configurable
 */
const Settings = require("../models/Settings");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Building = require("../models/Building");
const Topic = require("../models/Topic");
const User = require("../models/User");

/**
 * Get all system configurations
 */
exports.getAllConfigs = async (req, res) => {
  try {
    const settings = await Settings.find();
    const configs = {};
    settings.forEach((s) => {
      if (!configs[s.category]) configs[s.category] = {};
      configs[s.category][s.key] = s.value;
    });

    // Get system stats for config panel
    const stats = {
      departments: await Department.countDocuments(),
      courses: await Course.countDocuments(),
      buildings: await Building.countDocuments(),
      topics: await Topic.countDocuments(),
      users: await User.countDocuments()
    };

    res.json({ configs, stats });
  } catch (err) {
    console.error("Get configs error:", err);
    res.status(500).json({ error: "Failed to fetch configurations" });
  }
};

/**
 * Update configuration
 */
exports.updateConfig = async (req, res) => {
  try {
    const { category, key, value, description } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value,
        category: category || "general",
        description,
        updatedBy: req.user.id
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, setting });
  } catch (err) {
    console.error("Update config error:", err);
    res.status(500).json({ error: "Failed to update configuration" });
  }
};

/**
 * Bulk update configurations
 */
exports.bulkUpdateConfigs = async (req, res) => {
  try {
    const { configs } = req.body; // Array of {category, key, value}
    
    const updates = await Promise.all(
      configs.map(({ category, key, value, description }) =>
        Settings.findOneAndUpdate(
          { key },
          {
            value,
            category: category || "general",
            description,
            updatedBy: req.user.id
          },
          { upsert: true, new: true }
        )
      )
    );

    res.json({ success: true, updated: updates.length, configs: updates });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ error: "Failed to update configurations" });
  }
};

/**
 * Reset configuration to default
 */
exports.resetConfig = async (req, res) => {
  try {
    const { key } = req.params;
    await Settings.findOneAndDelete({ key });
    res.json({ success: true, message: "Configuration reset to default" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset configuration" });
  }
};

/**
 * Get configuration by category
 */
exports.getConfigByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Settings.find({ category });
    const configs = {};
    settings.forEach((s) => {
      configs[s.key] = s.value;
    });
    res.json({ category, configs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category configurations" });
  }
};
