const { callOllama } = require("./ollama");

/**
 * Find similar topic using Gemma (Ollama)
 */
async function findSimilarTopic(newTopic, existingTopics) {
  if (!existingTopics || existingTopics.length === 0) {
    return { matched: false };
  }

  const prompt = `
You are clustering university feedback topics.

Existing topics:
${existingTopics.map(t => `- ${t}`).join("\n")}

New topic:
"${newTopic}"

Rules:
- Reply ONLY in JSON
- If similar, reply:
  {"matched": true, "matchedTopic": "<exact existing topic>"}
- If not similar, reply:
  {"matched": false}
`;

  try {
    const output = await callOllama(prompt);
    return JSON.parse(output);
  } catch (err) {
    console.error("⚠️ Gemma similarity error:", err.message);
    return { matched: false };
  }
}

module.exports = { findSimilarTopic };
