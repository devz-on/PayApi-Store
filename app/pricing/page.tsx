"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, Wallet } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ On mount: sync token from localStorage → cookie, then fetch user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Ensure backend sees token as a cookie
      document.cookie = `token=${token}; path=/; secure; samesite=strict; max-age=86400`;
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const plans = [
      {
          id: "starter",
          title: "Starter",
          price: 400,
          duration: "/M",
          desc: "For individuals earning under ₹5,000/month.",
          perks: ["1 API Key", "100 QR create requests/day", "Standard Support"],
          color: "from-blue-400 to-cyan-300",
      },
      {
          id: "pro",
          title: "Pro",
          price: 700,
          duration: "/M",
          desc: "For developers earning under ₹15,000/month.",
          perks: ["1 API Key", "850 QR create requests/week", "Better Technical Support"],
          color: "from-pink-500 to-rose-400",
      },
      {
          id: "enterprise",
          title: "Enterprise",
          price: 1500,
          duration: "/M",
          desc: "For industrial clients earning under ₹70,000/month.",
          perks: ["1 API Key", "1400 QR create requests/week", "Best Support"],
          color: "from-yellow-400 to-orange-500",
      },
];


  const buy = async (plan: any) => {
    if (loading) {
      alert("Checking your login status...");
      return;
    }
    
    if (isNaN(Number(plan.price))) {
      alert("Invalid plan amount.");
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      console.log("🛒 Creating Razorpay order for:", plan.title);

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          description: `Buy ${plan.title} Plan`,
        }),
      });

      const data = await res.json();
      console.log("✅ Order API response:", data);

      if (!data.ok || !data.order?.id) {
        alert("Failed to create Razorpay order. Please try again later.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "DevzON - API Plan",
        description: plan.title,
        order_id: data.order.id,
        handler: async function (response: any) {
          console.log("💰 Razorpay payment response:", response);
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...response, planId: plan.id }),
          });
          const verifyData = await verifyRes.json();
          console.log("🔍 Verify response:", verifyData);

          if (verifyData.ok) {
            alert(
              `✅ Payment successful! Your API Key (valid 1 month): ${verifyData.generatedKey}`
            );
            router.push("/dashboard");
          } else {
            alert("❌ Verification failed. Please contact support.");
          }
        },
        theme: { color: "#F472B6" },
      };

      // @ts-ignore
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("❌ Payment Error:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated blobs */}
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Choose Your Plan 💳
        </motion.h1>

        <motion.p
          className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          All plans include 1 API key valid for one month.  
          Choose the one that fits your needs and pay securely via{" "}
          <span className="text-pink-400 font-semibold">Razorpay</span>.
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-pink-500/10 transition relative overflow-hidden"
            >
              <h2
                className={`text-3xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
              >
                {plan.title}
              </h2>
              <p className="text-gray-300 mt-2 text-sm mb-4">{plan.desc}</p>

              <div className="text-5xl font-extrabold text-white mb-6">
                ₹{plan.price}
                <span className="text-2xl text-gray-400 ">{plan.duration}</span>
              </div>

              <ul className="space-y-3 text-gray-300 mb-8 text-sm">
                {plan.perks.map((perk, j) => (
                  <li key={j} className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} className="text-green-400" />
                    {perk}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buy(plan)}
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 font-semibold text-lg transition flex items-center justify-center gap-2 shadow-md"
              >
                <Wallet size={20} /> {loading ? "Loading..." : "Buy Now"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Back to home */}
        <div className="mt-10">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 mx-auto text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
