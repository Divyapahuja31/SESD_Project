"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function HowItWorks() {
  
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }, []);

  return (
    <div className="min-h-screen bg-[#E9E5D8] flex flex-col p-4 sm:p-12 font-sans selection:bg-[#FFCA3A] selection:text-[#100B00] relative overflow-clip">
      
      {/* Floating Background Geometry */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <motion.div animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute text-[#FF595E] top-[10%] left-[5%] opacity-80">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 22 2 22"/></svg>
         </motion.div>
         <motion.div animate={{ y: [0, 40, 0], rotate: [-20, 0, -20] }} transition={{ repeat: Infinity, duration: 10, delay: 1 }} className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-[#1982C4] shadow-xl rounded-full border-4 border-[#100B00]" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 w-full mb-12 flex justify-between items-center animate-fade-in">
        <Link href="/" className="bg-[#100B00] text-white px-6 py-3 rounded-full font-black flex items-center gap-2 hover:bg-[#FFCA3A] hover:text-[#100B00] border-4 border-transparent hover:border-[#100B00] shadow-[4px_4px_0_#100B00] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[0px_0px_0_#100B00]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          BACK HOME
        </Link>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border-4 border-[#100B00] shadow-[4px_4px_0_#100B00]">
          <span className="font-black text-[#100B00] tracking-widest uppercase">Process</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center relative z-10 z-10 animate-fade-in">
        <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black text-[#100B00] tracking-tighter mb-16 text-center leading-[0.9] drop-shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          HOW IT <br className="hidden sm:block"/> <span className="text-[#FFCA3A] drop-shadow-[4px_4px_0_#100B00]">WORKS.</span>
        </h1>

        {/* Steps Container */}
        <div className="w-full flex flex-col gap-10 lg:gap-16 pb-20">
          
          {/* Step 1 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col lg:flex-row items-stretch gap-0 w-full group">
            <div className="bg-[#100B00] text-[#FFCA3A] text-8xl font-black flex items-center justify-center lg:w-48 py-10 lg:py-0 border-4 border-[#100B00] rounded-t-[3rem] lg:rounded-tr-none lg:rounded-l-[3rem]">
              1
            </div>
            <div className="flex-1 bg-white border-4 border-[#100B00] border-t-0 lg:border-t-4 lg:border-l-0 p-10 sm:p-14 rounded-b-[3rem] lg:rounded-bl-none lg:rounded-r-[3rem] shadow-[10px_10px_0_#100B00] transition-transform group-hover:-translate-y-1 group-hover:shadow-[14px_14px_0_#100B00]">
              <h2 className="text-4xl sm:text-5xl font-black text-[#100B00] mb-4 tracking-tight">Create a Secure Board</h2>
              <p className="text-2xl font-bold text-[#100B00]/70 max-w-2xl leading-relaxed">
                Sign up and instantly spawn a private, high-performance digital canvas. Your boards are saved securely and immediately available.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col lg:flex-row-reverse items-stretch gap-0 w-full group">
            <div className="bg-[#FF595E] text-white text-8xl font-black flex items-center justify-center lg:w-48 py-10 lg:py-0 border-4 border-[#100B00] rounded-t-[3rem] lg:rounded-tl-none lg:rounded-r-[3rem]">
              2
            </div>
            <div className="flex-1 bg-white border-4 border-[#100B00] border-t-0 lg:border-t-4 lg:border-r-0 p-10 sm:p-14 rounded-b-[3rem] lg:rounded-br-none lg:rounded-l-[3rem] shadow-[10px_10px_0_#100B00] transition-transform group-hover:-translate-y-1 group-hover:shadow-[14px_14px_0_#100B00]">
              <h2 className="text-4xl sm:text-5xl font-black text-[#100B00] mb-4 tracking-tight">Invite Collaborators</h2>
              <p className="text-2xl font-bold text-[#100B00]/70 max-w-2xl leading-relaxed">
                Share a live socket-link with anyone. Everyone draws, erases, and ideates in absolute sub-millisecond sync across the globe.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col lg:flex-row items-stretch gap-0 w-full group">
            <div className="bg-[#1982C4] text-white text-8xl font-black flex items-center justify-center lg:w-48 py-10 lg:py-0 border-4 border-[#100B00] rounded-t-[3rem] lg:rounded-tr-none lg:rounded-l-[3rem]">
              3
            </div>
            <div className="flex-1 bg-white border-4 border-[#100B00] border-t-0 lg:border-t-4 lg:border-l-0 p-10 sm:p-14 rounded-b-[3rem] lg:rounded-bl-none lg:rounded-r-[3rem] shadow-[10px_10px_0_#100B00] transition-transform group-hover:-translate-y-1 group-hover:shadow-[14px_14px_0_#100B00]">
              <h2 className="text-4xl sm:text-5xl font-black text-[#100B00] mb-4 tracking-tight">Sketch Intuitively</h2>
              <p className="text-2xl font-bold text-[#100B00]/70 max-w-2xl leading-relaxed">
                Enjoy fluid bezier-curved drawing, flawless pressure sensitivity, and robust undo/redo capabilities exactly like paper.
              </p>
            </div>
          </motion.div>

        </div>
        
        {/* Massive Call To Action */}
        <div className="w-full mt-10 mb-20 flex justify-center">
            <Link href="/register" className="bg-[#FFCA3A] text-[#100B00] font-black w-full max-w-3xl py-10 rounded-[3rem] text-4xl sm:text-6xl border-4 border-[#100B00] shadow-[15px_15px_0_#100B00] hover:-translate-y-4 hover:shadow-[20px_20px_0_#100B00] active:translate-y-2 active:shadow-[5px_5px_0_#100B00] transition-all flex items-center justify-center gap-6">
                 TRY IT NOW
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
        </div>

      </main>
    </div>
  );
}
