import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBookOpen } from '@fortawesome/free-solid-svg-icons';

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

export default function LibraryDashboard() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("books");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", copies: 1 });
  const [issueForm, setIssueForm] = useState({ student: "", book: "", dueDate: "" });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "books") {
        const res = await fetch(`${API_BASE}/api/library/books`, { credentials: "include" });
        const data = await res.json();
        setBooks(data.books || []);
      } else {
        const res = await fetch(`${API_BASE}/api/library/issues`, { credentials: "include" });
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/library/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookForm)
      });
      if (res.ok) {
        setShowBookModal(false);
        setBookForm({ title: "", author: "", isbn: "", category: "", copies: 1 });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create book", err);
    }
  };

  return (
    <>
      <Head>
        <title>Library Management - SmartDesk Admin</title>
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
              <FontAwesomeIcon icon={faBookOpen} className="mr-2" /> Library
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
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Library Management</h1>
            <p className="text-gray-400">Manage books and issues</p>
          </header>

          <div className="flex gap-4 mb-6 border-b border-neon-cyan/30">
            {["books", "issues"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-neon-cyan border-b-2 border-neon-cyan"
                    : "text-gray-400 hover:text-neon-cyan"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "books" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowBookModal(true)}
                  className="btn-neon btn-neon-primary"
                >
                  + Add Book
                </button>
              </div>
              <div className="futuristic-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 text-gray-400">Author</th>
                      <th className="text-left py-3 px-4 text-gray-400">ISBN</th>
                      <th className="text-left py-3 px-4 text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 text-gray-400">Copies</th>
                      <th className="text-left py-3 px-4 text-gray-400">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-white font-semibold">{book.title}</td>
                        <td className="py-3 px-4 text-gray-400">{book.author}</td>
                        <td className="py-3 px-4 text-neon-cyan">{book.isbn}</td>
                        <td className="py-3 px-4 text-gray-400">{book.category}</td>
                        <td className="py-3 px-4 text-neon-green">{book.copies}</td>
                        <td className="py-3 px-4 text-neon-pink">{book.availableCopies || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "issues" && (
            <div className="futuristic-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    <th className="text-left py-3 px-4 text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400">Book</th>
                    <th className="text-left py-3 px-4 text-gray-400">Issue Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Due Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                      <td className="py-3 px-4 text-white">{issue.student?.username || "—"}</td>
                      <td className="py-3 px-4 text-gray-400">{issue.book?.title || "—"}</td>
                      <td className="py-3 px-4 text-neon-cyan">{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-neon-pink">{new Date(issue.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-xs ${
                          issue.status === "issued"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-green-900/30 text-green-300"
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showBookModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Add Book</h3>
                <form onSubmit={handleCreateBook} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Author</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">ISBN</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Category</label>
                      <input
                        type="text"
                        className="input-neon w-full rounded"
                        value={bookForm.category}
                        onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Copies</label>
                      <input
                        type="number"
                        className="input-neon w-full rounded"
                        value={bookForm.copies}
                        onChange={(e) => setBookForm({ ...bookForm, copies: parseInt(e.target.value) })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Add</button>
                    <button
                      type="button"
                      onClick={() => setShowBookModal(false)}
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
