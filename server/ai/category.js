const { callOllama } = require("./ollama");

const CATEGORIES = [
  "Academics",
  "Faculty",
  "Infrastructure",
  "Hostel",
  "Administration",
  "Other"
];

async function classifyCategory(topic, description) {
  const prompt = `
Classify this student feedback into ONE category only.

Categories:
${CATEGORIES.join(", ")}

Topic:
"${topic}"

Description:
"${description}"

Rules:
- Reply ONLY with the category name
- If unsure, reply "Other"
`;

  try {
    const output = await callOllama(prompt);

    if (CATEGORIES.includes(output)) {
      return output;
    }

    return "Other";
  } catch (err) {
    console.error("⚠️ Gemma category error:", err.message);
    return "Other";
  }
}

module.exports = { classifyCategory };
