"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  KeyRound,
  CreditCard,
  LogOut,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          const keyRes = await fetch("/api/keys/my");
          const keyData = await keyRes.json();
          setKeys(keyData.keys || []);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  if (loading)
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] flex items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="border-4 border-pink-500 border-t-transparent rounded-full w-10 h-10"
        />
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] text-white relative overflow-hidden">
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
            Welcome, {user?.email || "User"}
          </h1>
          <button
            onClick={logout}
            className="mt-3 sm:mt-0 text-sm flex items-center justify-center gap-2 mx-auto sm:mx-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* API Keys Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <KeyRound className="text-pink-400" />
              <h2 className="text-xl sm:text-2xl font-semibold">Your API Keys</h2>
            </div>
          </div>

          {keys.length === 0 ? (
            <p className="text-gray-400 text-sm text-center sm:text-left">
              You haven’t purchased any API keys yet.
            </p>
          ) : (
            <div className="space-y-3">
              {keys.map((k, i) => (
                <div
                  key={i}
                  className="bg-black/40 p-3 sm:p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm font-mono break-all"
                >
                  <span>{k.key}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <button
            onClick={() => router.push("/pricing")}
            className="bg-gradient-to-r from-pink-500 to-rose-400 px-5 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition text-sm sm:text-base"
          >
            <Wallet size={18} /> Buy More Keys
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-400 to-cyan-300 px-5 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition text-sm sm:text-base"
          >
            <CreditCard size={18} /> Home
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm leading-relaxed">
          Powered by{" "}
          <span className="text-pink-400 font-semibold">DevzON</span> •{" "}
          <span className="text-blue-400 font-semibold">Pay Wrapper API</span>
        </p>
      </div>
    </main>
  );
}
