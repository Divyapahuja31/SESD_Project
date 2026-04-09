"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      // Store the token immediately and go to dashboard
      localStorage.setItem("token", result.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass w-full max-w-md p-8 rounded-2xl animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-slate-400 text-center mb-8">Join SyncSketch to start collaborating</p>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-button mt-4" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium ml-1">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
