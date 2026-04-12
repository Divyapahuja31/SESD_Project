"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api";
import Link from "next/link";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    Promise.all([fetchBoards(), fetchProfile()]);
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api("/api/auth/profile");
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchBoards = async () => {
    try {
      const data = await api("/api/boards");
      setBoards(data.boards || []);
    } catch (err) {
      if (err.message === "Unauthorized") {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);

    try {
      await api("/api/boards", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTitle("");
      fetchBoards();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Loading Workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight">SyncSketch</h1>
        
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg uppercase">
                {user.email.substring(0, 2)}
              </div>
              <span className="text-xs font-semibold text-slate-300 max-w-[150px] truncate">{user.email}</span>
            </div>
          )}
          <button onClick={logout} className="secondary-button text-[10px] py-2 px-4 border-white/10 hover:bg-white/5 uppercase tracking-widest font-bold">Logout</button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_350px] gap-12">
        {/* Board List */}
        <section className="animate-fade-in">
          <h2 className="text-xl font-semibold mb-6 text-slate-300">Your Boards</h2>
          {boards.length === 0 ? (
            <div className="glass p-12 rounded-2xl text-center text-slate-400">
              <p className="mb-4 text-sm">No boards found. Create your first board to start drawing!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {boards.map((board) => (
                <Link key={board.id} href={`/board/${board.id}`}>
                  <div className="glass p-6 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer h-full border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors uppercase tracking-wider">{board.title}</h3>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase">{board.role}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {board.id}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Create Board Sidebar */}
        <aside className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass p-8 rounded-2xl sticky top-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Create New Board</h2>
            <form onSubmit={handleCreateBoard} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Board Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Brainstorming"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary-button py-3 text-[10px] font-bold uppercase tracking-widest" disabled={creating}>
                {creating ? "Creating..." : "Create Board"}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
