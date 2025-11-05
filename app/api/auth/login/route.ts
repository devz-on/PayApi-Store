// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { db } = await connect();

    // Always store and query lowercase emails
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;

    return new Response(
      JSON.stringify({
        ok: true,
        user: { _id: user._id.toString(), email: user.email },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
