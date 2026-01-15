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

    const [users, roles] = await Promise.all([
      fetch(`${API_BASE}/api/users`, {
        headers: { cookie: cookieHeader },
        credentials: "include"
      }).then(r => r.json()).catch(() => ({ users: [] })),
      fetch(`${API_BASE}/api/roles`, {
        headers: { cookie: cookieHeader },
        credentials: "include"
      }).then(r => r.json()).catch(() => ({ roles: {} }))
    ]);
    return { props: { initialUsers: users.users || [], roles: roles.roles || {} } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function UserManagement({ initialUsers, roles }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student"
  });
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `${API_BASE}/api/users/${editingUser._id}`
        : `${API_BASE}/api/users`;
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ username: "", email: "", password: "", role: "student" });
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to save user", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role
    });
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <Head>
        <title>User Management - SmartDesk Admin</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-neon-cyan/30 z-40 p-6">
          <div className="mb-8">
            <Link href="/admin" className="text-2xl font-bold neon-glow block">SmartDesk</Link>
            <p className="text-xs text-gray-400 mt-1">Admin Control Center</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded border border-neon-cyan/30 text-gray-400 hover:text-neon-cyan transition-all">
              <span className="mr-2">🏠</span> Dashboard
            </Link>
            <div className="block px-4 py-3 rounded border border-neon-pink/30 bg-neon-pink/10 text-neon-pink">
              <span className="mr-2">👥</span> Users
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
              <h1 className="text-4xl font-bold text-gradient-neon mb-2">User Management</h1>
              <p className="text-gray-400">Manage users, roles, and permissions</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({ username: "", email: "", password: "", role: "student" });
                setShowModal(true);
              }}
              className="btn-neon btn-neon-primary"
            >
              + Create User
            </button>
          </header>

          {/* Filters */}
          <div className="futuristic-card mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Search</label>
                <input
                  type="text"
                  className="input-neon w-full rounded"
                  placeholder="Search by username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Filter by Role</label>
                <select
                  className="input-neon w-full rounded"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {Object.keys(roles).map((roleId) => (
                    <option key={roleId} value={roleId}>{roles[roleId].name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="futuristic-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left py-3 px-4 text-gray-400">Username</th>
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5 transition-colors">
                    <td className="py-3 px-4 text-white">{user.username}</td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs border ${
                        user.role === "admin" ? "border-neon-pink text-neon-pink" :
                        user.role === "student" ? "border-neon-cyan text-neon-cyan" :
                        "border-neon-green text-neon-green"
                      }`}>
                        {roles[user.role]?.name || user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs ${
                        user.isActive
                          ? "bg-green-900/30 text-green-300 border border-green-500/50"
                          : "bg-red-900/30 text-red-300 border border-red-500/50"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(user)}
                        className="btn-neon text-xs px-3 py-1 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">
                  {editingUser ? "Edit User" : "Create User"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="input-neon w-full rounded"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="input-neon w-full rounded"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder={editingUser ? "Leave blank to keep current" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Role</label>
                    <select
                      className="input-neon w-full rounded"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      {Object.entries(roles).map(([roleId, roleData]) => (
                        <option key={roleId} value={roleId}>{roleData.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">
                      {editingUser ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        setFormData({ username: "", email: "", password: "", role: "student" });
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
