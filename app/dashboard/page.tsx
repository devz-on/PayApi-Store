"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, CreditCard, LogOut, Wallet, ArrowRight } from "lucide-react";

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
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
            Welcome, {user?.email || "User"}
          </h1>
          <button
            onClick={logout}
            className="text-sm flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* API Keys Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4 gap-2">
            <KeyRound className="text-pink-400" />
            <h2 className="text-2xl font-semibold">Your API Keys</h2>
          </div>

          {keys.length === 0 ? (
            <p className="text-gray-400 text-sm">
              You haven’t purchased any API keys yet.
            </p>
          ) : (
            <div className="space-y-3">
              {keys.map((k, i) => (
                <div
                  key={i}
                  className="bg-black/40 p-3 rounded-lg border border-white/10 flex justify-between items-center font-mono text-sm"
                >
                  <span>{k.key}</span>
                  <span className="text-gray-400">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push("/pricing")}
            className="bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition"
          >
            <Wallet size={20} /> Buy More Keys
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-400 to-cyan-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition"
          >
            <CreditCard size={20} /> Home
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-gray-500 text-sm">
          Powered by <span className="text-pink-400 font-semibold">DevzON</span> •{" "}
          <span className="text-blue-400 font-semibold">Pay Wrapper API</span>
        </p>
      </div>
    </main>
  );
}
