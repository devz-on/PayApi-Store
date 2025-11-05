// app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import connect from "@/lib/mongo";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

function getTokenFromReq(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

export async function GET(req: NextRequest) {
  const token = getTokenFromReq(req);
  if (!token) return new Response(JSON.stringify({ user: null }), { status: 200 });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const { db } = await connect();
    const user = await db.collection("users").findOne({ _id: new (require("mongodb").ObjectId)(payload.sub) });
    if (!user) return new Response(JSON.stringify({ user: null }), { status: 200 });
    return new Response(JSON.stringify({ user: { _id: user._id.toString(), email: user.email } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ user: null }), { status: 200 });
  }
}
