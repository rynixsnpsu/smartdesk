import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook } from '@fortawesome/free-solid-svg-icons';

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

export default function AcademicDashboard() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState("departments");
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "" });
  const [courseForm, setCourseForm] = useState({ code: "", name: "", description: "", department: "", credits: 3, semester: 1 });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "departments") {
        const res = await fetch(`${API_BASE}/api/departments`, { credentials: "include" });
        const data = await res.json();
        setDepartments(data.departments || []);
      } else if (activeTab === "courses") {
        const res = await fetch(`${API_BASE}/api/courses`, { credentials: "include" });
        const data = await res.json();
        setCourses(data.courses || []);
      } else if (activeTab === "enrollments") {
        const res = await fetch(`${API_BASE}/api/enrollments`, { credentials: "include" });
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(deptForm)
      });
      if (res.ok) {
        setShowDeptModal(false);
        setDeptForm({ name: "", code: "", description: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create department", err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        setShowCourseModal(false);
        setCourseForm({ code: "", name: "", description: "", department: "", credits: 3, semester: 1 });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create course", err);
    }
  };

  return (
    <>
      <Head>
        <title>Academic Management - SmartDesk Admin</title>
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
            <div className="block px-4 py-3 rounded border border-neon-green/30 bg-neon-green/10 text-neon-green">
              <FontAwesomeIcon icon={faBook} className="mr-2" /> Academic
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
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Academic Management</h1>
            <p className="text-gray-400">Manage departments, courses, and enrollments</p>
          </header>

          <div className="flex gap-4 mb-6 border-b border-neon-cyan/30">
            {["departments", "courses", "enrollments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-neon-green border-b-2 border-neon-green"
                    : "text-gray-400 hover:text-neon-cyan"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "departments" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeptModal(true)}
                  className="btn-neon btn-neon-primary"
                >
                  + Create Department
                </button>
              </div>
              <div className="futuristic-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-neon-green font-bold">{dept.code}</td>
                        <td className="py-3 px-4 text-white">{dept.name}</td>
                        <td className="py-3 px-4 text-gray-400">{dept.description || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded text-xs ${
                            dept.isActive ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                          }`}>
                            {dept.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="btn-neon btn-neon-primary"
                >
                  + Create Course
                </button>
              </div>
              <div className="futuristic-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Department</th>
                      <th className="text-left py-3 px-4 text-gray-400">Credits</th>
                      <th className="text-left py-3 px-4 text-gray-400">Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-neon-green font-bold">{course.code}</td>
                        <td className="py-3 px-4 text-white">{course.name}</td>
                        <td className="py-3 px-4 text-gray-400">{course.department?.name || "—"}</td>
                        <td className="py-3 px-4 text-neon-cyan">{course.credits}</td>
                        <td className="py-3 px-4 text-gray-400">{course.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div className="futuristic-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Student</th>
                      <th className="text-left py-3 px-4 text-gray-400">Course</th>
                      <th className="text-left py-3 px-4 text-gray-400">Semester</th>
                      <th className="text-left py-3 px-4 text-gray-400">Grade</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-white">{enrollment.student?.username || "—"}</td>
                        <td className="py-3 px-4 text-gray-400">{enrollment.course?.name || "—"}</td>
                        <td className="py-3 px-4 text-neon-cyan">{enrollment.semester}</td>
                        <td className="py-3 px-4 text-neon-green font-bold">{enrollment.grade || "I"}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded text-xs bg-neon-blue/20 text-neon-blue">
                            {enrollment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Department Modal */}
          {showDeptModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Create Department</h3>
                <form onSubmit={handleCreateDept} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Code</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[100px] resize-y"
                      value={deptForm.description}
                      onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Create</button>
                    <button
                      type="button"
                      onClick={() => setShowDeptModal(false)}
                      className="btn-neon flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Course Modal */}
          {showCourseModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Create Course</h3>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Code</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Department</label>
                    <select
                      className="input-neon w-full rounded"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Credits</label>
                      <input
                        type="number"
                        className="input-neon w-full rounded"
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                        min="1"
                        max="10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Semester</label>
                      <input
                        type="number"
                        className="input-neon w-full rounded"
                        value={courseForm.semester}
                        onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) })}
                        min="1"
                        max="8"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      className="input-neon w-full rounded min-h-[100px] resize-y"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Create</button>
                    <button
                      type="button"
                      onClick={() => setShowCourseModal(false)}
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
