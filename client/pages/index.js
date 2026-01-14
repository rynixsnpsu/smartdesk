const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LandingPage() {
  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Smart Desk</h1>
        <p style={{ color: "#555" }}>
          AI-assisted student feedback intelligence for modern universities.
        </p>
      </header>

      <section style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
        <a
          href="/login"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#7B4CFF",
            color: "#fff",
            borderRadius: 999,
            fontWeight: 600
          }}
        >
          Get Started
        </a>
        <a
          href="/admin"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 999,
            fontWeight: 500
          }}
        >
          View Insights
        </a>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.5rem" }}>
        <div style={{ padding: "1.25rem", background: "#fff", borderRadius: 12, boxShadow: "0 8px 20px rgba(15,23,42,0.06)" }}>
          <h3>AI Topic Intelligence</h3>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Automatically cluster feedback into themes like Academics, Faculty, and Infrastructure.
          </p>
        </div>
        <div style={{ padding: "1.25rem", background: "#fff", borderRadius: 12, boxShadow: "0 8px 20px rgba(15,23,42,0.06)" }}>
          <h3>Admin Analytics</h3>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Get category distributions, weekly trends, and top student topics in one place.
          </p>
        </div>
        <div style={{ padding: "1.25rem", background: "#fff", borderRadius: 12, boxShadow: "0 8px 20px rgba(15,23,42,0.06)" }}>
          <h3>Student-first UX</h3>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Simple, fast feedback flow that never blocks on AI inference.
          </p>
        </div>
      </section>
    </main>
  );
}

