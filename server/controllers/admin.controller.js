const Topic = require("../models/Topic");
const User = require("../models/User");

const CATEGORIES = [
  "Academics",
  "Faculty",
  "Infrastructure",
  "Hostel",
  "Administration",
  "Other"
];

async function buildAnalytics(matchFilter, selected) {
  const totalSubmissions = await Topic.countDocuments(matchFilter);

  const topTopics = await Topic.find(matchFilter)
    .sort({ votes: -1 })
    .limit(5)
    .populate("createdBy", "username email");

  const categoryPipeline = [];
  if (Object.keys(matchFilter).length) {
    categoryPipeline.push({ $match: matchFilter });
  }
  categoryPipeline.push({
    $group: {
      _id: "$category",
      count: { $sum: 1 }
    }
  });

  const categoryDistribution = await Topic.aggregate(categoryPipeline);

  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6
  );

  const weeklyMatch = {
    createdAt: { $gte: sevenDaysAgo },
    ...matchFilter
  };

  const weeklyTrends = await Topic.aggregate([
    { $match: weeklyMatch },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1
      }
    }
  ]);

  return {
    totalSubmissions,
    topTopics,
    categoryDistribution,
    weeklyTrends,
    selectedCategory: selected
  };
}

/**
 * Get analytics JSON (admin only)
 */
exports.analyticsJson = async (req, res) => {
  try {
    const selected =
      typeof req.query.category === "string" &&
      CATEGORIES.includes(req.query.category)
        ? req.query.category
        : "All";

    const matchFilter = selected === "All" ? {} : { category: selected };

    const analytics = await buildAnalytics(matchFilter, selected);

    // Format for charts
    const categoryChartData = {
      labels: CATEGORIES,
      counts: CATEGORIES.map(
        (cat) =>
          analytics.categoryDistribution.find((d) => d._id === cat)?.count || 0
      )
    };

    const weeklyChartData = {
      labels: [],
      counts: []
    };

    const now = new Date();
    const sevenDaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      weeklyChartData.labels.push(dayNames[date.getDay()]);
      const dayData = analytics.weeklyTrends.find(
        (t) =>
          t._id.year === date.getFullYear() &&
          t._id.month === date.getMonth() + 1 &&
          t._id.day === date.getDate()
      );
      weeklyChartData.counts.push(dayData?.count || 0);
    }

    res.json({
      ...analytics,
      categoryChartData,
      weeklyChartData,
      categories: ["All", ...CATEGORIES]
    });
  } catch (err) {
    console.error("Analytics JSON error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};

/**
 * Get dashboard stats (admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTopics,
      totalVotes,
      activeUsers,
      recentTopics
    ] = await Promise.all([
      User.countDocuments(),
      Topic.countDocuments(),
      Topic.aggregate([{ $group: { _id: null, total: { $sum: "$votes" } } }]),
      User.countDocuments({ isActive: true }),
      Topic.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "username email")
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTopics,
        totalVotes: totalVotes[0]?.total || 0,
        activeUsers,
        recentTopics
      }
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};
