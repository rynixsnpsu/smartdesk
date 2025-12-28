const Topic = require("../data/topic.model");

exports.dashboard = async (req, res) => {
  try {
    /* 1. Total submissions */
    const totalSubmissions = await Topic.countDocuments();

    /* 2. Top topics by votes */
    const topTopics = await Topic.find()
      .sort({ votes: -1 })
      .limit(5);

    /* 3. Category distribution */
    const categoryDistribution = await Topic.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    /* 4. Weekly trend (last 7 days) */
    const weeklyTrends = await Topic.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    res.render("admin", {
      role: req.user,
      totalSubmissions,
      topTopics,
      categoryDistribution,
      weeklyTrends
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).send("Failed to load analytics");
  }
};
