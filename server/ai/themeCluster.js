/**
 * Deterministic theme clustering (NO AI dependency).
 * - Groups by category first
 * - Within category, merges topics with keyword overlap
 *
 * This is intentionally lightweight for production demos and acts as a
 * deterministic fallback for any AI-driven clustering.
 */

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "it",
    "this",
    "that",
    "we",
    "i",
    "you",
    "they",
    "he",
    "she",
    "as",
    "at",
    "by",
    "from",
    "into",
    "not",
    "no",
    "too",
    "very",
  ]);

  return normalizeText(s)
    .split(" ")
    .filter((w) => w.length >= 3 && !stop.has(w));
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function computeSeverity(topicDoc) {
  const votes = Number(topicDoc?.votes || 0);
  const createdAt = topicDoc?.createdAt ? new Date(topicDoc.createdAt) : null;
  const ageDays =
    createdAt instanceof Date && !Number.isNaN(createdAt.valueOf())
      ? Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

  // Heuristic: high votes + recent activity => higher severity (1..5)
  const voteScore = Math.log10(Math.max(1, votes)) * 2; // 0..~
  const recencyScore = ageDays <= 7 ? 2 : ageDays <= 30 ? 1 : 0;
  const raw = 1 + voteScore + recencyScore;
  return Math.max(1, Math.min(5, Math.round(raw)));
}

async function groupIntoThemes(topics, { similarityThreshold = 0.25 } = {}) {
  const byCategory = new Map();
  for (const t of topics || []) {
    const cat = t.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(t);
  }

  const result = [];

  for (const [category, docs] of byCategory.entries()) {
    const clusters = [];

    for (const doc of docs) {
      const text = `${doc.topic || ""} ${doc.description || ""}`;
      const tokens = tokenize(text);

      let bestIdx = -1;
      let bestScore = 0;
      for (let i = 0; i < clusters.length; i++) {
        const score = jaccard(tokens, clusters[i].tokens);
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      if (bestIdx !== -1 && bestScore >= similarityThreshold) {
        const c = clusters[bestIdx];
        c.items.push(doc);
        c.tokens = Array.from(new Set(c.tokens.concat(tokens)));
        c.votesTotal += Number(doc.votes || 0);
        c.severityMax = Math.max(c.severityMax, computeSeverity(doc));
      } else {
        clusters.push({
          title: doc.topic || "Untitled",
          tokens,
          items: [doc],
          votesTotal: Number(doc.votes || 0),
          severityMax: computeSeverity(doc),
        });
      }
    }

    const themes = clusters
      .map((c) => ({
        category,
        title: c.title,
        count: c.items.length,
        votesTotal: c.votesTotal,
        severity: c.severityMax,
        topics: c.items
          .sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0))
          .slice(0, 5)
          .map((t) => ({
            _id: String(t._id || ""),
            topic: t.topic,
            votes: t.votes,
            createdAt: t.createdAt,
          })),
      }))
      .sort((a, b) => b.votesTotal - a.votesTotal);

    result.push(...themes);
  }

  return result.sort((a, b) => b.votesTotal - a.votesTotal);
}

module.exports = { groupIntoThemes, computeSeverity };

