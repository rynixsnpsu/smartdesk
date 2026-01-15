import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faBook, faCheck, faMoneyBillWave, faBookOpen, faCalendarAlt, faComments } from '@fortawesome/free-solid-svg-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    
    // First, check authentication and get user data
    const userRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      credentials: "include"
    }).then(r => r.json()).catch(() => ({ user: null }));

    const user = userRes.user;
    // Check if user is authenticated and has student role
    if (!user || user.role !== 'student') {
      return {
        redirect: {
          destination: "/login",
          permanent: false
        }
      };
    }

    // Fetch all student data in parallel
    const [topics, enrollments, attendance, fees, books, events, announcements, notifications] = await Promise.all([
      fetch(`${API_BASE}/api/student/top-topics`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ topTopics: [] })),
      fetch(`${API_BASE}/api/enrollments/student/me`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ enrollments: [] })),
      fetch(`${API_BASE}/api/attendance?studentId=me`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ attendance: [] })),
      fetch(`${API_BASE}/api/fees?studentId=me`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ fees: [] })),
      fetch(`${API_BASE}/api/library/books?studentId=me`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ books: [] })),
      fetch(`${API_BASE}/api/events?status=upcoming`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ events: [] })),
      fetch(`${API_BASE}/api/announcements`).then(r => r.json()).catch(() => ({ announcements: [] })),
      fetch(`${API_BASE}/api/notifications`, { headers: { cookie: cookieHeader }, credentials: "include" }).then(r => r.json()).catch(() => ({ notifications: [] }))
    ]);

    console.log('Announcements fetched:', announcements.announcements); // Debug log

    return {
      props: {
        initialData: {
          topTopics: topics.topTopics || [],
          enrollments: enrollments.enrollments || [],
          attendance: attendance.attendance || [],
          fees: fees.fees || [],
          books: books.books || [],
          events: events.events || [],
          announcements: announcements.announcements || [],
          notifications: notifications.notifications || [],
          user: user
        }
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

export default function StudentDashboard({ initialData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(initialData);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/student/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic, description })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit feedback");
      }

      const result = await res.json();
      setMessage(result.message || "Feedback submitted successfully!");
      setTopic("");
      setDescription("");

      // Refresh topics
      const refreshed = await fetch(`${API_BASE}/api/student/top-topics`, { credentials: "include" });
      const refreshedData = await refreshed.json();
      setData({ ...data, topTopics: refreshedData.topTopics || [] });
    } catch (err) {
      setMessage(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Always fetch announcements to ensure they're loaded
    console.log('Fetching announcements client-side...'); // Debug log
    fetch(`${API_BASE}/api/announcements`)
      .then(r => r.json())
      .then(result => {
        console.log('Client-side announcements result:', result); // Debug log
        if (result.announcements && result.announcements.length > 0) {
          setData(prev => ({ ...prev, announcements: result.announcements }));
        }
      })
      .catch(err => console.error("Failed to fetch announcements:", err));
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: faChartBar },
    { id: "courses", label: "Courses", icon: faBook },
    { id: "attendance", label: "Attendance", icon: faCheck },
    { id: "fees", label: "Fees", icon: faMoneyBillWave },
    { id: "library", label: "Library", icon: faBookOpen },
    { id: "events", label: "Events", icon: faCalendarAlt },
    { id: "feedback", label: "Feedback", icon: faComments }
  ];

  return (
    <>
      <Head>
        <title>Student Dashboard - SmartDesk</title>
      </Head>
      <div className="min-h-screen bg-dark bg-grid">
        {/* Navbar */}
        <nav className="relative z-10 p-6 flex justify-between items-center border-b border-neon-cyan/30">
          <div className="text-2xl font-bold neon-glow">SmartDesk</div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-400">{data.user?.username || "Student"}</span>
            <button onClick={handleLogout} className="btn-neon text-sm px-4 py-2">
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Student Dashboard</h1>
            <p className="text-gray-400">Your complete university portal</p>
          </header>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-neon-cyan/30 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-neon-cyan border-b-2 border-neon-cyan"
                    : "text-gray-400 hover:text-neon-pink"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="neon-card p-6 rounded-lg">
                <h3 className="text-xl font-bold text-neon-cyan mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Enrolled Courses</span>
                    <span className="text-neon-cyan font-bold">{data.enrollments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending Fees</span>
                    <span className="text-neon-pink font-bold">
                      {data.fees.filter(f => f.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Books Issued</span>
                    <span className="text-neon-green font-bold">{data.books.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unread Notifications</span>
                    <span className="text-neon-purple font-bold">
                      {data.notifications.filter(n => !n.isRead).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="neon-card p-6 rounded-lg">
                <h3 className="text-xl font-bold text-neon-pink mb-4">Recent Announcements</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.announcements && data.announcements.length > 0 ? (
                    data.announcements.slice(0, 5).map((ann) => (
                      <div key={ann._id} className="border-b border-neon-cyan/20 pb-2">
                        <div className="font-semibold text-white text-sm">{ann.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{ann.type}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No announcements available</div>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="neon-card p-6 rounded-lg">
                <h3 className="text-xl font-bold text-neon-green mb-4">Upcoming Events</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.events.slice(0, 5).map((event) => (
                    <div key={event._id} className="border-b border-neon-cyan/20 pb-2">
                      <div className="font-semibold text-white text-sm">{event.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="neon-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">My Courses</h2>
              {data.enrollments.length === 0 ? (
                <p className="text-gray-500">No courses enrolled</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neon-cyan/30">
                        <th className="text-left py-2 text-gray-400">Course</th>
                        <th className="text-left py-2 text-gray-400">Semester</th>
                        <th className="text-left py-2 text-gray-400">Grade</th>
                        <th className="text-left py-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.enrollments.map((enrollment) => (
                        <tr key={enrollment._id} className="border-b border-neon-cyan/10">
                          <td className="py-3 text-white">{enrollment.course?.name || "N/A"}</td>
                          <td className="py-3 text-gray-400">{enrollment.semester}</td>
                          <td className="py-3 text-neon-cyan font-bold">{enrollment.grade || "I"}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 rounded text-xs bg-neon-blue/20 text-neon-blue">
                              {enrollment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="neon-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-neon-pink mb-4">Attendance</h2>
              {data.attendance.length === 0 ? (
                <p className="text-gray-500">No attendance records</p>
              ) : (
                <div className="space-y-4">
                  {data.attendance.map((record) => (
                    <div key={record._id} className="border-b border-neon-cyan/20 pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">{record.course?.name || "N/A"}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm ${
                          record.status === "present" ? "bg-green-900/30 text-green-300" :
                          record.status === "absent" ? "bg-red-900/30 text-red-300" :
                          "bg-yellow-900/30 text-yellow-300"
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === "fees" && (
            <div className="neon-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-neon-green mb-4">Fee Status</h2>
              {data.fees.length === 0 ? (
                <p className="text-gray-500">No fee records</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neon-cyan/30">
                        <th className="text-left py-2 text-gray-400">Type</th>
                        <th className="text-left py-2 text-gray-400">Amount</th>
                        <th className="text-left py-2 text-gray-400">Paid</th>
                        <th className="text-left py-2 text-gray-400">Due Date</th>
                        <th className="text-left py-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fees.map((fee) => (
                        <tr key={fee._id} className="border-b border-neon-cyan/10">
                          <td className="py-3 text-white capitalize">{fee.type}</td>
                          <td className="py-3 text-gray-400">₹{fee.amount}</td>
                          <td className="py-3 text-gray-400">₹{fee.paidAmount || 0}</td>
                          <td className="py-3 text-gray-400">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              fee.status === "paid" ? "bg-green-900/30 text-green-300" :
                              fee.status === "pending" ? "bg-red-900/30 text-red-300" :
                              "bg-yellow-900/30 text-yellow-300"
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Library Tab */}
          {activeTab === "library" && (
            <div className="neon-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-neon-purple mb-4">Library Books</h2>
              {data.books.length === 0 ? (
                <p className="text-gray-500">No books issued</p>
              ) : (
                <div className="space-y-4">
                  {data.books.map((book) => (
                    <div key={book._id} className="border-b border-neon-cyan/20 pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">{book.book?.title || "N/A"}</div>
                          <div className="text-sm text-gray-400">Due: {new Date(book.dueDate).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm ${
                          book.status === "issued" ? "bg-neon-cyan/20 text-neon-cyan" :
                          book.status === "overdue" ? "bg-red-900/30 text-red-300" :
                          "bg-green-900/30 text-green-300"
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="grid md:grid-cols-2 gap-6">
              {data.events.map((event) => (
                <div key={event._id} className="neon-card p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-neon-cyan mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{event.location || "TBA"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-neon-pink capitalize">{event.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === "feedback" && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 neon-card p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">Submit Feedback</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., WiFi issues in hostel"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[120px] resize-y"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>
                  {message && (
                    <div className={`p-3 rounded border ${
                      message.includes("success") ? "bg-green-900/30 border-green-500/50 text-green-300" :
                      "bg-red-900/30 border-red-500/50 text-red-300"
                    }`}>
                      {message}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-neon btn-neon-primary w-full py-3 rounded disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>
              </div>
              <div className="neon-card p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-neon-pink mb-4">Top Topics</h2>
                {data.topTopics.length === 0 ? (
                  <p className="text-gray-500 text-sm">No topics yet</p>
                ) : (
                  <ul className="space-y-3">
                    {data.topTopics.map((t) => (
                      <li key={t._id} className="border-b border-neon-cyan/20 pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">{t.topic}</div>
                            <div className="text-xs text-gray-400">{t.category}</div>
                          </div>
                          <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-xs font-bold">
                            {t.votes}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
