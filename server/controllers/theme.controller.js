const Topic = require("../models/Topic");
const { groupIntoThemes } = require("../ai/themeCluster");

exports.getThemes = async (req, res) => {
  try {
    const topics = await Topic.find();
    const themes = await groupIntoThemes(topics);
    res.json(themes);
  } catch (err) {
    console.error("Theme clustering failed:", err);
    res.status(500).json({ error: "Theme analysis failed" });
  }
};
