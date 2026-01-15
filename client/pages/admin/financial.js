import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

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

export default function FinancialDashboard() {
  const router = useRouter();
  const [fees, setFees] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [activeTab, setActiveTab] = useState("fees");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ student: "", description: "", amount: 0, dueDate: "", status: "pending" });
  const [scholarshipForm, setScholarshipForm] = useState({ student: "", amount: 0, description: "", status: "active" });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "fees") {
        const res = await fetch(`${API_BASE}/api/financial/fees`, { credentials: "include" });
        const data = await res.json();
        setFees(data.fees || []);
      } else {
        const res = await fetch(`${API_BASE}/api/financial/scholarships`, { credentials: "include" });
        const data = await res.json();
        setScholarships(data.scholarships || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/financial/fees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(feeForm)
      });
      if (res.ok) {
        setShowFeeModal(false);
        setFeeForm({ student: "", description: "", amount: 0, dueDate: "", status: "pending" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create fee", err);
    }
  };

  return (
    <>
      <Head>
        <title>Financial Management - SmartDesk Admin</title>
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
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> Financial
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
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Financial Management</h1>
            <p className="text-gray-400">Manage fees and scholarships</p>
          </header>

          <div className="flex gap-4 mb-6 border-b border-neon-cyan/30">
            {["fees", "scholarships"].map((tab) => (
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

          {activeTab === "fees" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFeeModal(true)}
                  className="btn-neon btn-neon-primary"
                >
                  + Create Fee
                </button>
              </div>
              <div className="futuristic-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Student</th>
                      <th className="text-left py-3 px-4 text-gray-400">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400">Due Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-white">{fee.student?.username || "—"}</td>
                        <td className="py-3 px-4 text-gray-400">{fee.description}</td>
                        <td className="py-3 px-4 text-neon-green font-bold">${fee.amount}</td>
                        <td className="py-3 px-4 text-neon-cyan">{new Date(fee.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded text-xs ${
                            fee.status === "paid"
                              ? "bg-green-900/30 text-green-300"
                              : "bg-red-900/30 text-red-300"
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "scholarships" && (
            <div className="futuristic-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    <th className="text-left py-3 px-4 text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400">Description</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((sch) => (
                    <tr key={sch._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                      <td className="py-3 px-4 text-white">{sch.student?.username || "—"}</td>
                      <td className="py-3 px-4 text-neon-green font-bold">${sch.amount}</td>
                      <td className="py-3 px-4 text-gray-400">{sch.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-xs ${
                          sch.status === "active"
                            ? "bg-green-900/30 text-green-300"
                            : "bg-gray-900/30 text-gray-300"
                        }`}>
                          {sch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showFeeModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Create Fee</h3>
                <form onSubmit={handleCreateFee} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Student</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={feeForm.student}
                      onChange={(e) => setFeeForm({ ...feeForm, student: e.target.value })}
                      placeholder="Student ID or username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={feeForm.description}
                      onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Amount</label>
                      <input
                        type="number"
                        className="input-neon w-full rounded"
                        value={feeForm.amount}
                        onChange={(e) => setFeeForm({ ...feeForm, amount: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Due Date</label>
                      <input
                        type="date"
                        className="input-neon w-full rounded"
                        value={feeForm.dueDate}
                        onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Create</button>
                    <button
                      type="button"
                      onClick={() => setShowFeeModal(false)}
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
