import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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

export default function EventsDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "academic",
    status: "upcoming"
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
      const res = await fetch(`${API_BASE}/api/events`, { credentials: "include" });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = formData._id ? `${API_BASE}/api/events/${formData._id}` : `${API_BASE}/api/events`;
      const method = formData._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", description: "", startDate: "", endDate: "", location: "", category: "academic", status: "upcoming" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save event", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  return (
    <>
      <Head>
        <title>Events Management - SmartDesk Admin</title>
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
            <div className="block px-4 py-3 rounded border border-neon-pink/30 bg-neon-pink/10 text-neon-pink">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Events
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
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">Events Management</h1>
              <p className="text-gray-400">Create and manage university events</p>
            </div>
            <button
              onClick={() => {
                setFormData({ name: "", description: "", startDate: "", endDate: "", location: "", category: "academic", status: "upcoming" });
                setShowModal(true);
              }}
              className="btn-neon btn-neon-primary"
            >
              + Create Event
            </button>
          </header>

          <div className="futuristic-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left py-3 px-4 text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400">Start Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Location</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                    <td className="py-3 px-4 text-white font-semibold">{event.name}</td>
                    <td className="py-3 px-4 text-gray-400 capitalize">{event.category}</td>
                    <td className="py-3 px-4 text-neon-cyan">{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-400">{event.location}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        event.status === "upcoming"
                          ? "bg-blue-900/30 text-blue-300"
                          : event.status === "ongoing"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-gray-900/30 text-gray-300"
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setFormData({ ...event, startDate: new Date(event.startDate).toISOString().split("T")[0], endDate: new Date(event.endDate).toISOString().split("T")[0] });
                          setShowModal(true);
                        }}
                        className="btn-neon text-xs px-3 py-1 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
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
                  {formData._id ? "Edit Event" : "Create Event"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                      <input
                        type="date"
                        className="input-neon w-full rounded"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">End Date</label>
                      <input
                        type="date"
                        className="input-neon w-full rounded"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
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
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">
                      {formData._id ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ name: "", description: "", startDate: "", endDate: "", location: "", category: "academic", status: "upcoming" });
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
