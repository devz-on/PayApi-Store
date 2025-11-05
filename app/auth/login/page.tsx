"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg("✅ Login successful! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setMsg(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMsg("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] flex items-center justify-center text-white relative overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -60, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
          <LogIn className="text-blue-400" /> Login
        </h1>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10 mt-1">
              <Mail className="w-4 h-4 text-pink-400 mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10 mt-1">
              <Lock className="w-4 h-4 text-blue-400 mr-2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          {/* Status message */}
          {msg && (
            <p
              className={`text-center text-sm ${
                msg.startsWith("✅")
                  ? "text-green-400"
                  : msg.startsWith("❌")
                  ? "text-red-400"
                  : "text-gray-300"
              }`}
            >
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg py-2 font-semibold transition mt-4 shadow-md"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </div>

        {/* Back button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
