const Topic = require("../models/Topic");

/**
 * Get all topics (admin only)
 */
exports.getAllTopics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { topic: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [topics, total] = await Promise.all([
      Topic.find(filter)
        .populate("createdBy", "username email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Topic.countDocuments(filter)
    ]);

    res.json({
      topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get topics error:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};

/**
 * Get topic by ID
 */
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate(
      "createdBy",
      "username email"
    );
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json({ topic });
  } catch (err) {
    console.error("Get topic error:", err);
    res.status(500).json({ error: "Failed to fetch topic" });
  }
};

/**
 * Create topic (admin only)
 */
exports.createTopic = async (req, res) => {
  try {
    const { topic, description, category, status = "open" } = req.body;

    if (!topic || !description) {
      return res.status(400).json({ error: "Topic and description required" });
    }

    const newTopic = await Topic.create({
      topic,
      description,
      category: category || "Other",
      status,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      topic: await Topic.findById(newTopic._id).populate(
        "createdBy",
        "username email"
      )
    });
  } catch (err) {
    console.error("Create topic error:", err);
    res.status(500).json({ error: "Failed to create topic" });
  }
};

/**
 * Update topic (admin only)
 */
exports.updateTopic = async (req, res) => {
  try {
    const { topic, description, category, status, votes } = req.body;
    const topicDoc = await Topic.findById(req.params.id);

    if (!topicDoc) {
      return res.status(404).json({ error: "Topic not found" });
    }

    if (topic) topicDoc.topic = topic;
    if (description) topicDoc.description = description;
    if (category) topicDoc.category = category;
    if (status) topicDoc.status = status;
    if (typeof votes === "number") topicDoc.votes = votes;

    await topicDoc.save();

    res.json({
      success: true,
      topic: await Topic.findById(topicDoc._id).populate(
        "createdBy",
        "username email"
      )
    });
  } catch (err) {
    console.error("Update topic error:", err);
    res.status(500).json({ error: "Failed to update topic" });
  }
};

/**
 * Delete topic (admin only)
 */
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    await Topic.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Topic deleted" });
  } catch (err) {
    console.error("Delete topic error:", err);
    res.status(500).json({ error: "Failed to delete topic" });
  }
};
