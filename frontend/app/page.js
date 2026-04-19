"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartDrawing = () => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_identity");
    document.cookie = "artist_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <>
      {/* PRELOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            initial={{ x: 0 }}
            exit={{ x: "100%", transition: { ease: [0.76, 0, 0.24, 1], duration: 1 } }}
            className="fixed inset-0 z-[100] bg-[#E9E5D8] flex flex-col items-center justify-center gap-10 overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle, #100B00 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', backgroundPosition: '0 0' }}
          >
            
            {/* Geometric Playful Tumble Animation */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360, borderRadius: ["20%", "50%", "20%"] }} 
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute w-20 h-20 bg-[#FF595E] border-4 border-[#100B00] shadow-[6px_6px_0_#100B00] z-30"
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute w-24 h-24 bg-[#FFCA3A] border-4 border-[#100B00] translate-x-4 -translate-y-4 shadow-[6px_6px_0_#100B00] z-20"
              />
              <motion.div 
                animate={{ rotate: 180, scale: [1.2, 1, 1.2] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute w-28 h-28 bg-[#1982C4] rounded-full border-4 border-[#100B00] -translate-x-6 translate-y-6 shadow-[6px_6px_0_#100B00] z-10"
              />
            </div>

            <motion.div
               animate={{ y: [0, -5, 0] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <p className="text-[#100B00] font-black uppercase tracking-[0.4em] text-2xl drop-shadow-[2px_2px_0_#FFCA3A]">
                WELCOME
              </p>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN SLIDE-DOWN NAVBAR OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.8 }}
            className="fixed inset-0 z-[80] bg-[#1982C4] flex items-center justify-center p-12 lg:p-20 overflow-hidden"
          >
            {/* Close Button */}
            <button onClick={() => setMenuOpen(false)} className="absolute top-10 right-10 w-16 h-16 bg-[#100B00] hover:bg-[#FF595E] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center text-white hover:scale-110 transition-all z-50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="w-full max-w-[1600px] h-full flex flex-col lg:flex-row items-center gap-16 relative">
              
              {/* Left Half: Huge Grid Capsules */}
              <div className="w-full lg:w-1/2 flex flex-col gap-10">
                <span className="text-white font-black tracking-tighter text-6xl lg:text-8xl mb-8 drop-shadow-lg">
                  SyncSketch.
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  {isLoggedIn ? (
                    <div className="sm:col-span-2 grid grid-cols-3 gap-6">
                      <Link href="/dashboard" className="col-span-2 h-32 bg-[#FFCA3A] hover:bg-white text-[#100B00] font-black text-3xl sm:text-4xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                         <span className="group-hover:tracking-widest transition-all uppercase tracking-tighter">Go to Dashboard</span>
                      </Link>
                      <button onClick={handleLogout} className="h-32 bg-[#100B00] hover:bg-[#FF595E] text-white font-black text-2xl sm:text-3xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                         <span className="group-hover:tracking-tighter transition-all uppercase">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link href="/login" className="h-32 bg-[#FFCA3A] hover:bg-white text-[#100B00] font-black text-3xl sm:text-4xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                        <span className="group-hover:tracking-wider transition-all">Log In</span>
                      </Link>
                      <Link href="/register" className="h-32 bg-[#FF595E] hover:bg-white text-white hover:text-[#FF595E] font-black text-3xl sm:text-4xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                        <span className="group-hover:tracking-wider transition-all">Sign Up</span>
                      </Link>
                    </>
                  )}
                  <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="h-32 bg-[#E9E5D8] hover:bg-white text-[#100B00] font-black text-3xl sm:text-4xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                    <span className="group-hover:tracking-wider transition-all">How it works</span>
                  </Link>
                  <Link href="/developer" onClick={() => setMenuOpen(false)} className="h-32 bg-[#100B00] hover:bg-white text-white hover:text-[#100B00] font-black text-3xl sm:text-4xl rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-[1.03] hover:-translate-y-2 group">
                    <span className="group-hover:tracking-wider transition-all">Developer</span>
                  </Link>
                </div>
              </div>

              {/* Right Half: Parallelogram Image Placeholder */}
              <div className="hidden lg:flex w-1/2 h-[80%] items-center justify-center relative">
                 <div className="absolute inset-0 bg-[#FFCA3A] skew-x-[-15deg] rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] transform translate-x-8 translate-y-8 opacity-50"></div>
                 <div className="absolute inset-0 bg-[#FF595E] skew-x-[-15deg] rounded-[4rem] shadow-xl overflow-hidden flex items-center justify-center border-8 border-[#100B00] z-10">
                   {/* This is the placeholder image area */}
                   <span className="skew-x-[15deg] text-white font-black text-4xl opacity-80 uppercase tracking-widest text-center px-10">
                     Image Area <br/> (Insert Link Later)
                   </span>
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PAGE BACKGROUND */}
      <div className="h-screen w-screen bg-[#E9E5D8] font-sans selection:bg-[#FFCA3A] selection:text-[#100B00] overflow-x-hidden flex flex-col relative"
           style={{ backgroundImage: 'radial-gradient(circle, #100B00 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', backgroundPosition: '0 0' }}
      >
        
        {/* PLAYFUL BRIGHT BACKGROUND SHAPES */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[15%] left-[8%] w-28 h-28 rounded-full bg-[#1982C4] shadow-[0_20px_40px_rgba(25,130,196,0.3)]" />
          <motion.div animate={{ y: [0, 30, 0], rotate: [-10, 0, -10] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }} className="absolute top-[20%] right-[6%] w-40 h-40 bg-[#FFCA3A] shadow-[0_20px_40px_rgba(255,202,58,0.3)] rounded-[3rem]" />
          <motion.div animate={{ y: [0, -25, 0], rotate: [10, 45, 10], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }} className="absolute bottom-[10%] left-[20%] w-32 h-32 bg-[#FF595E] shadow-[0_20px_40px_rgba(255,89,94,0.3)] rounded-3xl rotate-12" />
        </div>

        {/* 
          NEW AVANT-GARDE VERTICAL NAVBAR 
        */}
        <nav className="fixed left-6 sm:left-8 top-1/2 -translate-y-1/2 w-[72px] bg-[#E9E5D8]/80 backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-[#100B00] rounded-full py-8 flex flex-col items-center gap-12 z-[60] animate-fade-in">
          {/* Menu Button */}
          <button 
            onClick={() => setMenuOpen(true)}
            className="w-14 h-14 bg-[#100B00] rounded-full flex items-center justify-center text-white hover:bg-[#FF595E] transition-all shadow-lg hover:scale-110 group"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          {/* Vertical Text Logo (REMOVED ARROW ICON) */}
          <div className="writing-vertical flex items-center gap-3" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
            <span className="text-[22px] font-black tracking-[0.2em] text-[#100B00] uppercase">
              SyncSketch
            </span>
          </div>
        </nav>

        {/* MAIN HERO PLATFORM (No backdrop, floating directly over dots) */}
        <main className="flex-1 w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center px-4 md:px-20 text-center pb-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="w-full flex flex-col items-center mt-20">
            
            {/* Live Indicator */}
            <div className="bg-[#100B00] px-8 py-3 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-4 mb-10 transform -rotate-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1982C4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1982C4]"></span>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.25em]">Live Multiplayer Active</span>
            </div>

            {/* Huge Headline */}
            <h1 className="text-[5rem] sm:text-[7rem] md:text-[8rem] lg:text-[10rem] font-black text-[#100B00] leading-[0.9] tracking-tighter mb-8 drop-shadow-[0_10px_0_rgba(0,0,0,0.05)]">
              Create at the <br className="hidden lg:block"/>
              speed of <br className="lg:hidden"/>
              <span className="text-[#FF595E] relative inline-block">
                thought.
                <svg className="absolute -bottom-4 left-0 w-full text-[#FFCA3A] -z-10" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 15 Q 50 25 100 5" fill="transparent" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/></svg>
              </span>
            </h1>

            <p className="max-w-3xl text-[20px] sm:text-[24px] font-bold text-[#100B00]/70 mb-14 leading-relaxed px-4">
              The lightning-fast, high-end collaborative whiteboard designed for professional brainstorming and visual communication. 
            </p>

            {/* CTA */}
            <button 
              onClick={handleStartDrawing}
              className="bg-[#1982C4] hover:bg-[#FF595E] text-white px-14 py-6 rounded-full text-xl font-black transition-all shadow-[0_15px_30px_rgba(25,130,196,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,89,94,0.4)] flex items-center justify-center gap-4 group"
            >
              Start Drawing Now
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            
          </motion.div>
        </main>

      </div>
    </>
  );
}