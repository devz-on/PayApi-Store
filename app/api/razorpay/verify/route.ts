// app/api/razorpay/verify/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Helper: Extract token from cookies
function getTokenFromReq(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

// Helper: Generate random API key
function randomKey() {
  return "DEVZ_" + crypto.randomBytes(12).toString("hex").toUpperCase();
}

// Plan limits
const PLAN_DETAILS: Record<string, any> = {
  starter: {
    title: "Starter",
    price: 400,
    limit: "100/day",
    expiryDays: 30,
  },
  pro: {
    title: "Pro",
    price: 700,
    limit: "850/week",
    expiryDays: 30,
  },
  enterprise: {
    title: "Enterprise",
    price: 1500,
    limit: "1400/week",
    expiryDays: 30,
  },
};

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    // ✅ Verify Razorpay signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
      });
    }

    const { db } = await connect();

    // ✅ Mark order as paid
    const orderDoc = await db.collection("orders").findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        $set: {
          status: "paid",
          paymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    // ✅ Verify user from JWT
    let userId: ObjectId | null = null;
    const token = getTokenFromReq(req);
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = new ObjectId(payload.sub);
      } catch {
        console.warn("Invalid JWT or user not found");
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User not logged in" }),
        { status: 401 }
      );
    }

    // ✅ Get user's phone from database
    const user = await db.collection("users").findOne({ _id: userId });
    const userPhone = user?.phone || "N/A";

    // ✅ Find plan details
    const plan = PLAN_DETAILS[planId];
    if (!plan) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
      });
    }

    // ✅ Generate new API key
    const newKey = randomKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.expiryDays);

    await db.collection("apikeys").insertOne({
      key: newKey,
      ownerId: userId,
      phone: userPhone,
      plan: planId,
      createdAt: new Date(),
      expiresAt: expiryDate,
      rateLimit: plan.limit,
      status: "active",
      meta: {
        price: plan.price,
        source: "razorpay",
        orderId: razorpay_order_id,
      },
    });

    // ✅ Store link between order and generated key
    await db.collection("orders").updateOne(
      { orderId: razorpay_order_id },
      {
        $set: {
          generatedKey: newKey,
          planId,
          apiKeyExpiresAt: expiryDate,
        },
      }
    );

    console.log(`✅ API key generated for ${planId} plan: ${newKey}`);

    return new Response(
      JSON.stringify({
        ok: true,
        generatedKey: newKey,
        expiresAt: expiryDate,
        plan: plan.title,
        order: orderDoc?.value || null,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Verification error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
