"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, ArrowLeft, User, Phone, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [avail, setAvail] = useState<{ [k: string]: boolean | undefined }>({});
  const [checking, setChecking] = useState<{ [k: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 🧠 Check availability of username/email/phone
  async function checkAvail(field: "username" | "email" | "phone", value: string) {
    if (!value.trim()) return;
    setChecking((prev) => ({ ...prev, [field]: true }));
    try {
      const res = await fetch(
        `/api/auth/check?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`
      );
      const d = await res.json();
      setAvail((prev) => ({ ...prev, [field]: !!d.available }));
    } catch {
      setAvail((prev) => ({ ...prev, [field]: undefined }));
    } finally {
      setChecking((prev) => ({ ...prev, [field]: false }));
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg("✅ Account created! Redirecting...");
        setTimeout(() => router.push(`/auth/verify?email=${form.email}`), 1200);
      } else {
        setMsg(`❌ ${data.error || "Registration failed"}`);
      }
    } catch {
      setMsg("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] flex items-center justify-center text-white relative overflow-hidden">
      {/* Floating background blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-blue-400 bg-clip-text text-transparent">
          <UserPlus className="text-pink-400" /> Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-300">Full Name</label>
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg border border-white/10 mt-1">
              <User className="w-4 h-4 text-pink-400 mr-2" />
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm text-gray-300">Username</label>
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg border border-white/10 mt-1 relative">
              <User className="w-4 h-4 text-blue-400 mr-2" />
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                onBlur={(e) => checkAvail("username", e.target.value)}
                placeholder="devzon"
                className="bg-transparent w-full outline-none text-white pr-6"
              />
              {/* ✅ / ❌ / ⏳ */}
              <div className="absolute right-3">
                {checking.username ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"
                  />
                ) : avail.username === true ? (
                  <Check className="text-green-400 w-5 h-5" />
                ) : avail.username === false ? (
                  <X className="text-red-400 w-5 h-5" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg border border-white/10 mt-1 relative">
              <Mail className="w-4 h-4 text-pink-400 mr-2" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                onBlur={(e) => checkAvail("email", e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent w-full outline-none text-white pr-6"
              />
              <div className="absolute right-3">
                {checking.email ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"
                  />
                ) : avail.email === true ? (
                  <Check className="text-green-400 w-5 h-5" />
                ) : avail.email === false ? (
                  <X className="text-red-400 w-5 h-5" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-300">Phone Number</label>
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg border border-white/10 mt-1 relative">
              <Phone className="w-4 h-4 text-green-400 mr-2" />
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                onBlur={(e) => checkAvail("phone", e.target.value)}
                placeholder="+91 9876543210"
                className="bg-transparent w-full outline-none text-white pr-6"
              />
              <div className="absolute right-3">
                {checking.phone ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"
                  />
                ) : avail.phone === true ? (
                  <Check className="text-green-400 w-5 h-5" />
                ) : avail.phone === false ? (
                  <X className="text-red-400 w-5 h-5" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg border border-white/10 mt-1">
              <Lock className="w-4 h-4 text-blue-400 mr-2" />
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          {msg && <p className="text-center text-sm text-gray-400 mt-3">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 rounded-lg py-2 font-semibold transition mt-4"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

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
