import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBuilding } from '@fortawesome/free-solid-svg-icons';

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

export default function InfrastructureDashboard() {
  const router = useRouter();
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("buildings");
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: "", code: "", address: "", floors: 1, status: "active" });
  const [roomForm, setRoomForm] = useState({ roomNumber: "", building: "", capacity: 30, type: "classroom", status: "available" });

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    router.push("/login");
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "buildings") {
        const res = await fetch(`${API_BASE}/api/infrastructure/buildings`, { credentials: "include" });
        const data = await res.json();
        setBuildings(data.buildings || []);
      } else {
        const res = await fetch(`${API_BASE}/api/infrastructure/rooms`, { credentials: "include" });
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCreateBuilding = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/infrastructure/buildings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildingForm)
      });
      if (res.ok) {
        setShowBuildingModal(false);
        setBuildingForm({ name: "", code: "", address: "", floors: 1, status: "active" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create building", err);
    }
  };

  return (
    <>
      <Head>
        <title>Infrastructure Management - SmartDesk Admin</title>
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
            <div className="block px-4 py-3 rounded border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" /> Infrastructure
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
            <h1 className="text-4xl font-bold text-gradient-neon mb-2">Infrastructure Management</h1>
            <p className="text-gray-400">Manage buildings and rooms</p>
          </header>

          <div className="flex gap-4 mb-6 border-b border-neon-cyan/30">
            {["buildings", "rooms"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-neon-blue border-b-2 border-neon-blue"
                    : "text-gray-400 hover:text-neon-cyan"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "buildings" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowBuildingModal(true)}
                  className="btn-neon btn-neon-primary"
                >
                  + Create Building
                </button>
              </div>
              <div className="futuristic-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-cyan/30">
                      <th className="text-left py-3 px-4 text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Address</th>
                      <th className="text-left py-3 px-4 text-gray-400">Floors</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.map((building) => (
                      <tr key={building._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                        <td className="py-3 px-4 text-neon-blue font-bold">{building.code}</td>
                        <td className="py-3 px-4 text-white">{building.name}</td>
                        <td className="py-3 px-4 text-gray-400">{building.address}</td>
                        <td className="py-3 px-4 text-neon-cyan">{building.floors}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded text-xs ${
                            building.status === "active"
                              ? "bg-green-900/30 text-green-300"
                              : "bg-red-900/30 text-red-300"
                          }`}>
                            {building.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="futuristic-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    <th className="text-left py-3 px-4 text-gray-400">Room Number</th>
                    <th className="text-left py-3 px-4 text-gray-400">Building</th>
                    <th className="text-left py-3 px-4 text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400">Capacity</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                      <td className="py-3 px-4 text-neon-blue font-bold">{room.roomNumber}</td>
                      <td className="py-3 px-4 text-white">{room.building?.name || "—"}</td>
                      <td className="py-3 px-4 text-gray-400 capitalize">{room.type}</td>
                      <td className="py-3 px-4 text-neon-cyan">{room.capacity}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-xs ${
                          room.status === "available"
                            ? "bg-green-900/30 text-green-300"
                            : "bg-red-900/30 text-red-300"
                        }`}>
                          {room.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showBuildingModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
              <div className="futuristic-card max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gradient-neon mb-6">Create Building</h3>
                <form onSubmit={handleCreateBuilding} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={buildingForm.name}
                      onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Code</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={buildingForm.code}
                      onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      className="input-neon w-full rounded"
                      value={buildingForm.address}
                      onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Floors</label>
                      <input
                        type="number"
                        className="input-neon w-full rounded"
                        value={buildingForm.floors}
                        onChange={(e) => setBuildingForm({ ...buildingForm, floors: parseInt(e.target.value) })}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Status</label>
                      <select
                        className="input-neon w-full rounded"
                        value={buildingForm.status}
                        onChange={(e) => setBuildingForm({ ...buildingForm, status: e.target.value })}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-neon btn-neon-primary flex-1">Create</button>
                    <button
                      type="button"
                      onClick={() => setShowBuildingModal(false)}
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
