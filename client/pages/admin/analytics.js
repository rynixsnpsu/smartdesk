import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { BarChart, LineChart } from "../../components/Charts";
import { fetchWithAuth } from "../../lib/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartBar } from '@fortawesome/free-solid-svg-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    
    // Check authentication and admin role first
    const userRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      credentials: "include"
    }).then(r => r.json()).catch(() => ({ user: null }));

    const user = userRes.user;
    if (!user || user.role !== 'admin') {
      return { redirect: { destination: "/login", permanent: false } };
    }

    const query = context.query || {};
    const qs = query.category ? `?category=${encodeURIComponent(query.category)}` : "";
    const [analytics, insights] = await Promise.all([
      fetchWithAuth(`/api/admin/analytics${qs}`, cookieHeader),
      fetchWithAuth(`/api/admin/insights${qs}`, cookieHeader)
    ]);
    return {
      props: {
        analytics,
        insights,
        selectedCategory: analytics.selectedCategory || "All"
      }
    };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function AnalyticsDashboard({ analytics, insights, selectedCategory: initialCategory }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  const categoryChartData = analytics?.categoryChartData || { labels: [], counts: [] };
  const weeklyChartData = analytics?.weeklyChartData || { labels: [], counts: [] };
  const last7Total = weeklyChartData.counts.reduce((a, b) => a + b, 0);

  return (
    <>
      <Head>
        <title>Analytics - SmartDesk Admin</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-neon-cyan/30 z-40 p-6">
          <div className="mb-8">
            <Link href="/admin" className="text-2xl font-bold neon-glow block">SmartDesk</Link>
            <p className="text-xs text-gray-400 mt-1">Admin Control Center</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded border border-neon-cyan/30 text-gray-400 hover:text-neon-cyan transition-all">
              <span className="mr-2"><FontAwesomeIcon icon={faHome} /></span> Dashboard
            </Link>
            <div className="block px-4 py-3 rounded border border-neon-green/30 bg-neon-green/10 text-neon-green">
              <span className="mr-2"><FontAwesomeIcon icon={faChartBar} /></span> Analytics
            </div>
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <button onClick={handleLogout} className="w-full btn-neon btn-neon-danger text-sm py-2">
              Logout
            </button>
          </div>
        </aside>

        <main className="ml-64 p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive insights and statistics</p>
          </header>

          <div className="mb-6 flex justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                router.push(`/admin/analytics?category=${e.target.value === "All" ? "" : e.target.value}`);
              }}
              className="input-neon rounded"
            >
              <option value="All">All Categories</option>
              {["Academics", "Faculty", "Infrastructure", "Hostel", "Administration", "Other"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="futuristic-card">
              <div className="text-sm text-gray-400 mb-2">Total Submissions</div>
              <div className="text-4xl font-bold text-gradient-neon">{analytics?.totalSubmissions || 0}</div>
            </div>
            <div className="futuristic-card">
              <div className="text-sm text-gray-400 mb-2">Active Categories</div>
              <div className="text-4xl font-bold text-gradient-neon">
                {analytics?.categoryDistribution?.length || 0}
              </div>
            </div>
            <div className="futuristic-card">
              <div className="text-sm text-gray-400 mb-2">Last 7 Days</div>
              <div className="text-4xl font-bold text-gradient-neon">{last7Total}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="futuristic-card">
              <h3 className="text-xl font-bold text-neon-cyan mb-4">Category Distribution</h3>
              {categoryChartData.labels.length > 0 ? (
                <BarChart labels={categoryChartData.labels} values={categoryChartData.counts} />
              ) : (
                <p className="text-gray-500">No data yet</p>
              )}
            </div>
            <div className="futuristic-card">
              <h3 className="text-xl font-bold text-neon-pink mb-4">Weekly Trend</h3>
              {weeklyChartData.labels.length > 0 ? (
                <LineChart labels={weeklyChartData.labels} values={weeklyChartData.counts} />
              ) : (
                <p className="text-gray-500">No data yet</p>
              )}
            </div>
          </div>

          {insights && (
            <div className="futuristic-card">
              <h3 className="text-xl font-bold text-neon-green mb-4">Executive Summary</h3>
              <p className="text-gray-300 whitespace-pre-line">{insights.summary}</p>
              <p className="text-xs text-gray-500 mt-2">Source: {insights.summarySource}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
