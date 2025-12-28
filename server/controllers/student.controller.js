const Topic = require("../data/topic.model");
const { findSimilarTopic } = require("../ai/similarity");
const { classifyCategory } = require("../ai/category");


exports.dashboard = (req, res) => {
  res.render("student", {
    role: req.user
  });
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
