import { useState } from "react";
import { fetchWithAuth } from "../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    const data = await fetchWithAuth("/api/student/top-topics", cookieHeader);
    return { props: { initialTopTopics: data.topTopics || [] } };
  } catch {
    // If unauthorized, send user to login
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    };
  }
}

export default function StudentDashboard({ initialTopTopics }) {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [topTopics, setTopTopics] = useState(initialTopTopics || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/student/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ topic, description })
      });
      const text = await res.text();
      setMessage(text);
      setTopic("");
      setDescription("");

      // Optimistically refresh top topics list
      try {
        const refreshed = await fetchWithAuth("/api/student/top-topics");
        setTopTopics(refreshed.topTopics || []);
      } catch {
        // ignore refresh errors, submission already succeeded
      }
    } catch (err) {
      setMessage(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Student Dashboard</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Submit feedback and see which topics are trending across campus.
          </p>
        </div>
        <a href="/" style={{ fontSize: 13, color: "#4b5563" }}>
          Back to landing
        </a>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1.4fr)", gap: "1.75rem" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem 1.75rem", boxShadow: "0 16px 40px rgba(15,23,42,0.08)" }}>
          <h3 style={{ marginBottom: "1rem" }}>Submit Feedback</h3>
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Topic</label>
            <input
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginBottom: "0.9rem"
              }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="e.g., WiFi issues in hostel"
            />

            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Description</label>
            <textarea
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                minHeight: 120,
                resize: "vertical",
                marginBottom: "1rem"
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the issue with enough detail to be actionable."
            />

            {message && (
              <p style={{ fontSize: 13, marginBottom: "0.75rem", color: "#065f46" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.65rem 1.4rem",
                borderRadius: 999,
                border: "none",
                background: "#10b981",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem 1.5rem", boxShadow: "0 16px 40px rgba(15,23,42,0.08)" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Top Topics</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1rem" }}>
              These topics have attracted the most student attention recently.
            </p>
            {(!topTopics || topTopics.length === 0) && (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                No topics yet. Be the first to submit feedback!
              </p>
            )}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {topTopics &&
                topTopics.map((t) => (
                  <li
                    key={t._id}
                    style={{
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.topic}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{t.category}</div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "0.25rem 0.6rem",
                          borderRadius: 999,
                          background: "#eff6ff",
                          color: "#1d4ed8"
                        }}
                      >
                        {t.votes} votes
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

