const Topic = require("../models/Topic");
const { groupIntoThemes, computeSeverity } = require("../ai/themeCluster");
const { callOllama } = require("../ai/ollama");

function makeDeterministicSummary({ totalSubmissions, topTopics, themes }) {
  const top = (topTopics || []).slice(0, 3).map((t) => t.topic).filter(Boolean);
  const topTheme = (themes || [])[0];
  const themeLine = topTheme
    ? `Top theme is "${topTheme.title}" in ${topTheme.category} (votes: ${topTheme.votesTotal}).`
    : "No dominant theme yet.";

  return `Total submissions: ${totalSubmissions}. Top topics: ${top.join(", ") || "N/A"}. ${themeLine}`;
}

async function tryOllamaSummary(payload) {
  if (process.env.ENABLE_OLLAMA_SUMMARY !== "1") return null;

  const prompt = [
    "You are an analytics assistant for a university feedback platform.",
    "Summarize the key insights in 4-6 bullet points. Be concrete and action-oriented.",
    "Data (JSON):",
    JSON.stringify(payload).slice(0, 8000)
  ].join("\n");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 3000);
  try {
    const out = await callOllama(prompt);
    return out;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

exports.getInsights = async (req, res) => {
  try {
    const selectedCategory =
      typeof req.query.category === "string" && req.query.category.trim()
        ? req.query.category.trim()
        : "All";

    const matchFilter =
      selectedCategory === "All" ? {} : { category: selectedCategory };

    const totalSubmissions = await Topic.countDocuments(matchFilter);

    const topTopics = await Topic.find(matchFilter)
      .sort({ votes: -1 })
      .limit(10)
      .populate("createdBy", "username email");

    const topicsForThemes = await Topic.find(matchFilter).limit(500);
    const themes = await groupIntoThemes(topicsForThemes);

    const severityLeaderboard = topTopics
      .map((t) => ({
        _id: String(t._id),
        topic: t.topic,
        category: t.category,
        votes: t.votes,
        createdAt: t.createdAt,
        severity: computeSeverity(t)
      }))
      .sort((a, b) => b.severity - a.severity || b.votes - a.votes)
      .slice(0, 10);

    const payload = {
      selectedCategory,
      totalSubmissions,
      topTopics: topTopics.map((t) => ({
        _id: String(t._id),
        topic: t.topic,
        category: t.category,
        votes: t.votes,
        createdAt: t.createdAt
      })),
      themes: themes.slice(0, 10),
      severityLeaderboard
    };

    const aiSummary = await tryOllamaSummary(payload);
    const summary = aiSummary || makeDeterministicSummary(payload);

    res.json({
      ...payload,
      summary,
      summarySource: aiSummary ? "ollama" : "deterministic"
    });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "Failed to load insights" });
  }
};
