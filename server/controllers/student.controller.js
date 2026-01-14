const Topic = require("../data/topic.model");
const { findSimilarTopic } = require("../ai/similarity");
const { classifyCategory } = require("../ai/category");


exports.dashboard = (req, res) => {
  // Legacy EJS dashboard removed. Keep route for backward compatibility.
  res.json({ ok: true, role: req.user?.role || null });
};

exports.submitFeedback = async (req, res) => {
  try {
    const { topic, description } = req.body;

    const existingTopics = await Topic.find({}, "topic");
    const topicNames = existingTopics.map(t => t.topic);

    const similarity = await findSimilarTopic(topic, topicNames);

    if (similarity.matched && similarity.matchedTopic) {
      await Topic.findOneAndUpdate(
        { topic: similarity.matchedTopic },
        { $inc: { votes: 1 } }
      );

      return res.send("Vote incremented successfully");
    }

    const category = await classifyCategory(topic, description);

    await Topic.create({
      topic,
      description,
      category,
      votes: 1
    });

    res.send("Feedback submitted successfully");

  } catch (err) {
    console.error("Student feedback error:", err);
    res.status(500).send("Failed to submit feedback");
  }
};

exports.topTopicsJson = async (req, res) => {
  try {
    const topTopics = await Topic.find()
      .sort({ votes: -1 })
      .limit(5);

    res.json({ topTopics });
  } catch (err) {
    console.error("Top topics error:", err);
    res.status(500).json({ error: "Failed to load top topics" });
  }
};
