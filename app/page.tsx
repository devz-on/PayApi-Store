"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Link2,
  QrCode,
  ChartLine,
  LogIn,
  UserPlus,
  Wallet,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Page() {
  const router = useRouter();
  const exampleKey = "DEVZ_F5851968D7EC96851968";
  const exampleAmt = 10;
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("curl");

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

  const navItems = [
    { label: "Login", icon: LogIn, href: "/auth/login" },
    { label: "Register", icon: UserPlus, href: "/auth/register" },
    { label: "Pricing", icon: Wallet, href: "/pricing" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  ];

  // 🧩 Code Snippets for Multiple Languages
  const codeSnippets: Record<string, string> = {
    curl: `curl -s "https://api.devxjin.net/api/create?api_key=${exampleKey}&amount=${exampleAmt}&format=json" | jq

curl -L "https://api.devxjin.net/api/create/${exampleKey}&${exampleAmt}" --output payment_qr.png`,
    python: `import os
import requests
from dotenv import load_dotenv

# Load from .env file if available
load_dotenv()

API_KEY = os.getenv("API_KEY", "DEVZ_F5851968D7EC96851968")
BASE_URL = "https://store.devxjin.site"

def create_payment(amount):
    url = f"{BASE_URL}/api/create/{API_KEY}&{amount}"
    response = requests.get(url)
    if response.status_code == 200:
        qr_filename = response.text.strip()
        print(f"QR Generated: {qr_filename}")
        print(f"Send this QR to user: {BASE_URL}/{qr_filename}")
        return qr_filename
    else:
        print("Error creating payment:", response.text)

def check_payment_status(qr_filename):
    url = f"{BASE_URL}/api/check/{qr_filename}"
    response = requests.get(url)
    print("Payment Status:", response.json())

# Example Usage
qr_file = create_payment(100)
check_payment_status(qr_file)`,
    javascript: `import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.API_KEY || "DEVZ_F5851968D7EC96851968";
const BASE_URL = "https://store.devxjin.site";

async function createPayment(amount) {
  const url = \`\${BASE_URL}/api/create/\${API_KEY}&\${amount}\`;
  const res = await fetch(url);
  const qrFile = (await res.text()).trim();
  console.log(\`QR Generated: \${qrFile}\`);
  console.log(\`Send this QR to user: \${BASE_URL}/\${qrFile}\`);
  return qrFile;
}

async function checkPaymentStatus(qrFile) {
  const url = \`\${BASE_URL}/api/check/\${qrFile}\`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Payment Status:", data);
}

(async () => {
  const qr = await createPayment(50);
  await checkPaymentStatus(qr);
})();`,
    php: `<?php
$API_KEY = getenv("API_KEY") ?: "DEVZ_F5851968D7EC96851968";
$BASE_URL = "https://store.devxjin.site";

function createPayment($amount) {
    global $BASE_URL, $API_KEY;
    $url = "$BASE_URL/api/create/$API_KEY&$amount";
    $qrFile = trim(file_get_contents($url));
    echo "QR Generated: $qrFile\n";
    echo "Send this QR to user: $BASE_URL/$qrFile\n";
    return $qrFile;
}

function checkPaymentStatus($qrFile) {
    global $BASE_URL;
    $url = "$BASE_URL/api/check/$qrFile";
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    print_r($data);
}

$qr = createPayment(20);
checkPaymentStatus($qr);
?>`,
    go: `package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

var (
	API_KEY  = getenv("API_KEY", "DEVZ_F5851968D7EC96851968")
	BASE_URL = "https://store.devxjin.site"
)

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func createPayment(amount int) string {
	url := fmt.Sprintf("%s/api/create/%s&%d", BASE_URL, API_KEY, amount)
	resp, _ := http.Get(url)
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	qrFile := string(body)
	fmt.Println("QR Generated:", qrFile)
	fmt.Println("Send this QR to user:", BASE_URL+"/"+qrFile)
	return qrFile
}

func checkPaymentStatus(qrFile string) {
	url := fmt.Sprintf("%s/api/check/%s", BASE_URL, qrFile)
	resp, _ := http.Get(url)
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("Payment Status:", string(body))
}

func main() {
	qr := createPayment(10)
	checkPaymentStatus(qr)
}`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] text-white relative overflow-hidden">
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-pink-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navbar */}
        <motion.nav
          className="flex justify-between items-center mb-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            onClick={() => router.push("/")}
            className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent cursor-pointer"
          >
            Devz Pay Wrapper
          </h1>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex gap-3 text-sm">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
            Devz Pay Wrapper API
          </h1>
          <p className="text-gray-300 mt-3 text-base sm:text-lg max-w-2xl mx-auto px-3">
            Supercharge your payment workflows with a simple, beautiful REST API.
            Generate QR payments and check status instantly.
          </p>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 text-blue-300">
            📊 API Usage
          </h2>
          <div className="h-60 sm:h-64">
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#60a5fa"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Multilingual Examples */}
        <motion.div
          className="bg-black/50 border border-white/10 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-pink-300 flex items-center gap-2">
            💻 Integration Examples
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(codeSnippets).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  lang === l
                    ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white"
                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="text-xs sm:text-sm text-gray-300 font-mono bg-[#111827] p-4 rounded-lg overflow-x-auto">
              {codeSnippets[lang]}
            </pre>
            <button
              onClick={() => copyToClipboard(codeSnippets[lang])}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-10 text-center text-gray-500 text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Made with ❤️ by <span className="text-pink-400 font-semibold">DevzON</span> • Powered by{" "}
          <span className="text-blue-400 font-semibold">Next.js + Tailwind + Framer Motion</span>
        </motion.footer>
      </div>
    </main>
  );
}
