"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Developer() {
  
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }, []);

  return (
    <div className="min-h-screen bg-[#E9E5D8] flex flex-col p-4 sm:p-12 font-sans selection:bg-[#FF595E] selection:text-[#FFFFFF] relative overflow-clip">
      
      {/* Floating Background Geometry */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <motion.div animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [20, 40, 20] }} transition={{ repeat: Infinity, duration: 10 }} className="absolute bottom-20 right-20 w-48 h-48 rounded-[3rem] bg-[#FFCA3A] shadow-2xl border-4 border-[#100B00]" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 w-full mb-12 flex justify-between items-center animate-fade-in">
        <Link href="/" className="bg-[#100B00] text-white px-6 py-3 rounded-full font-black flex items-center gap-2 hover:bg-[#1982C4] border-4 border-transparent hover:border-[#100B00] shadow-[4px_4px_0_#100B00] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[0px_0px_0_#100B00]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          BACK HOME
        </Link>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border-4 border-[#100B00] shadow-[4px_4px_0_#100B00]">
          <span className="font-black text-[#100B00] tracking-widest uppercase">Creator</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center relative z-10 animate-fade-in mb-20 lg:mb-0">

        <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black text-[#100B00] tracking-tighter mb-4 text-center leading-[0.9] drop-shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          MEET THE <br className="hidden sm:block"/>
          <span className="text-[#FF595E] drop-shadow-[4px_4px_0_#100B00] relative">
             DEVELOPER.
             <svg className="absolute -bottom-6 left-0 w-full text-[#1982C4] -z-10" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 15 Q 50 25 100 5" fill="transparent" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/></svg>
          </span>
        </h1>

        {/* Profile Card Container */}
        <div className="mt-20 w-full max-w-4xl relative">
          
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border-4 border-[#100B00] rounded-[3rem] p-10 lg:p-16 flex flex-col md:flex-row items-center gap-12 shadow-[15px_15px_0_#100B00] relative z-20">
            
            {/* Minimalist Avatar */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#100B00] border-4 border-[#100B00] shrink-0 border-dashed animate-[spin_30s_linear_infinite] p-2">
              <div className="w-full h-full bg-[#E9E5D8] rounded-full border-4 border-[#100B00] overflow-hidden relative group">
                <div className="absolute inset-0 bg-[#FFCA3A] translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center">
                  <span className="text-6xl animate-bounce">👋</span>
                </div>
                 {/* Fake Face / Icon */}
                 <svg viewBox="0 0 200 200" className="w-full h-full text-[#100B00] absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"><circle cx="100" cy="100" r="90" fill="none" strokeWidth="4"/><circle cx="70" cy="80" r="10" fill="currentColor"/><circle cx="130" cy="80" r="10" fill="currentColor"/><path d="M60 130 C 80 160, 120 160, 140 130" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
               <div className="bg-[#1982C4] text-white px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest border-2 border-[#100B00] mb-4">
                 Full Stack Engineer
               </div>
               
               <h2 className="text-5xl sm:text-6xl font-black text-[#100B00] tracking-tighter mb-4">
                 Divya Pahuja
               </h2>
               
               <p className="text-xl font-bold text-[#100B00]/70 mb-8 leading-relaxed max-w-lg">
                 Architect behind SyncSketch. Specializing in high-performance web sockets, brutalist interfaces, and scalable serverless architecture.
               </p>

               <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                 <a 
                   href="https://www.linkedin.com/in/divya-pahuja25/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-[#FFCA3A] text-[#100B00] px-8 py-4 border-4 border-[#100B00] rounded-2xl font-black shadow-[4px_4px_0_#100B00] hover:-translate-y-1 hover:shadow-[6px_6px_0_#100B00] active:translate-y-0 active:shadow-[0px_0px_0_#100B00] transition-all text-center"
                 >
                   LINKEDIN
                 </a>
                 <a 
                   href="https://github.com/Divyapahuja31" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-white text-[#100B00] px-8 py-4 border-4 border-[#100B00] rounded-2xl font-black shadow-[4px_4px_0_#100B00] hover:-translate-y-1 hover:shadow-[6px_6px_0_#100B00] active:translate-y-0 active:shadow-[0px_0px_0_#100B00] transition-all text-center"
                 >
                   GITHUB
                 </a>
               </div>
            </div>
            
          </motion.div>

        </div>

      </main>
    </div>
  );
}
