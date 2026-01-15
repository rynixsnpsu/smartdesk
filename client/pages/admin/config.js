import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog, faBook, faMoneyBillWave, faBookOpen, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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

    const data = await fetch(`${API_BASE}/api/config`, {
      headers: { cookie: cookieHeader },
      credentials: "include"
    }).then(r => r.json()).catch(() => ({ configs: {}, stats: {} }));
    return { props: { configs: data.configs || {}, stats: data.stats || {} } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function ConfigDashboard({ configs: initialConfigs, stats }) {
  const router = useRouter();
  const [configs, setConfigs] = useState(initialConfigs);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: "general", key: "", value: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState("general");

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config`, { credentials: "include" });
      const data = await res.json();
      setConfigs(data.configs || {});
    } catch (err) {
      console.error("Failed to fetch configs", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ category: "general", key: "", value: "", description: "" });
        fetchConfigs();
      }
    } catch (err) {
      console.error("Failed to update config", err);
    }
  };

  const handleUpdateValue = async (category, key, newValue) => {
    try {
      await fetch(`${API_BASE}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category, key, value: newValue })
      });
      fetchConfigs();
    } catch (err) {
      console.error("Failed to update config", err);
    }
  };

  const categories = [
    { id: "academic", name: "Academic", icon: <FontAwesomeIcon icon={faBook} className="mr-2" />, color: "green" },
    { id: "financial", name: "Financial", icon: <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />, color: "pink" },
    { id: "hostel", name: "Hostel", icon: <FontAwesomeIcon icon={faHome} className="mr-2" />, color: "purple" },
    { id: "library", name: "Library", icon: <FontAwesomeIcon icon={faBookOpen} className="mr-2" />, color: "cyan" },
    { id: "general", name: "General", icon: <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />, color: "blue" },
    { id: "ai", name: "AI Settings", icon: <FontAwesomeIcon icon={faCog} className="mr-2" />, color: "green" }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: "border-neon-cyan text-neon-cyan",
      pink: "border-neon-pink text-neon-pink",
      green: "border-neon-green text-neon-green",
      blue: "border-neon-blue text-neon-blue",
      purple: "border-neon-purple text-neon-purple"
    };
    return colors[color] || colors.cyan;
  };

  const categoryConfigs = configs[selectedCategory] || {};

  return (
    <>
      <Head>
        <title>Configuration - SmartDesk Admin</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-neon-cyan/30 z-40 p-6">
          <div className="mb-8">
            <Link href="/admin" className="text-2xl font-bold neon-glow block">SmartDesk</Link>
            <p className="text-xs text-gray-400 mt-1">Admin Control Center</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded border border-neon-cyan/30 text-gray-400 hover:text-neon-cyan transition-all">
              <span className="mr-2"><FontAwesomeIcon icon={faHome} className="mr-2" /></span> Dashboard
            </Link>
            <div className="block px-4 py-3 rounded border border-neon-pink/30 bg-neon-pink/10 text-neon-pink">
              <span className="mr-2"><FontAwesomeIcon icon={faCog} className="mr-2" /></span> Configuration
            </div>
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <button onClick={handleLogout} className="w-full btn-neon btn-neon-danger text-sm py-2">
              Logout
            </button>
          </div>
        </aside>

        <main className="ml-64 p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">System Configuration</h1>
              <p className="text-gray-400">Configure all system settings easily</p>
            </div>
            <button
              onClick={() => {
                setFormData({ category: selectedCategory, key: "", value: "", description: "" });
                setShowModal(true);
              }}
              className="btn-neon btn-neon-primary"
            >
              + Add Configuration
            </button>
          </header>

          {/* System Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="futuristic-card text-center">
              <div className="text-2xl font-bold text-neon-cyan">{stats.departments || 0}</div>
              <div className="text-sm text-gray-400">Departments</div>
            </div>
            <div className="futuristic-card text-center">
              <div className="text-2xl font-bold text-neon-pink">{stats.courses || 0}</div>
              <div className="text-sm text-gray-400">Courses</div>
            </div>
            <div className="futuristic-card text-center">
              <div className="text-2xl font-bold text-neon-green">{stats.buildings || 0}</div>
              <div className="text-sm text-gray-400">Buildings</div>
            </div>
            <div className="futuristic-card text-center">
              <div className="text-2xl font-bold text-neon-purple">{stats.users || 0}</div>
              <div className="text-sm text-gray-400">Users</div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4 mb-6 border-b border-neon-cyan/30 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `text-${cat.color === "cyan" ? "neon-cyan" : cat.color === "pink" ? "neon-pink" : cat.color === "green" ? "neon-green" : cat.color === "blue" ? "neon-blue" : "neon-purple"} border-b-2 border-${cat.color === "cyan" ? "neon-cyan" : cat.color === "pink" ? "neon-pink" : cat.color === "green" ? "neon-green" : cat.color === "blue" ? "neon-blue" : "neon-purple"}`
                    : "text-gray-400 hover:text-neon-cyan"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Configurations */}
          <div className="futuristic-card">
            <h3 className="text-xl font-bold text-gradient-neon mb-6 flex items-center gap-2">
              <span>{categories.find(c => c.id === selectedCategory)?.icon}</span>
              {categories.find(c => c.id === selectedCategory)?.name} Settings
            </h3>
            {Object.keys(categoryConfigs).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No configurations for this category. Click "Add Configuration" to create one.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(categoryConfigs).map(([key, value]) => (
                  <div key={key} className="border border-neon-cyan/20 p-4 rounded hover:border-neon-cyan/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-semibold text-neon-cyan">{key}</div>
                      <button
                        onClick={() => {
                          const newValue = prompt("Enter new value:", String(value));
                          if (newValue !== null) handleUpdateValue(selectedCategory, key, newValue);
                        }}
                        className="text-xs text-neon-pink hover:text-neon-cyan"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-gray-300 break-all">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Add Configuration</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Category</label>
                    <select
                      className="input-neon w-full rounded"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Key</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., max_enrollment_per_student"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Value</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[80px] resize-y"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Configuration description..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Save</button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ category: selectedCategory, key: "", value: "", description: "" });
                      }}
                      className="btn-neon flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
