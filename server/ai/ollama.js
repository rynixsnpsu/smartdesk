const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "gemma:2b";

/**
 * Call Ollama with a prompt using native fetch
 */
async function callOllama(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error: ${text}`);
  }

  const data = await response.json();
  return data.response.trim();
}

module.exports = { callOllama };
