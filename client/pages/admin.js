import { fetchWithAuth } from "../lib/api";
import { BarChart, LineChart } from "../components/Charts";

export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    const query = context.query || {};
    const qs = query.category ? `?category=${encodeURIComponent(query.category)}` : "";
    const data = await fetchWithAuth(`/api/admin/analytics${qs}`, cookieHeader);
    const insights = await fetchWithAuth(`/api/admin/insights${qs}`, cookieHeader);
    return {
      props: {
        analytics: data,
        insights,
        selectedCategory: data.selectedCategory || "All"
      }
    };
  } catch {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    };
  }
}

export default function AdminDashboard({ analytics, insights, selectedCategory }) {
  const {
    totalSubmissions,
    categoryDistribution,
    weeklyTrends,
    topTopics
  } = analytics;

  const last7Total = (weeklyTrends || []).reduce((sum, w) => sum + (w.count || 0), 0);

  const categoryLabels = (categoryDistribution || []).map((c) => c._id || "Other");
  const categoryValues = (categoryDistribution || []).map((c) => c.count || 0);

  const weeklyLabels = (weeklyTrends || []).map((t) => {
    const { year, month, day } = t._id || {};
    if (!year) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
  const weeklyValues = (weeklyTrends || []).map((t) => t.count || 0);

  return (
    <main style={{ padding: "2.5rem 1.5rem", maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Admin Analytics</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Monitor submissions, categories, and weekly trends.
          </p>
        </div>
        <a href="/" style={{ fontSize: 13, color: "#4b5563" }}>
          Back to landing
        </a>
      </header>

      <section style={{ marginBottom: "1.75rem", display: "flex", justifyContent: "flex-end" }}>
        <form method="GET" action="/admin">
          <label style={{ fontSize: 13, marginRight: 8 }}>Category</label>
          <select
            name="category"
            defaultValue={selectedCategory === "All" ? "" : selectedCategory}
            onChange={(e) => e.target.form.submit()}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              fontSize: 13
            }}
          >
            <option value="">All</option>
            <option value="Academics">Academics</option>
            <option value="Faculty">Faculty</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Hostel">Hostel</option>
            <option value="Administration">Administration</option>
            <option value="Other">Other</option>
          </select>
        </form>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "1.25rem",
          marginBottom: "2rem"
        }}
      >
        <div style={{ background: "#fff", padding: "1.25rem 1.5rem", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
            Total submissions {selectedCategory !== "All" && `(${selectedCategory})`}
          </p>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalSubmissions}</div>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem 1.5rem", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Active categories</p>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {categoryDistribution ? categoryDistribution.length : 0}
          </div>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem 1.5rem", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Last 7 days</p>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{last7Total}</div>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1.5rem", background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Executive summary</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
              Source: {insights?.summarySource || "deterministic"}
            </p>
          </div>
          <div style={{ padding: "1rem 1.5rem", fontSize: 14, color: "#111827" }}>
            {insights?.summary || "No summary available."}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "1.25rem",
            marginBottom: "1.5rem"
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Category distribution</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                Submissions per category {selectedCategory !== "All" && `(filtered to ${selectedCategory})`}
              </p>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {categoryLabels.length === 0 ? (
                <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>No data yet.</p>
              ) : (
                <BarChart labels={categoryLabels} values={categoryValues} />
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Weekly trend (7 days)</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                Daily submissions over the last week
              </p>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {weeklyLabels.length === 0 ? (
                <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>No data yet.</p>
              ) : (
                <LineChart labels={weeklyLabels} values={weeklyValues} />
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
            gap: "1.25rem",
            marginBottom: "1.5rem"
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Top themes (clustering)</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                Deterministic clustering by category + keyword overlap
              </p>
            </div>
            <div style={{ padding: "0.75rem 1.5rem 1.25rem" }}>
              {(!insights?.themes || insights.themes.length === 0) ? (
                <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>No themes yet.</p>
              ) : (
                <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {insights.themes.slice(0, 5).map((th) => (
                    <li key={`${th.category}:${th.title}`} style={{ padding: "0.5rem 0" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{th.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>
                        {th.category} · {th.count} topics · {th.votesTotal} votes · severity {th.severity}/5
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Severity leaderboard</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                Heuristic: votes + recency → 1..5
              </p>
            </div>
            <div style={{ padding: "0.75rem 1.5rem 1.25rem" }}>
              {(!insights?.severityLeaderboard || insights.severityLeaderboard.length === 0) ? (
                <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>No severity data yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#6b7280", fontSize: 12 }}>
                      <th style={{ padding: "0.4rem 0" }}>Topic</th>
                      <th style={{ padding: "0.4rem 0" }}>Severity</th>
                      <th style={{ padding: "0.4rem 0", textAlign: "right" }}>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.severityLeaderboard.slice(0, 6).map((row) => (
                      <tr key={row._id}>
                        <td style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                          {row.topic}
                          <div style={{ color: "#9ca3af", fontSize: 12 }}>{row.category}</div>
                        </td>
                        <td style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                          {row.severity}/5
                        </td>
                        <td style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontWeight: 700 }}>
                          {row.votes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 14px 32px rgba(15,23,42,0.08)" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Top Topics</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
              Highest-voted themes from student feedback.
            </p>
          </div>
          <div style={{ padding: "0.75rem 1.5rem 1.25rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#6b7280", fontSize: 12 }}>
                  <th style={{ padding: "0.5rem 0" }}>Topic</th>
                  <th style={{ padding: "0.5rem 0" }}>Category</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Votes</th>
                </tr>
              </thead>
              <tbody>
                {!topTopics || topTopics.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: "0.75rem 0", color: "#9ca3af", textAlign: "center" }}>
                      No topics yet.
                    </td>
                  </tr>
                ) : (
                  topTopics.map((t) => (
                    <tr key={t._id || t.topic}>
                      <td style={{ padding: "0.6rem 0", borderBottom: "1px solid #f3f4f6" }}>{t.topic}</td>
                      <td style={{ padding: "0.6rem 0", borderBottom: "1px solid #f3f4f6" }}>{t.category}</td>
                      <td
                        style={{
                          padding: "0.6rem 0",
                          borderBottom: "1px solid #f3f4f6",
                          textAlign: "right",
                          fontWeight: 600
                        }}
                      >
                        {t.votes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

