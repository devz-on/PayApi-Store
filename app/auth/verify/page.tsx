export const dynamic = "force-dynamic";
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, LockKeyhole, User, Phone } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromURL = searchParams.get("email");
  const name = searchParams.get("name");
  const username = searchParams.get("username");
  const phone = searchParams.get("phone");

  const [email, setEmail] = useState(emailFromURL || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!emailFromURL) router.push("/auth/register");
  }, [emailFromURL, router]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg("✅ Verified! Redirecting to Dashboard...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setMsg(`❌ ${data.error || "Verification failed"}`);
      }
    } catch {
      setMsg("❌ Network error. Try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] text-white relative overflow-hidden">
      {/* Animated background glow */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -80, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-4 text-center bg-gradient-to-r from-pink-500 to-blue-400 bg-clip-text text-transparent">
          Verify Your Email
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">
          Please enter the 6-digit verification code sent to your email.
        </p>

        {/* User Info Preview */}
        <div className="space-y-3 mb-5">
          {name && (
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10">
              <User className="w-4 h-4 text-pink-400 mr-2" />
              <span className="text-sm text-gray-300">{name}</span>
            </div>
          )}
          {username && (
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10">
              <LockKeyhole className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-300">@{username}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10">
              <Phone className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">{phone}</span>
            </div>
          )}
          <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/10 opacity-60">
            <Mail className="w-4 h-4 text-yellow-400 mr-2" />
            <input
              type="email"
              value={email}
              readOnly
              className="bg-transparent w-full text-gray-300 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={verify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white text-center tracking-widest text-lg outline-none focus:ring-2 focus:ring-pink-500 transition"
          />

          {msg && (
            <p
              className={`text-center text-sm ${
                msg.startsWith("✅") ? "text-green-400" : "text-gray-400"
              }`}
            >
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Didn’t receive the code?{" "}
          <span
            onClick={() => router.push(`/auth/resend?email=${email}`)}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Resend Code
          </span>
        </div>
      </div>
    </main>
  );
}
