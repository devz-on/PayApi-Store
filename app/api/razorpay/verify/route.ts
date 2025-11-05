// app/api/razorpay/verify/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import crypto from "crypto";
import jwt from "jsonwebtoken";

function getTokenFromReq(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

export async function POST(req: NextRequest) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET!;
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature !== razorpay_signature) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const { db } = await connect();
  // mark order paid
  const orderDoc = await db.collection("orders").findOneAndUpdate(
    { orderId: razorpay_order_id },
    { $set: { status: "paid", paymentId: razorpay_payment_id, paidAt: new Date() } },
    { returnDocument: "after" }
  );

  // find user id (if logged in)
  let userId: string | null = null;
  const token = getTokenFromReq(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = payload.sub;
    } catch {}
  }

  // create random pay.devxjin.site api key and store
  function randomKey() {
    return "AK_" + crypto.randomBytes(12).toString("hex").toUpperCase();
  }

  const newKey = randomKey();
  await db.collection("pay_keys").insertOne({
    key: newKey,
    ownerId: userId ? new (require("mongodb").ObjectId)(userId) : null,
    createdAt: new Date(),
    meta: { source: "razorpay" },
  });

  // store link between order and generated key
  await db.collection("orders").updateOne(
    { orderId: razorpay_order_id },
    { $set: { generatedKey: newKey } }
  );

  return new Response(
  JSON.stringify({ ok: true, generatedKey: newKey, order: orderDoc?.value || null }),
  { status: 200 }
);
}
