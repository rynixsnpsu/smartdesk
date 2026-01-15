import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCheck } from '@fortawesome/free-solid-svg-icons';

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

export default function AttendanceDashboard() {
  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ student: "", course: "", date: new Date().toISOString().split("T")[0], status: "present" });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
    fetch(`${API_BASE}/api/courses`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setCourses(data.courses || []))
      .catch(() => {});
    fetch(`${API_BASE}/api/users?role=student`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setStudents(data.users || []))
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance`, { credentials: "include" });
      const data = await res.json();
      setAttendance(data.attendance || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ student: "", course: "", date: new Date().toISOString().split("T")[0], status: "present" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to mark attendance", err);
    }
  };

  return (
    <>
      <Head>
        <title>Attendance Management - SmartDesk Admin</title>
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
            <div className="block px-4 py-3 rounded border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
              <span className="mr-2"><FontAwesomeIcon icon={faCheck} className="mr-2" /></span> Attendance
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
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">Attendance Management</h1>
              <p className="text-gray-400">Track and manage student attendance</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-neon btn-neon-primary"
            >
              + Mark Attendance
            </button>
          </header>

          <div className="futuristic-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left py-3 px-4 text-gray-400">Student</th>
                  <th className="text-left py-3 px-4 text-gray-400">Course</th>
                  <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                    <td className="py-3 px-4 text-white">{record.student?.username || "—"}</td>
                    <td className="py-3 px-4 text-gray-400">{record.course?.name || "—"}</td>
                    <td className="py-3 px-4 text-neon-cyan">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        record.status === "present"
                          ? "bg-green-900/30 text-green-300 border border-green-500/50"
                          : "bg-red-900/30 text-red-300 border border-red-500/50"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Mark Attendance</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Student</label>
                    <select
                      className="input-neon w-full rounded"
                      value={formData.student}
                      onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>{s.username}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Course</label>
                    <select
                      className="input-neon w-full rounded"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      className="input-neon w-full rounded"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Status</label>
                    <select
                      className="input-neon w-full rounded"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Save</button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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
