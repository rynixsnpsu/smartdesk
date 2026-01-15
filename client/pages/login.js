import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
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
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      if (data.success && data.user) {
        router.push(`/${data.user.role}`);
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - SmartDesk</title>
      </Head>
      <div className="min-h-screen bg-dark bg-grid flex items-center justify-center p-6">
        <div className="neon-card p-8 rounded-lg w-full max-w-md slide-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-neon neon-glow mb-2">
              SmartDesk
            </h1>
            <p className="text-gray-400">AI-Powered Feedback Intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username / Email
              </label>
              <input
                type="text"
                className="input-neon w-full rounded"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="input-neon w-full rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon btn-neon-primary w-full py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Made with 💚 by rynixofficial</p>
          </div>
        </div>
      </div>
    </>
  );
}
