"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  KeyRound,
  CreditCard,
  LogOut,
  Wallet,
  User,
  Mail,
  Phone,
  UserCircle2,
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
      {/* Background blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-pink-500/25 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-blue-500/25 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
            Welcome, {user?.name || "User"} 👋
          </h1>
          <button
            onClick={logout}
            className="mt-3 sm:mt-0 text-sm flex items-center justify-center gap-2 mx-auto sm:mx-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Profile Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <UserCircle2 className="text-pink-400 w-12 h-12" />
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-gray-400">@{user?.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-0 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-green-400" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-pink-400" />
                <span>
                  {keys.length} API {keys.length === 1 ? "Key" : "Keys"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Keys Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="text-pink-400" />
              <h2 className="text-xl font-semibold">Your API Keys</h2>
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="text-sm bg-pink-500 hover:bg-pink-600 px-3 py-1 rounded-lg font-semibold transition"
            >
              + Buy More
            </button>
          </div>

          {keys.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">
              You haven’t purchased any API keys yet.
            </p>
          ) : (
            <div className="space-y-3">
              {keys.map((k, i) => (
                <div
                  key={i}
                  className="bg-black/40 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs sm:text-sm font-mono"
                >
                  <span className="text-gray-100 break-all">{k.key}</span>
                  <span className="text-gray-400">
                    {new Date(k.createdAt).toLocaleString()}
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
            className="bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition text-sm sm:text-base"
          >
            <Wallet size={18} /> Buy More Keys
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-400 to-cyan-300 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition text-sm sm:text-base"
          >
            <CreditCard size={18} /> Home
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-gray-500 text-xs sm:text-sm">
          Powered by <span className="text-pink-400 font-semibold">DevzON</span> •{" "}
          <span className="text-blue-400 font-semibold">Pay Wrapper API</span>
        </p>
      </div>
    </main>
  );
}
