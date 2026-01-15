import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

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

    const data = await fetch(`${API_BASE}/api/topics`, {
      headers: { cookie: cookieHeader },
      credentials: "include"
    }).then(r => r.json()).catch(() => ({ topics: [] }));
    return { props: { initialTopics: data.topics || [] } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function TopicsDashboard({ initialTopics }) {
  const router = useRouter();
  const [topics, setTopics] = useState(initialTopics);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({ topic: "", description: "", category: "Other", status: "open" });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/topics`, { credentials: "include" });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTopic
        ? `${API_BASE}/api/topics/${editingTopic._id}`
        : `${API_BASE}/api/topics`;
      const method = editingTopic ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingTopic(null);
        setFormData({ topic: "", description: "", category: "Other", status: "open" });
        fetchTopics();
      }
    } catch (err) {
      console.error("Failed to save topic", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchTopics();
    } catch (err) {
      console.error("Failed to delete topic", err);
    }
  };

  const categories = ["Academics", "Faculty", "Infrastructure", "Hostel", "Administration", "Other"];

  return (
    <>
      <Head>
        <title>Feedback Topics - SmartDesk Admin</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-neon-cyan/30 z-40 p-6">
          <div className="mb-8">
            <Link href="/admin" className="text-2xl font-bold neon-glow block">SmartDesk</Link>
            <p className="text-xs text-gray-400 mt-1">Admin Control Center</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded border border-neon-cyan/30 text-gray-400 hover:text-neon-cyan transition-all">
              <span className="mr-2">🏠</span> Dashboard
            </Link>
            <div className="block px-4 py-3 rounded border border-neon-purple/30 bg-neon-purple/10 text-neon-purple">
              <span className="mr-2">💬</span> Topics
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
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">Feedback Topics</h1>
              <p className="text-gray-400">Manage student feedback topics</p>
            </div>
            <button
              onClick={() => {
                setEditingTopic(null);
                setFormData({ topic: "", description: "", category: "Other", status: "open" });
                setShowModal(true);
              }}
              className="btn-neon btn-neon-primary"
            >
              + Create Topic
            </button>
          </header>

          <div className="futuristic-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left py-3 px-4 text-gray-400">Topic</th>
                  <th className="text-left py-3 px-4 text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400">Votes</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                    <td className="py-3 px-4 text-white font-semibold">{topic.topic}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-md truncate">{topic.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded text-xs bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50">
                        {topic.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neon-pink font-bold">{topic.votes || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        topic.status === "open"
                          ? "bg-green-900/30 text-green-300"
                          : topic.status === "resolved"
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-gray-900/30 text-gray-300"
                      }`}>
                        {topic.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingTopic(topic);
                          setFormData({
                            topic: topic.topic,
                            description: topic.description,
                            category: topic.category,
                            status: topic.status
                          });
                          setShowModal(true);
                        }}
                        className="btn-neon text-xs px-3 py-1 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic._id)}
                        className="btn-neon btn-neon-danger text-xs px-3 py-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">
                  {editingTopic ? "Edit Topic" : "Create Topic"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Topic</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[100px] resize-y"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Category</label>
                      <select
                        className="input-neon w-full rounded"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Status</label>
                      <select
                        className="input-neon w-full rounded"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                      >
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">
                      {editingTopic ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTopic(null);
                        setFormData({ topic: "", description: "", category: "Other", status: "open" });
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
