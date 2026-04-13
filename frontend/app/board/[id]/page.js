"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { api } from "../../services/api";

export default function BoardPage() {
  const { id: boardId } = useParams();
  const router = useRouter();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil"); 
  const [color, setColor] = useState("#ffffff");
  const [pencilSize, setPencilSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(20);
  const [boardInfo, setBoardInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState([]);
  const [user, setUser] = useState(null);

  const COLORS = ["#ffffff", "#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#fb923c"];
  const SHAPES = ["pencil", "rect", "circle", "line", "eraser"];

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token || token === "null" || token === "undefined") {
        const currentPath = window.location.pathname;
        localStorage.removeItem("token");
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }

      try {
        const data = await api("/api/auth/profile");
        setUser(data);
        setCheckingAuth(false); 
      } catch (err) {
        console.error("Auth verification failed", err);
        localStorage.removeItem("token");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;

    const token = localStorage.getItem("token");
    
    const handleInit = () => {
      if (initCanvas()) {
        socketRef.current = io("http://localhost:5001", { auth: { token } });
        setupSocketHandlers(socketRef.current);
      } else {
        setTimeout(handleInit, 50);
      }
    };

    handleInit();

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
      if (data.history) {
        setStrokes(data.history);
      }
    });

    socket.on("draw", (newStroke) => {
      setStrokes((prev) => [...prev, newStroke]);
    });

    socket.on("undo", ({ deletedId }) => {
      setStrokes((prev) => prev.filter(s => s.id !== deletedId));
    });

    socket.on("clear-board", () => {
      setStrokes([]);
    });

    socket.on("error-message", (err) => {
      alert(err.message);
      if (err.message === "Access denied" || err.message === "Board not found") {
        window.location.href = "/dashboard";
      }
    });

    socket.on("disconnect", () => setConnected(false));
  };

  useEffect(() => {
    if (contextRef.current) {
      redrawCanvas(strokes, isDrawing ? { points: currentStrokePoints, tool, color, size: tool === 'eraser' ? eraserSize : pencilSize } : null);
    }
  }, [strokes, isDrawing, currentStrokePoints, tool, color, pencilSize, eraserSize]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const context = canvas.getContext("2d");
    if (!context) return false;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;
    
    redrawCanvas(strokes);
    return true;
  };

  const drawShape = (ctx, stroke) => {
    const [start, end] = [stroke.points[0], stroke.points[stroke.points.length - 1]];
    if (!start || !end) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.tool === "eraser" ? "#0a0f1d" : stroke.color;
    ctx.lineWidth = stroke.size;

    if (stroke.tool === "rect") {
      ctx.strokeRect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
    } else if (stroke.tool === "circle") {
      const radius = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
      ctx.arc(start[0], start[1], radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === "line") {
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(end[0], end[1]);
      ctx.stroke();
    }
    ctx.closePath();
  };

  const redrawCanvas = (strokesToDraw, previewStroke = null) => {
    const context = contextRef.current;
    if (!context) return;
    
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = previewStroke ? [...strokesToDraw, previewStroke] : strokesToDraw;

    allStrokes.forEach(stroke => {
      if (!stroke.points || stroke.points.length < 1) return;
      
      if (["rect", "circle", "line"].includes(stroke.tool)) {
        drawShape(context, stroke);
        return;
      }

      context.beginPath();
      context.strokeStyle = stroke.tool === "eraser" ? "#0a0f1d" : stroke.color;
      context.lineWidth = stroke.size;
      
      if (stroke.tool === "pencil") {
        context.shadowBlur = 2;
        context.shadowColor = stroke.color;
      } else {
        context.shadowBlur = 0;
      }

      context.moveTo(stroke.points[0][0], stroke.points[0][1]);
      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i][0], stroke.points[i][1]);
      }
      context.stroke();
      context.shadowBlur = 0; 
      context.closePath();
    });
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    setCurrentStrokePoints([[offsetX, offsetY]]);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;

    if (["rect", "circle", "line"].includes(tool)) {
      setCurrentStrokePoints((prev) => [prev[0], [offsetX, offsetY]]);
    } else {
      setCurrentStrokePoints((prev) => [...prev, [offsetX, offsetY]]);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokePoints.length >= 1) {
      const activeSize = tool === "eraser" ? eraserSize : pencilSize;
      const newStroke = {
        boardId,
        userId: boardInfo?.userId || "me",
        points: currentStrokePoints,
        color: tool === "eraser" ? "#0a0f1d" : color,
        size: activeSize,
        tool,
        id: `temp-${Date.now()}` 
      };

      setStrokes((prev) => [...prev, newStroke]);

      if (socketRef.current) {
        socketRef.current.emit("draw", {
          boardId,
          points: currentStrokePoints,
          color: newStroke.color,
          size: activeSize,
          tool,
        });
      }
    }
    setCurrentStrokePoints([]);
  };

  const undo = () => {
    setStrokes((prev) => {
      const lastMyStrokeIndex = prev.findLastIndex(
        (s) => s.userId === boardInfo?.userId || (s.id && typeof s.id === 'string' && s.id.startsWith("temp-"))
      );
      if (lastMyStrokeIndex === -1) return prev;
      const newState = [...prev];
      newState.splice(lastMyStrokeIndex, 1);
      return newState;
    });
    if (socketRef.current) {
      socketRef.current.emit("undo", { boardId });
    }
  };

  const clearAll = () => {
    if (!window.confirm("Are you sure you want to clear the entire board?")) return;
    if (socketRef.current) {
      socketRef.current.emit("clear-board", { boardId });
    }
    setStrokes([]);
  };

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api(`/api/boards/${boardId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      alert("User invited successfully!");
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Securing Room</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 glass flex items-center justify-between px-6 py-3 rounded-full z-20 w-[90%] max-w-4xl">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
            {boardInfo?.title || "Board"}
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
             <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                {user.email.substring(0, 2)}
              </div>
              <span className="text-[10px] font-bold text-slate-300 max-w-[100px] truncate">{user.email}</span>
            </div>
          )}
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button onClick={undo} className="secondary-button text-[10px] px-4 py-2 uppercase tracking-widest font-bold">Undo</button>
          {boardInfo?.role === "owner" && (
            <button onClick={clearAll} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] px-4 py-2 border border-rose-500/20 rounded-full uppercase tracking-widest font-bold">Clear</button>
          )}
          {boardInfo?.role === "owner" && (
            <button onClick={() => setShowInvite(true)} className="primary-button text-[10px] px-4 py-2 uppercase tracking-widest">Invite</button>
          )}
          <button onClick={() => router.push("/dashboard")} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Exit</button>
        </div>
      </div>


      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        

        <div className="glass p-3 rounded-3xl flex flex-col gap-3">
            <button onClick={() => setTool("pencil")} className={`p-3 rounded-2xl transition-all ${tool === "pencil" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-white/5"}`} title="Pencil">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button onClick={() => setTool("rect")} className={`p-3 rounded-2xl transition-all ${tool === "rect" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-white/5"}`} title="Rectangle">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </button>
            <button onClick={() => setTool("circle")} className={`p-3 rounded-2xl transition-all ${tool === "circle" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-white/5"}`} title="Circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            </button>
            <button onClick={() => setTool("line")} className={`p-3 rounded-2xl transition-all ${tool === "line" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-white/5"}`} title="Line">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19 19 5"/></svg>
            </button>
            <button onClick={() => setTool("eraser")} className={`p-3 rounded-2xl transition-all ${tool === "eraser" ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:bg-white/5"}`} title="Eraser">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.3 4.3c1 1 1 2.5 0 3.4L10.5 21c-1 1-2.5 1-3.4 0Z"/><path d="m22 21-10-10"/><path d="m18 11-4-4"/></svg>
            </button>
          
          <div className="h-px bg-white/10 w-full my-1" />

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-32 flex flex-col items-center">
              <input
                type="range"
                min="1"
                max={tool === "eraser" ? "100" : "40"}
                value={tool === "eraser" ? eraserSize : pencilSize}
                onChange={(e) => tool === "eraser" ? setEraserSize(parseInt(e.target.value)) : setPencilSize(parseInt(e.target.value))}
                className="accent-blue-500 w-24 -rotate-90 origin-center translate-y-8"
              />
            </div>
            <div className="text-[10px] font-bold text-blue-400 mt-2">{tool === "eraser" ? eraserSize : pencilSize}px</div>
          </div>
        </div>

        <div className="glass p-3 rounded-3xl flex flex-col gap-3">
           {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); if(tool === "eraser") setTool("pencil"); }}
                className={`w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${color === c && tool !== "eraser" ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); if(tool === "eraser") setTool("pencil"); }}
              className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
            />
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass w-full max-w-sm p-10 rounded-[2.5rem] border border-white/10">
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Invite Team</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Grow your collaborative session by adding colleagues to this board.</p>
            <form onSubmit={handleInvite} className="flex flex-col gap-5">
              <input
                type="email"
                className="input-field bg-white/5 border-white/10"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                autoFocus
              />
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="secondary-button flex-1 py-3 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="primary-button flex-1 py-3 font-bold uppercase tracking-widest text-[10px]" disabled={inviting}>
                  {inviting ? "Inviting..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <canvas
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        ref={canvasRef}
        style={{
          cursor: tool === "eraser" 
            ? `url('data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}" viewBox="0 0 ${eraserSize} ${eraserSize}">
                  <circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 1}" fill="none" stroke="white" stroke-width="1"/>
                </svg>
              `)}') ${eraserSize / 2} ${eraserSize / 2}, auto`
            : ["rect", "circle", "line"].includes(tool) ? "crosshair" : "crosshair"
        }}
        className="block touch-none bg-[#0a0f1d]"
      />

      <div className="absolute bottom-8 right-8 glass px-5 py-2.5 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest z-20 flex items-center gap-3">
        <span className="text-blue-500/60 uppercase">SyncSketch v2.0</span>
        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
        <span>{boardInfo?.role || "Visitor"} Mode</span>
      </div>
    </div>
  );
}
