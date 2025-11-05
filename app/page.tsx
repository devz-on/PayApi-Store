"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Link2, QrCode, ChartLine, LogIn, UserPlus, Wallet, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Page() {
  const router = useRouter();
  const exampleKey = "F5851968D6E1165407EC";
  const exampleAmt = 10;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const data = [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 200 },
    { name: "Wed", value: 150 },
    { name: "Thu", value: 300 },
    { name: "Fri", value: 250 },
    { name: "Sat", value: 180 },
    { name: "Sun", value: 320 },
  ];

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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* 🔹 Navbar */}
        <motion.nav
          className="flex justify-between items-center mb-12 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent cursor-pointer"
          >
            Devz Pay Wrapper
          </h1>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => router.push("/auth/login")}
              className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <LogIn size={16} /> Login
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="flex items-center gap-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg transition"
            >
              <UserPlus size={16} /> Register
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              <Wallet size={16} /> Pricing
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
            Devz Pay Wrapper API
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
            Supercharge your payment workflows with a beautiful, simple REST API wrapper built by{" "}
            <span className="text-pink-400 font-semibold">DevzON</span>.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {[
            {
              title: "Create & Get QR",
              desc: "Generate payment QR instantly as PNG",
              icon: QrCode,
              color: "from-pink-500 to-rose-400",
              code: `/api/create/${exampleKey}&${exampleAmt}`,
            },
            {
              title: "Check Payment Status",
              desc: "Instantly verify user payment completion",
              icon: ChartLine,
              color: "from-green-400 to-emerald-300",
              code: `/api/check/plink_RbzEMIE8Rejwhw`,
            },
            {
              title: "JSON Mode",
              desc: "Receive structured JSON with QR link",
              icon: Link2,
              color: "from-blue-400 to-cyan-300",
              code: `/api/create?api_key=${exampleKey}&amount=${exampleAmt}&format=json`,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-pink-500/10 transition"
            >
              <div className="flex items-center mb-3">
                <card.icon
                  className={`w-8 h-8 text-transparent bg-gradient-to-r ${card.color} bg-clip-text`}
                />
                <h2 className="text-xl font-semibold ml-3">{card.title}</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">{card.desc}</p>
              <div className="bg-black/40 p-3 rounded-md text-sm font-mono break-all">
                {card.code}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div
          className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-300">
            📊 API Usage (Demo)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Example Commands Section */}
        <motion.div
          className="mt-16 bg-black/50 border border-white/10 rounded-xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-3 text-pink-300 flex items-center">
            Example Commands
            {copied ? (
              <Check className="w-4 h-4 ml-2 text-green-400" />
            ) : (
              <Copy
                className="w-4 h-4 ml-2 text-gray-400 cursor-pointer hover:text-white"
                onClick={() =>
                  copyToClipboard(
                    `curl -L "https://your-vercel-app.vercel.app/api/create/${exampleKey}&${exampleAmt}" --output plink_example.png\n\ncurl -s "https://your-vercel-app.vercel.app/api/check/plink_RbzEMIE8Rejwhw" | jq`
                  )
                }
              />
            )}
          </h2>
          <pre className="text-sm text-gray-300 font-mono bg-[#111827] p-4 rounded-lg overflow-x-auto">
{`curl -L "https://your-vercel-app.vercel.app/api/create/${exampleKey}&${exampleAmt}" --output plink_example.png

curl -s "https://your-vercel-app.vercel.app/api/check/plink_RbzEMIE8Rejwhw" | jq`}
          </pre>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-12 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Made with ❤️ by{" "}
          <span className="text-pink-400 font-semibold">DevzON</span> • Powered by{" "}
          <span className="text-blue-400 font-semibold">Next.js + Tailwind + Framer Motion</span>
        </motion.footer>
      </div>
    </main>
  );
}
