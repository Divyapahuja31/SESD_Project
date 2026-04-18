"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../services/api";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_identity", JSON.stringify(data.user));
      // Set cookie for server-side rendering
      document.cookie = `artist_name=${data.user.email.split('@')[0]}; path=/; max-age=604800; samesite=lax`;
      
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E5D8] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#FFCA3A] selection:text-[#100B00] relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle, #100B00 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}>
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute -top-10 left-[15%] w-40 h-40 rounded-full bg-[#1982C4] shadow-lg border-4 border-[#100B00]" />
         <motion.div animate={{ y: [0, 30, 0], rotate: [-10, 0, -10] }} transition={{ repeat: Infinity, duration: 8, delay: 1 }} className="absolute bottom-10 right-[15%] w-64 h-32 bg-[#FFCA3A] shadow-xl rounded-full border-4 border-[#100B00] rotate-12" />
      </div>

      <div className="bg-white w-full max-w-[1100px] rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border-4 border-[#100B00] flex p-3 relative z-10 overflow-hidden min-h-[650px] animate-fade-in">
        
        {/* Left Visual Column */}
        <div className="hidden lg:flex flex-1 bg-[#1982C4] rounded-[2.5rem] border-4 border-[#100B00] relative items-center justify-center overflow-hidden">
           
           <div className="absolute top-10 left-10 text-[#100B00] font-black text-3xl tracking-tighter mix-blend-overlay">
             SyncSketch.
           </div>
           
           <div className="relative z-10 text-center flex flex-col items-center">
              {/* Playful Geometry */}
              <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute w-full h-full border-8 border-[#FFCA3A] rounded-full border-dashed"></motion.div>
                 <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute w-32 h-32 bg-[#FF595E] rounded-3xl border-4 border-[#100B00] rotate-12 shadow-[8px_8px_0_#100B00]"></motion.div>
                 <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute w-28 h-28 bg-[#FFCA3A] rounded-full border-4 border-[#100B00] -translate-x-12 translate-y-12 shadow-[8px_8px_0_#100B00]"></motion.div>
              </div>
              
              <h2 className="text-4xl font-black text-white hover:text-[#FFCA3A] transition-colors tracking-tight drop-shadow-md">
                Welcome Back.
              </h2>
              <p className="text-white/80 font-bold mt-4 text-lg max-w-xs">
                Log in to continue building at the speed of thought.
              </p>
           </div>
        </div>

        {/* Right Form Column */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-20 py-12 bg-white rounded-[2rem]">
          <h1 className="text-5xl font-black text-[#100B00] mb-2 tracking-tighter">Log In</h1>
          <p className="text-[#100B00]/60 font-bold mb-10">Access your digital workspace.</p>

          {error && (
            <div className="bg-[#FF595E]/10 border-2 border-[#FF595E] text-[#FF595E] p-4 rounded-2xl text-sm mb-6 text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6 text-[#100B00]">
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[#100B00] uppercase tracking-widest ml-1">Email</label>
              <div className="flex items-center border-4 border-[#100B00] rounded-2xl overflow-hidden focus-within:border-[#1982C4] transition-colors bg-white shadow-[4px_4px_0_#100B00] hover:shadow-[6px_6px_0_#100B00] focus-within:shadow-[6px_6px_0_#1982C4]">
                <div className="px-5 text-[#100B00]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div className="w-1 h-8 bg-[#100B00]/10" />
                <input
                  suppressHydrationWarning
                  type="email"
                  className="flex-1 px-5 py-4 outline-none font-bold text-lg text-[#100B00] bg-transparent placeholder:text-[#100B00]/30"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[#100B00] uppercase tracking-widest ml-1">Password</label>
              <div className="flex items-center border-4 border-[#100B00] rounded-2xl overflow-hidden focus-within:border-[#1982C4] transition-colors bg-white shadow-[4px_4px_0_#100B00] hover:shadow-[6px_6px_0_#100B00] focus-within:shadow-[6px_6px_0_#1982C4]">
                <div className="px-5 text-[#100B00]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="w-1 h-8 bg-[#100B00]/10" />
                <input
                  suppressHydrationWarning
                  type="password"
                  className="flex-1 px-5 py-4 outline-none font-bold text-lg text-[#100B00] bg-transparent placeholder:text-[#100B00]/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-black text-[#FFCA3A] hover:text-[#FF595E] transition-colors">Forgot Password?</a>
              </div>
            </div>

            <button 
              type="submit" 
              className="mt-4 w-full bg-[#FF595E] hover:bg-[#100B00] text-white font-black text-xl py-5 rounded-2xl transition-all shadow-[6px_6px_0_#100B00] hover:-translate-y-1 hover:shadow-[8px_8px_0_#100B00] active:translate-y-1 active:shadow-[2px_2px_0_#100B00]"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "LOG IN NOW"}
            </button>
          </form>

          <p className="text-center mt-12 text-[#100B00]/60 text-sm font-bold">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#100B00] hover:text-[#1982C4] font-black border-b-2 border-[#100B00] pb-0.5 ml-1 transition-colors uppercase tracking-wider">
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#E9E5D8] flex items-center justify-center p-6">
        <div className="w-12 h-12 border-[6px] border-[#FFCA3A]/30 border-t-[#FF595E] rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
