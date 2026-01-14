import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }

      // Backend should redirect based on role; here we optimistically try both dashboards
      window.location.href = "/student";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "3rem 1.5rem", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          padding: "2rem",
          borderRadius: 16,
          boxShadow: "0 18px 45px rgba(15,23,42,0.12)"
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Login to Smart Desk</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Roll No / Username</label>
          <input
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              marginBottom: "0.75rem"
            }}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Password</label>
          <input
            type="password"
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              marginBottom: "1rem"
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "0.75rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              borderRadius: 999,
              border: "none",
              background: "#7B4CFF",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

