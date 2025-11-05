// app/api/razorpay/create-order/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import jwt from "jsonwebtoken";

// ✅ Razorpay import via require() for CommonJS compatibility
const Razorpay = require("razorpay");

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  [key: string]: any;
};

// === ENVIRONMENT CONFIG ===
const key_id = process.env.RAZORPAY_KEY_ID!;
const key_secret = process.env.RAZORPAY_KEY_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

if (!key_id || !key_secret) throw new Error("Razorpay keys missing");
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

const razorpay = new Razorpay({ key_id, key_secret });

// === Extract token from cookies ===
function getTokenFromReq(req: NextRequest): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", description = "Pay for API key" } = body;

    if (!amount || typeof amount !== "number") {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Create Razorpay order
    const order: RazorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
      notes: { description },
    });

    // ✅ Identify user from token (optional)
    const token = getTokenFromReq(req);
    let userId: string | null = null;

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.sub || null;
      } catch (err) {
        console.warn("Invalid JWT token for order:", err);
      }
    }

    // ✅ Save order in MongoDB
    const { db } = await connect();
    await db.collection("orders").insertOne({
      orderId: order.id,
      userId,
      amount,
      currency,
      description,
      status: "created",
      razorpayOrder: order,
      createdAt: new Date(),
    });

    // ✅ Return order to frontend
    return new Response(JSON.stringify({ ok: true, order }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
