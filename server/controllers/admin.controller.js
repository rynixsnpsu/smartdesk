const Topic = require("../data/topic.model");

const CATEGORIES = [
  "Academics",
  "Faculty",
  "Infrastructure",
  "Hostel",
  "Administration",
  "Other",
];

async function buildAnalytics(matchFilter, selected) {
  /* 1. Total submissions (respecting category filter if applied) */
  const totalSubmissions = await Topic.countDocuments(matchFilter);

  /* 2. Top topics by votes */
  const topTopics = await Topic.find(matchFilter)
    .sort({ votes: -1 })
    .limit(5);

  /* 3. Category distribution (within current filter scope) */
  const categoryPipeline = [];
  if (Object.keys(matchFilter).length) {
    categoryPipeline.push({ $match: matchFilter });
  }
  categoryPipeline.push({
    $group: {
      _id: "$category",
      count: { $sum: 1 },
    },
  });

  const categoryDistribution = await Topic.aggregate(categoryPipeline);

  /* 4. Weekly trend (last 7 days, respecting category filter) */
  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6
  );

  const weeklyMatch = {
    createdAt: { $gte: sevenDaysAgo },
    ...matchFilter,
  };

  const weeklyTrends = await Topic.aggregate([
    { $match: weeklyMatch },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ]);

  return {
    totalSubmissions,
    topTopics,
    categoryDistribution,
    weeklyTrends,
    selectedCategory: selected,
  };
}

exports.dashboard = async (req, res) => {
  // Legacy EJS dashboard removed. Keep route for backward compatibility by returning JSON.
  return exports.analyticsJson(req, res);
};

exports.analyticsJson = async (req, res) => {
  try {
    const selected =
      typeof req.query.category === "string" &&
      CATEGORIES.includes(req.query.category)
        ? req.query.category
        : "All";

    const matchFilter =
      selected === "All" ? {} : { category: selected };

    const analytics = await buildAnalytics(matchFilter, selected);

    res.json(analytics);
  } catch (err) {
    console.error("Analytics JSON error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};
