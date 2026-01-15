import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBullhorn } from '@fortawesome/free-solid-svg-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    
    // Check authentication and admin role
    const userRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      credentials: "include"
    }).then(r => r.json()).catch(() => ({ user: null }));

    const user = userRes.user;
    if (!user || user.role !== 'admin') {
      return { redirect: { destination: "/login", permanent: false } };
    }

    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function AnnouncementsDashboard() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
    publishedAt: new Date().toISOString().split("T")[0]
  });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/announcements`, { credentials: "include" });
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = formData._id ? `${API_BASE}/api/announcements/${formData._id}` : `${API_BASE}/api/announcements`;
      const method = formData._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", content: "", type: "general", priority: "normal", publishedAt: new Date().toISOString().split("T")[0] });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save announcement", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to delete announcement", err);
    }
  };

  return (
    <>
      <Head>
        <title>Announcements - SmartDesk Admin</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-neon-cyan/30 z-40 p-6">
          <div className="mb-8">
            <Link href="/admin" className="text-2xl font-bold neon-glow block">SmartDesk</Link>
            <p className="text-xs text-gray-400 mt-1">Admin Control Center</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded border border-neon-cyan/30 text-gray-400 hover:text-neon-cyan transition-all">
              <FontAwesomeIcon icon={faHome} className="mr-2" /> Dashboard
            </Link>
            <div className="block px-4 py-3 rounded border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
              <FontAwesomeIcon icon={faBullhorn} className="mr-2" /> Announcements
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
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">Announcements</h1>
              <p className="text-gray-400">Create and manage campus announcements</p>
            </div>
            <button
              onClick={() => {
                setFormData({ title: "", content: "", type: "general", priority: "normal", publishedAt: new Date().toISOString().split("T")[0] });
                setShowModal(true);
              }}
              className="btn-neon btn-neon-primary"
            >
              + Create Announcement
            </button>
          </header>

          <div className="futuristic-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left py-3 px-4 text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400">Priority</th>
                  <th className="text-left py-3 px-4 text-gray-400">Published</th>
                  <th className="text-right py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                    <td className="py-3 px-4 text-white font-semibold">{ann.title}</td>
                    <td className="py-3 px-4 text-gray-400 capitalize">{ann.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        ann.priority === "high"
                          ? "bg-red-900/30 text-red-300"
                          : ann.priority === "medium"
                          ? "bg-yellow-900/30 text-yellow-300"
                          : "bg-blue-900/30 text-blue-300"
                      }`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neon-cyan">{new Date(ann.publishedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setFormData({ ...ann, publishedAt: new Date(ann.publishedAt).toISOString().split("T")[0] });
                          setShowModal(true);
                        }}
                        className="btn-neon text-xs px-3 py-1 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ann._id)}
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
                  {formData._id ? "Edit Announcement" : "Create Announcement"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Content</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[120px] resize-y"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Category</label>
                      <select
                        className="input-neon w-full rounded"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="general">General</option>
                        <option value="academic">Academic</option>
                        <option value="event">Event</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Priority</label>
                      <select
                        className="input-neon w-full rounded"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        required
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Published Date</label>
                    <input
                      type="date"
                      className="input-neon w-full rounded"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">
                      {formData._id ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ title: "", content: "", category: "general", priority: "normal", publishedAt: new Date().toISOString().split("T")[0] });
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
