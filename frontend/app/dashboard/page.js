"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("user_identity");
      if (cachedUser) {
        try { return JSON.parse(cachedUser); } catch (e) { return null; }
      }
    }
    return null;
  });
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, boardId: null });
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const init = async () => {
      await Promise.all([fetchBoards(), fetchProfile()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api("/api/auth/profile");
      setUser(data);
      localStorage.setItem("user_identity", JSON.stringify(data));
    } catch (err) {
      if (err.message === "Unauthorized") window.location.href = "/login";
    }
  };

  const fetchBoards = async () => {
    try {
      const data = await api("/api/boards");
      setBoards(data.boards || []);
    } catch (err) {
      if (err.message === "Unauthorized") window.location.href = "/login";
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);
    try {
      // Client-side quick check
      const isDuplicate = boards.some(b => b.title.toLowerCase() === title.trim().toLowerCase());
      if (isDuplicate) {
        throw new Error("A repository with this title already exists in your workspace.");
      }

      await api("/api/boards", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTitle("");
      setIsModalOpen(false);
      fetchBoards();
      setToast({ show: true, message: "Canvas Ready", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err.message, type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_identity");
    window.location.href = "/login";
  };

  const handleDeleteBoard = async () => {
    if (!deleteModal.boardId) return;
    try {
      await api(`/api/boards/${deleteModal.boardId}`, { method: "DELETE" });
      setDeleteModal({ isOpen: false, boardId: null });
      setToast({ show: true, message: "Canvas Deleted", type: "success" });
      fetchBoards();
    } catch (err) {
      setToast({ show: true, message: err.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E5D8] font-sans selection:bg-[#FFCA3A] flex overflow-hidden relative" 
         style={{ backgroundImage: 'radial-gradient(circle, #100B00 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }}>
      
      {/* ELITE BRUTALIST SIDEBAR */}
      <aside className="w-24 bg-[#100B00] hidden lg:flex flex-col items-center py-10 gap-10 border-r-8 border-[#100B00] relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.1)]">
         <Link href="/" className="w-14 h-14 bg-[#FF595E] rounded-2xl flex items-center justify-center text-white border-4 border-white font-black text-2xl hover:rotate-12 transition-transform shadow-[4px_4px_0_#FF595E]">
            S
         </Link>
         
         <nav className="flex flex-col gap-8">
            <SidebarIcon active tooltip="Workspaces" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>} />
            <SidebarIcon tooltip="Analytics" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} />
            <SidebarIcon tooltip="Team" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
         </nav>
         
         <div className="mt-auto pb-4">
            <button onClick={logout} className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#FF595E] border-4 border-transparent hover:border-[#FF595E] transition-all group">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* PREMIUM HEADER */}
        <header className="h-28 px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-b-8 border-[#100B00] shadow-sm">
           <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <h2 className="text-5xl font-black text-[#100B00] tracking-tighter uppercase leading-none">SyncSketch</h2>
                 <div className="px-3 py-1 bg-[#100B00] text-white rounded-lg text-[8px] font-black uppercase tracking-widest mt-1">PRO</div>
              </div>
              <p className="text-[11px] font-black text-[#100B00]/40 uppercase tracking-[0.4em] mt-2 ml-1">Universal Creative Repository</p>
           </div>

           <div className="flex items-center gap-8">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-[#100B00]/30 uppercase tracking-[0.2em] mb-1">Authenticated Identity</span>
                 <span suppressHydrationWarning className="text-xl font-black text-[#100B00] uppercase tracking-tighter">
                   {mounted ? (user?.email?.split('@')[0] || "Artist") : <div className="w-20 h-5 bg-[#100B00]/5 animate-pulse rounded-full" />}
                 </span>
              </div>
              <div suppressHydrationWarning className="w-16 h-16 rounded-[1.5rem] border-4 border-[#100B00] bg-[#FFCA3A] flex items-center justify-center text-[#100B00] font-black text-2xl shadow-[6px_6px_0_#100B00] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[#100B00] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span 
                    suppressHydrationWarning
                    className="relative z-10 group-hover:text-white transition-colors"
                  >
                    {mounted ? (user?.email?.[0].toUpperCase() || "A") : <div className="w-4 h-4 bg-white/20 animate-pulse rounded-full" />}
                  </span>
              </div>
           </div>
        </header>

        {/* DYNAMIC SCROLL AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
          
          {/* STUDIO METRICS (PREMIUM ADDITION) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <MetricCard label="Total Canvases" value={boards.length} color="#1982C4" />
             <MetricCard label="Active Personnel" value="01" color="#FF595E" />
          </section>

          {/* REPOSITORIES GRID */}
          <section className="space-y-10">
             <div className="flex items-center justify-between pb-4 border-b-4 border-[#100B00]/5">
                <div className="flex items-center gap-4">
                   <div className="w-3 h-10 bg-[#FFCA3A] rounded-full border-2 border-[#100B00]" />
                   <h3 className="text-4xl font-black text-[#100B00] tracking-tighter uppercase">Board Repositories</h3>
                </div>
                <div className="flex gap-3 bg-white border-4 border-[#100B00] p-1.5 rounded-2xl shadow-[4px_4px_0_#100B00]">
                   <FilterTab active label="All" />
                   <FilterTab label="Recent" />
                   <div className="w-[2px] h-6 bg-[#100B00]/10 mx-1 self-center" />
                   <FilterTab label="Archived" />
                </div>
             </div>

             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   {[1,2,3].map(i => <div key={i} className="h-[320px] bg-white/20 animate-pulse rounded-[3rem] border-4 border-[#100B00]/10" />)}
                </div>
             ) : boards.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-[450px] border-8 border-[#100B00] border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-sm group">
                   <div className="w-24 h-24 bg-[#FF595E] rounded-[2rem] flex items-center justify-center text-white border-4 border-[#100B00] mb-8 shadow-[10px_10px_0_#100B00] group-hover:rotate-6 transition-transform">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                   </div>
                   <h4 className="text-4xl font-black text-[#100B00] uppercase tracking-tighter mb-4">Workspace Silence</h4>
                   <p className="text-lg font-bold text-[#100B00]/40 uppercase tracking-[0.2em] max-w-[400px] leading-relaxed italic">Your collaborative archive is empty. Initialize the first project to begin.</p>
                </motion.div>
             ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   <AnimatePresence>
                      {boards.map((board, index) => (
                         <BoardCard 
                           key={board.id} 
                           board={board} 
                           index={index}
                           onDelete={() => setDeleteModal({ isOpen: true, boardId: board.id })}
                         />
                      ))}
                   </AnimatePresence>
                </motion.div>
             )}
          </section>
        </div>
      </main>

      {/* CREATE BOARD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#100B00]/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="bg-white p-14 rounded-[4rem] border-8 border-[#100B00] shadow-[40px_40px_0_#1982C4] w-full max-w-2xl relative z-10"
            >
              <div className="flex justify-between items-start mb-12">
                 <div className="space-y-2">
                   <h3 className="text-6xl font-black text-[#100B00] uppercase tracking-tighter leading-none">New Canvas</h3>
                   <p className="text-[11px] font-black text-[#100B00]/40 uppercase tracking-[0.5em] ml-1">Preparing Creative Surface</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 bg-[#100B00] text-white rounded-[1.5rem] flex items-center justify-center hover:rotate-180 transition-all duration-500 shadow-lg">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <form onSubmit={handleCreateBoard} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-3">
                    <label className="text-xs font-black text-[#100B00] uppercase tracking-widest">Canvas Title</label>
                    {boards.some(b => b.title.toLowerCase() === title.trim().toLowerCase()) && title.trim() !== "" && (
                      <span className="text-[10px] font-black text-[#FF595E] animate-bounce uppercase tracking-widest italic">! Title Already In Use</span>
                    )}
                  </div>
                  <input 
                    className={`w-full bg-[#E9E5D8]/40 border-8 rounded-[2.5rem] px-10 py-8 text-3xl font-black transition-all shadow-inner uppercase tracking-tighter ${
                      boards.some(b => b.title.toLowerCase() === title.trim().toLowerCase()) && title.trim() !== ""
                      ? "border-[#FF595E] text-[#FF595E] focus:bg-[#FF595E]/5" 
                      : "border-[#100B00] text-[#100B00] focus:bg-white"
                    }`}
                    placeholder="E.G., ARTIFICIAL HORIZON"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full bg-[#100B00] text-[#FFCA3A] font-black text-3xl py-8 rounded-[2rem] border-4 border-transparent hover:bg-[#1982C4] hover:text-white transition-all shadow-[10px_10px_0_#FFCA3A] hover:shadow-[15px_15px_0_#100B00] active:translate-y-2 active:shadow-none uppercase tracking-tighter">
                  {creating ? "INITIALIZING..." : "Initialize Canvas"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB - NEW PROJECT */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-12 right-12 w-24 h-24 bg-[#FF595E] text-white rounded-full border-8 border-[#100B00] shadow-[12px_12px_0_#100B00] flex items-center justify-center z-[50] hover:shadow-[16px_16px_0_#100B00] transition-all"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </motion.button>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ isOpen: false, boardId: null })} className="absolute inset-0 bg-[#100B00]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-12 rounded-[3.5rem] border-8 border-[#100B00] shadow-[25px_25px_0_#100B00] w-full max-w-md relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-[#FF595E]/10 rounded-[1.5rem] flex items-center justify-center text-[#FF595E] mx-auto mb-8 border-4 border-[#FF595E]/20">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-4xl font-black text-[#100B00] uppercase tracking-tighter mb-4 leading-none">Terminate Board?</h3>
              <p className="text-sm font-bold text-[#100B00]/40 uppercase tracking-[0.2em] mb-10 leading-relaxed px-4">Warning: This action will permanently purge this repository from our studio database.</p>
              
              <div className="flex gap-5">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, boardId: null })}
                  className="flex-1 bg-[#E9E5D8] border-4 border-[#100B00] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all"
                >
                  ABORT
                </button>
                <button 
                  onClick={handleDeleteBoard}
                  className="flex-1 bg-[#FF595E] text-white border-4 border-[#100B00] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[6px_6px_0_#100B00] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_#100B00] active:translate-y-0 transition-all"
                >
                  PURGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BREATHING TOAST SYSTEM */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onAnimationComplete={() => {
               setTimeout(() => setToast({ ...toast, show: false }), 3000);
            }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] px-10 py-5 rounded-2xl border-4 border-[#100B00] shadow-[8px_8px_0_#100B00] flex items-center gap-4 ${
               toast.type === "error" ? "bg-[#FF595E] text-white" : "bg-[#FFCA3A] text-[#100B00]"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border-2 border-white/20">
               {toast.type === "error" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
               )}
            </div>
            <span className="font-black uppercase tracking-tighter text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-white border-4 border-[#100B00] p-8 rounded-[2.5rem] shadow-[8px_8px_0_#100B00] flex flex-col gap-2 group transition-all hover:bg-[#100B00] hover:shadow-[12px_12px_0_#100B00] hover:-translate-y-1">
       <p className="text-[10px] font-black text-[#100B00]/40 uppercase tracking-[0.3em] group-hover:text-white/40">{label}</p>
       <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="text-4xl font-black text-[#100B00] tracking-tighter group-hover:text-white uppercase">{value}</h4>
       </div>
    </div>
  );
}

function SidebarIcon({ icon, active, tooltip }) {
  return (
    <div className="relative group/nav">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center cursor-pointer transition-all duration-300 border-4 ${active ? "bg-[#FFCA3A] text-[#100B00] border-[#100B00] shadow-[5px_5px_0_#FFFFFF] translate-x-2" : "text-white/30 border-transparent hover:text-white hover:border-white/20"}`}>
        {icon}
      </div>
      <div className="absolute left-24 top-1/2 -translate-y-1/2 bg-[#FFCA3A] text-[#100B00] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/nav:opacity-100 translate-x-[-10px] group-hover/nav:translate-x-0 transition-all pointer-events-none shadow-[4px_4px_0_#100B00] whitespace-nowrap z-[100]">
         {tooltip}
      </div>
    </div>
  );
}

function FilterTab({ label, active }) {
  return (
    <button className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${active ? "bg-[#100B00] text-white shadow-md scale-105" : "bg-transparent text-[#100B00]/30 hover:text-[#100B00] hover:bg-[#100B00]/5"}`}>
      {label}
    </button>
  );
}

function BoardCard({ board, onDelete, index }) {
  const router = useRouter();
  const COLORS = ["#1982C4", "#FF595E", "#FFCA3A", "#100B00"];
  const accentColor = COLORS[index % COLORS.length];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -12, rotate: 1 }}
      className="group bg-white border-8 border-[#100B00] rounded-[4rem] p-10 h-[380px] flex flex-col shadow-[15px_15px_0_#100B00] hover:shadow-[25px_25px_0_#100B00] transition-all cursor-pointer relative overflow-hidden"
      onClick={() => router.push(`/board/${board.id}`)}
    >
       {/* Background Pattern Accent */}
       <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none translate-x-10 -translate-y-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#100B00]"><circle cx="50" cy="50" r="50"/></svg>
       </div>

       <div className="flex items-start justify-between relative z-10">
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 border-[#100B00] shadow-[6px_6px_0_#100B00] group-hover:scale-110 transition-transform" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
             <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-12 h-12 bg-white text-[#FF595E] hover:bg-[#FF595E] hover:text-white rounded-2xl border-4 border-[#100B00] transition-all flex items-center justify-center shadow-[4px_4px_0_#100B00] active:shadow-none active:translate-x-1 active:translate-y-1"
            title="Terminate Repository"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
       </div>
       
       <div className="mt-8 space-y-2 relative z-10">
          <h3 className="text-4xl font-black text-[#100B00] tracking-tighter uppercase leading-[0.8] group-hover:text-[#1982C4] transition-colors line-clamp-2">{board.title}</h3>
          <div className="h-1.5 w-12 bg-[#100B00] rounded-full group-hover:w-24 transition-all duration-500" style={{ backgroundColor: accentColor }} />
       </div>
       
       <div className="mt-auto flex items-end justify-between relative z-10">
          <div className="space-y-1">
             <p className="text-[10px] font-black text-[#100B00]/30 uppercase tracking-[0.2em]">Creative Canvas</p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1982C4] animate-pulse" />
                <p className="text-[14px] font-black text-[#100B00] tracking-tighter">ID: {board.id.substring(0, 10).toUpperCase()}</p>
             </div>
          </div>
          <div className="w-16 h-16 rounded-[1.5rem] border-8 border-[#100B00] flex items-center justify-center bg-white group-hover:bg-[#100B00] group-hover:text-white transition-all duration-300">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
       </div>
    </motion.div>
  );
}
