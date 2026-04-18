"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { api } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

function BoardContent() {
  const { id: boardId } = useParams();
  const router = useRouter();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil"); 
  const [color, setColor] = useState("#1982C4"); 
  const [pencilSize, setPencilSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(30);
  const [boardInfo, setBoardInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState([]);
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("user_identity");
      if (cachedUser) {
        try { return JSON.parse(cachedUser); } catch (e) { return null; }
      }
    }
    return null;
  });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [canvasBg, setCanvasBg] = useState('#100B00');
  

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Real-time Presence
  const [cursors, setCursors] = useState({});
  const lastMouseUpdate = useRef(0);


  const COLORS = ["#1982C4", "#FF595E", "#FFCA3A", "#100B00", "#FFFFFF"];

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      try {
        const data = await api("/api/auth/profile");
        setUser(data);
        localStorage.setItem("user_identity", JSON.stringify(data));
        setCheckingAuth(false);
      } catch (err) {
        window.location.href = "/login";
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    const token = localStorage.getItem("token");
    
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001", { 
      auth: { token } 
    });

    setupSocketHandlers(socketRef.current);
    initCanvas();

    window.addEventListener("resize", initCanvas);
    return () => {
      window.removeEventListener("resize", initCanvas);
      socketRef.current?.disconnect();
    };
  }, [boardId, checkingAuth]);

  const setupSocketHandlers = (socket) => {
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-board", { boardId });
    });

    socket.on("joined-board", (data) => {
      setBoardInfo(data);
      if (data.history) setStrokes(data.history);
    });

    socket.on("draw", (newStroke) => {
      setStrokes((prev) => {
        // Find if this stroke was locally added with a temporary ID
        const localIndex = prev.findIndex(s => s.id?.startsWith('t-') && s.points?.length === newStroke.points?.length);
        if (localIndex !== -1) {
          const updated = [...prev];
          updated[localIndex] = newStroke; // Replace temp ID with server ID
          return updated;
        }
        // If it's someone else's or not found, add but check for ID dupes
        if (prev.some(s => s.id === newStroke.id)) return prev;
        return [...prev, newStroke];
      });
    });
    
    socket.on("undo", ({ deletedId }) => setStrokes((prev) => prev.filter(s => s.id !== deletedId)));
    socket.on("clear-board", () => setStrokes([]));
    
    socket.on("cursor-update", ({ userId, x, y }) => {
      if (userId === user?.email) return;
      setCursors(prev => ({
        ...prev,
        [userId]: { x, y, lastUpdate: Date.now() }
      }));
    });

    const cursorCleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const active = { ...prev };
        let changed = false;
        Object.keys(active).forEach(id => {
          if (now - active[id].lastUpdate > 2000) {
            delete active[id];
            changed = true;
          }
        });
        return changed ? active : prev;
      });
    }, 1000);

    socket.on("disconnect", () => setConnected(false));
    return () => clearInterval(cursorCleanupInterval);
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    
    const context = canvas.getContext("2d");
    canvas.width = container.clientWidth * 2;
    canvas.height = container.clientHeight * 2;
    canvas.style.width = `${container.clientWidth}px`;
    canvas.style.height = `${container.clientHeight}px`;
    
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;
    redrawCanvas(strokes);
  };

  useEffect(() => {
    if (contextRef.current) {
      const activeSize = tool === 'eraser' ? eraserSize : pencilSize;
      const preview = isDrawing ? { points: currentStrokePoints, tool, color, size: activeSize } : null;
      redrawCanvas(strokes, preview);
    }
  }, [strokes, isDrawing, currentStrokePoints, tool, color, pencilSize, eraserSize]);

  const redrawCanvas = (strokesToDraw, previewStroke = null) => {
    const context = contextRef.current;
    if (!context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const all = previewStroke ? [...strokesToDraw, previewStroke] : strokesToDraw;
    all.forEach(stroke => {
      context.beginPath();
      if (stroke.tool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(0,0,0,1)";
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = stroke.color;
      }
      
      context.lineWidth = stroke.size;
      const points = stroke.points;
      if (!points?.length) return;

      if (stroke.tool === "brush") {
        context.shadowBlur = stroke.size / 2;
        context.shadowColor = stroke.color;
        context.globalAlpha = 0.6; // Softer, painterly feel
      } else {
        context.shadowBlur = 0;
        context.globalAlpha = 1.0;
      }

      context.moveTo(points[0][0], points[0][1]);
      if (stroke.tool === "rect") {
        const end = points[points.length - 1];
        context.strokeRect(points[0][0], points[0][1], end[0] - points[0][0], end[1] - points[0][1]);
      } else if (stroke.tool === "circle") {
        const end = points[points.length - 1];
        const r = Math.sqrt(Math.pow(end[0] - points[0][0], 2) + Math.pow(end[1] - points[0][1], 2));
        context.arc(points[0][0], points[0][1], r, 0, Math.PI * 2);
        context.stroke();
      } else if (stroke.tool === "triangle") {
        const end = points[points.length - 1];
        const x0 = points[0][0], y0 = points[0][1], x1 = end[0], y1 = end[1];
        context.moveTo(x0 + (x1 - x0) / 2, y0);
        context.lineTo(x0, y1);
        context.lineTo(x1, y1);
        context.closePath();
        context.stroke();
      } else if (stroke.tool === "arrow") {
        const end = points[points.length - 1];
        const x0 = points[0][0], y0 = points[0][1], x1 = end[0], y1 = end[1];
        const headlen = stroke.size * 3; 
        const angle = Math.atan2(y1 - y0, x1 - x0);
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6), y1 - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(x1, y1);
        context.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6), y1 - headlen * Math.sin(angle + Math.PI / 6));
        context.stroke();
      } else {
        points.forEach(p => context.lineTo(p[0], p[1]));
        context.stroke();
      }
    });
    context.globalCompositeOperation = "source-over";
  };

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setCurrentStrokePoints([[x, y]]);
  };

  const draw = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      if (["rect", "circle", "triangle", "arrow"].includes(tool)) {
        setCurrentStrokePoints([currentStrokePoints[0], [x, y]]);
      } else {
        setCurrentStrokePoints(prev => [...prev, [x, y]]);
      }
    }

    const now = Date.now();
    if (now - lastMouseUpdate.current > 30) {
      if (socketRef.current) {
        socketRef.current.emit("mouse-move", {
          boardId,
          x,
          y
        });
      }
      lastMouseUpdate.current = now;
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const activeSize = tool === 'eraser' ? eraserSize : pencilSize;
    const newStroke = { boardId, points: currentStrokePoints, tool, color: tool === 'eraser' ? 'erase' : color, size: activeSize, id: `t-${Date.now()}` };
    setStrokes(prev => [...prev, newStroke]);
    socketRef.current.emit("draw", newStroke);
    setCurrentStrokePoints([]);
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `syncsketch-export-${boardId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setToast({ show: true, message: "STUDIO EXPORT SUCCESSFUL", type: "success" });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#E9E5D8] p-4 gap-4 overflow-hidden font-sans selection:bg-[#FFCA3A]">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 animate-fade-in relative z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="w-12 h-12 bg-white border-[3px] border-[#100B00] rounded-xl flex items-center justify-center text-[#100B00] shadow-[3px_3px_0_#100B00] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#100B00] transition-all group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="translate-x-[-1px]"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div className="flex flex-col -gap-1">
            <h1 className="text-3xl font-black tracking-tighter text-[#100B00] leading-none mb-1">{boardInfo?.title || "1"}</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-[#1982C4]" : "bg-[#FF595E] animate-pulse"}`}></div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#100B00]/40">{connected ? "LIVE & SYNCED" : "RECONNECTING..."}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">

          {/* STUDIO PRESENCE MODULE (RELOCATED TO HEADER) */}
          <div className="hidden xl:flex items-center gap-4 bg-white/50 backdrop-blur-sm px-5 py-2 rounded-2xl border-[3px] border-[#100B00] shadow-[4px_4px_0_#100B00]">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-[#100B00]/40 uppercase tracking-widest leading-none">Studio Artist</span>
                <span 
                  suppressHydrationWarning
                  className="text-[11px] font-black text-[#100B00] uppercase truncate max-w-[100px]"
                >
                  {mounted ? ((user?.name || user?.email?.split('@')[0]) || "Guest") : <div className="w-16 h-3 bg-[#100B00]/5 animate-pulse rounded-full mt-1" />}
                </span>
             </div>
             <div className="h-6 w-[2px] bg-[#100B00]/10" />
             <div className="flex items-center gap-2">
                <div 
                  suppressHydrationWarning
                  className="w-9 h-9 rounded-full bg-[#100B00] text-white flex items-center justify-center text-[11px] font-black border-2 border-white shadow-sm"
                >
                   {mounted ? ((user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase()) || "?") : <div className="w-4 h-4 bg-white/20 animate-pulse rounded-full" />}
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-[#1982C4] uppercase tracking-widest leading-none">Live</span>
                   <span className="text-[11px] font-black text-[#100B00] uppercase">{Object.keys(cursors).length + 1} ON STAGE</span>
                </div>
             </div>
          </div>
          
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-[#FFCA3A] text-[#100B00] border-[3px] border-[#100B00] shadow-[4px_4px_0_#100B00] px-10 py-3 rounded-xl font-black text-xs uppercase tracking-[0.1em] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#100B00] transition-all active:translate-y-0"
          >
            INVITE
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex gap-4 min-h-0 px-1 relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
        
        {/* Canvas Frame */}
        <div className="flex-1 canvas-container relative overflow-hidden border-4 border-[#100B00] rounded-[3rem] shadow-[20px_20px_0_rgba(0,0,0,0.1)] transition-colors duration-500" 
             style={{ 
               backgroundColor: canvasBg,
               backgroundImage: `radial-gradient(circle, ${canvasBg === '#100B00' ? '#ffffff20' : '#00000010'} 1.5px, transparent 1.5px)`, 
               backgroundSize: '30px 30px' 
             }}>
          
          {/* Precision Alignment Grid */}
          {showGrid && (
             <div className="absolute inset-0 pointer-events-none z-0" 
                  style={{ 
                    backgroundImage: 'linear-gradient(#100B0015 1px, transparent 1px), linear-gradient(90deg, #100B0015 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} 
             />
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full touch-none bg-transparent relative z-10"
          />

          {/* Real-time Multiplayer Cursors (Brutalist style) */}
          {Object.entries(cursors).map(([id, cursor]) => {
            const colorIndex = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
            const cursorColor = COLORS[colorIndex];
            return (
              <div 
                key={id}
                className="absolute pointer-events-none z-50 flex items-start transition-all duration-75 ease-out"
                style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)`, left: 0, top: 0 }}
              >
                <div className="w-4 h-4 bg-white border-2 border-[#100B00] rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-[2px_2px_0_#100B00]" style={{ backgroundColor: cursorColor }}></div>
                <div className="px-3 py-1 ml-2 rounded-xl bg-[#100B00] text-white text-[9px] font-black uppercase tracking-tighter shadow-lg border border-white/20">
                  {id.split('@')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRO STUDIO TOOLBAR (VIBRANT YELLOW EDITION) */}
      {/* PRO STUDIO ACTION DECK (ELITE WHITE EDITION) */}
      <div className="h-20 flex items-center justify-between px-6 bg-white rounded-[2rem] border-4 border-[#100B00] text-[#100B00] shadow-[0_15px_40px_rgba(0,0,0,0.15)] relative z-[100] mx-2 min-w-[1100px]">
          
          <div className="flex items-center gap-4 pr-6 border-r border-[#100B00]/20">
             {/* THEME TOGGLE */}
             <button 
               onClick={() => setCanvasBg(prev => prev === '#100B00' ? '#FFFFFF' : '#100B00')}
               className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#100B00] text-white hover:scale-105 transition-all"
               title="Toggle Canvas Theme"
             >
                {canvasBg === '#100B00' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
             </button>

             <div className="flex gap-1">
                <ToolBtn active={tool === "pencil"} onClick={() => setTool("pencil")} tooltip="Pencil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "brush"} onClick={() => setTool("brush")} tooltip="Soft Brush">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m19.07 4.93-9.19 9.19a3 3 0 0 1-4.24-4.24l9.19-9.19a3 3 0 0 1 4.24 4.24Z"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "rect"} onClick={() => setTool("rect")} tooltip="Square">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="14" height="14" x="5" y="5" rx="1"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "circle"} onClick={() => setTool("circle")} tooltip="Circle">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="8"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "triangle"} onClick={() => setTool("triangle")} tooltip="Triangle">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M12 3 2 21h20L12 3z"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "arrow"} onClick={() => setTool("arrow")} tooltip="Arrow">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="m3 21 18-18"/><path d="M15 3h6v6"/></svg>
                </ToolBtn>
                <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")} tooltip="Eraser">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="m22 21-14 0"/></svg>
                </ToolBtn>
             </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 gap-8">
             <div className="flex flex-col gap-1 w-full max-w-[160px]">
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#100B00]">STROKE WEIGHT</span>
                  <span className="text-[9px] font-black text-[#100B00]">{tool === 'eraser' ? eraserSize : pencilSize}px</span>
                </div>
                <input 
                  type="range" min="1" max="100" 
                  value={tool === 'eraser' ? eraserSize : pencilSize} 
                  onChange={(e) => tool === 'eraser' ? setEraserSize(Number(e.target.value)) : setPencilSize(Number(e.target.value))}
                  className="w-full accent-[#100B00] h-[3px] bg-[#100B00]/10 rounded-full appearance-none cursor-pointer"
                />
             </div>

             <div className="h-8 w-[2px] bg-[#100B00]/10" />

             {/* COLOR SYSTEM */}
             <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {["#92B4A7", "#FF8C61", "#FFD23F", "#7C610C", "#FFFFFF"].map(c => (
                    <button 
                      key={c} 
                      onClick={() => { setColor(c); setTool(t => t === 'eraser' ? 'pencil' : t); }} 
                      className={`w-8 h-8 rounded-full border-2 border-white transition-all shadow-sm ${color === c && tool !== 'eraser' ? 'scale-125 border-[#100B00] z-10' : 'hover:scale-110'}`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
                <div className="relative group">
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => { setColor(e.target.value); setTool(t => t === 'eraser' ? 'pencil' : t); }}
                    className="w-10 h-10 rounded-xl border-4 border-[#100B00] cursor-pointer bg-white overflow-hidden shadow-sm hover:scale-105 transition-transform"
                  />
                </div>
             </div>

             <div className="h-8 w-[2px] bg-[#100B00]/10" />

             {/* EXTRA STUDIO MODULES */}
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowGrid(!showGrid)} 
                  className={`w-10 h-10 rounded-xl border-2 border-[#100B00] flex items-center justify-center transition-all ${showGrid ? 'bg-[#FFCA3A] shadow-inner' : 'bg-[#E9E5D8]/50 hover:bg-[#100B00]/5'}`}
                  title="Toggle Layout Grid"
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 3h18v18H3z"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
                </button>
                <button 
                  onClick={downloadCanvas}
                  className="w-10 h-10 rounded-xl border-2 border-[#100B00] bg-[#1982C4] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[3px_3px_0_#100B00] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  title="Export High-Res Scene"
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
             </div>

          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-[#100B00]/10">
            <ActionButton onClick={() => socketRef.current?.emit("undo", { boardId })} title="Undo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-[#100B00] hover:scale-110 transition-transform"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </ActionButton>
            
            <ActionButton onClick={() => setShowClearConfirm(true)} title="Clear Board" danger>
              <span className="font-black text-[10px] tracking-widest px-1">CLEAR</span>
            </ActionButton>
          </div>
      </div>

      {/* INVITE MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInviteModal(false)} className="absolute inset-0 bg-[#100B00]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white border-4 border-[#100B00] p-10 rounded-[3rem] shadow-[20px_20px_0_#100B00] w-full max-w-md"
            >
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Invite Artist</h2>
              <p className="text-[#100B00]/40 text-[10px] font-black uppercase tracking-widest mb-8">Grant real-time collaborative access</p>
              
              <div className="flex flex-col gap-5">
                <div className="relative">
                  <input 
                    autoFocus
                    type="email" placeholder="collaborator@studio.com"
                    value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-[#E9E5D8] border-4 border-[#100B00] p-5 rounded-2xl font-bold text-[#100B00] placeholder:text-[#100B00]/30 outline-none focus:ring-8 ring-[#FFCA3A]/30 transition-all"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-white border-4 border-[#100B00] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#100B00] hover:text-white transition-all shadow-[4px_4px_0_#100B00] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isInviting || !inviteEmail}
                    onClick={async () => {
                      setIsInviting(true);
                      try {
                        await api(`/api/boards/${boardId}/invite`, {
                          method: "POST",
                          body: JSON.stringify({ email: inviteEmail, role: 'editor' })
                        });
                        setToast({ show: true, message: `ACCESS GRANTED TO ${inviteEmail.toUpperCase()}`, type: "success" });
                        setShowInviteModal(false);
                        setInviteEmail("");
                        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
                      } catch (err) {
                        setToast({ show: true, message: err.message.toUpperCase(), type: "error" });
                        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
                      } finally {
                        setIsInviting(false);
                      }
                    }}
                    className="flex-1 bg-[#FFCA3A] text-[#100B00] border-4 border-[#100B00] py-4 rounded-2xl font-black uppercase tracking-widest hover:-translate-y-1 shadow-[8px_8px_0_#100B00] active:translate-y-0 transition-all disabled:opacity-50"
                  >
                    {isInviting ? "INVITING..." : "INVITE"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BEAUTIFUL CLEAR BOARD CONFIRMATION MODAL */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowClearConfirm(false)} className="absolute inset-0 bg-[#100B00]/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-10 rounded-[3rem] border-4 border-[#100B00] shadow-[15px_15px_0_#100B00] w-full max-w-sm relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-[#FF595E]/10 rounded-2xl flex items-center justify-center text-[#FF595E] mx-auto mb-6">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m21 8-2 2-2-2m2 2 2 2m-2-2-2 2M3 3h18M5 5v14c0 1 1 2 2 2h10c1 0 2-1 2-2V5"/></svg>
              </div>
              <h3 className="text-2xl font-black text-[#100B00] uppercase tracking-tighter mb-2">Wipe Canvas?</h3>
              <p className="text-xs font-bold text-[#100B00]/50 uppercase tracking-widest leading-relaxed mb-8">This will irreversibly clear the stage for everyone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-white border-2 border-[#100B00] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#100B00]/5 transition-all outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    socketRef.current?.emit("clear-board", { boardId });
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 bg-[#FF595E] text-white border-2 border-[#100B00] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_#100B00] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#100B00] active:translate-y-0 transition-all outline-none"
                >
                  Wipe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
            className={`fixed bottom-32 left-8 z-[600] flex items-center gap-5 px-8 py-5 rounded-[2rem] border-4 border-[#100B00] shadow-[12px_12px_0_#100B00] font-black uppercase tracking-[0.2em] text-[10px] ${toast.type === 'success' ? 'bg-[#FFCA3A] text-[#100B00]' : 'bg-[#FF595E] text-white'}`}
          >
             <div className={`w-3 h-3 rounded-full animate-ping ${toast.type === 'success' ? 'bg-[#100B00]' : 'bg-white'}`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ active, onClick, children, tooltip }) {
  return (
    <div className="relative group/tool">
      <button 
        onClick={onClick} 
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${active ? "bg-[#100B00] text-white scale-110 shadow-lg" : "text-[#100B00]/40 hover:text-[#100B00] hover:bg-[#100B00]/10"}`}
      >
        {children}
      </button>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#100B00] text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover/tool:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
        {tooltip}
      </div>
    </div>
  );
}

function ActionButton({ onClick, children, title, danger }) {
  return (
    <button 
      onClick={onClick} 
      title={title}
      className={`p-3 rounded-2xl border-4 border-transparent hover:border-[#100B00] hover:bg-[#E9E5D8]/50 transition-all ${danger ? "text-[#FF595E] hover:bg-[#FF595E]/10" : "text-[#100B00]"}`}
    >
      {children}
    </button>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#E9E5D8] flex flex-col items-center justify-center" />
    }>
      <BoardContent />
    </Suspense>
  );
}
