"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // ✅ Redirect if already logged in
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) router.push("/dashboard");
      } catch {}
    })();
  }, [router]);

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
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setMsg(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMsg("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] flex items-center justify-center text-white relative overflow-hidden">
      {/* Glowing gradient animation */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8">
        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
          <LogIn className="text-blue-400" /> Sign in to DevzON
        </h1>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="text-sm text-gray-300"></label>
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10 mt-1">
              <Mail className="w-4 h-4 text-pink-400 mr-2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          {/* Password field with toggle */}
          <div>
            <label className="text-sm text-gray-300"></label>
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10 mt-1">
              <Lock className="w-4 h-4 text-blue-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-white"
              />
              {showPassword ? (
                <EyeOff
                  onClick={() => setShowPassword(false)}
                  className="w-4 h-4 text-gray-400 cursor-pointer"
                />
              ) : (
                <Eye
                  onClick={() => setShowPassword(true)}
                  className="w-4 h-4 text-gray-400 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Message */}
          {msg && (
            <p
              className={`text-center text-sm mt-2 ${
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

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90 rounded-lg py-2 font-semibold transition mt-4 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </div>

        {/* Back to home */}
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
