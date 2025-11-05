// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const { db } = await connect();
  const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (existing) return new Response(JSON.stringify({ error: "User exists" }), { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const res = await db.collection("users").insertOne({ email: email.toLowerCase(), passwordHash, createdAt: new Date() });
  const user = { _id: res.insertedId.toString(), email };

  const token = jwt.sign({ sub: user._id, email }, JWT_SECRET, { expiresIn: "30d" });

  // return httpOnly cookie
  const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;

  return new Response(JSON.stringify({ ok: true, user }), {
    status: 201,
    headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
  });
}
