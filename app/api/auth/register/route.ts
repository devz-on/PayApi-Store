// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import bcrypt from "bcryptjs";

function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}
function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}
function normalizePhone(p: string) {
  return p.replace(/\s+/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, phone, password } = await req.json();

    if (!name || !username || !email || !phone || !password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const normUsername = normalizeUsername(username);
    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);

    // Basic validation
    if (!/^[a-z0-9_]{3,30}$/.test(normUsername)) {
      return new Response(
        JSON.stringify({ error: "Invalid username. Use 3-30 letters, numbers or _." }),
        { status: 400 }
      );
    }

    if (!/^\+?\d{8,15}$/.test(normPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone. Use digits, 8-15 chars, optional leading +." }),
        { status: 400 }
      );
    }

    const { db } = await connect();

    // Check for existing conflicts
    const existing = await db.collection("users").findOne({
      $or: [{ email: normEmail }, { username: normUsername }, { phone: normPhone }],
    });

    if (existing) {
      if (existing.email === normEmail) {
        return new Response(JSON.stringify({ error: "Email already in use", field: "email" }), { status: 409 });
      }
      if (existing.username === normUsername) {
        return new Response(JSON.stringify({ error: "Username already taken", field: "username" }), { status: 409 });
      }
      if (existing.phone === normPhone) {
        return new Response(JSON.stringify({ error: "Phone number already registered", field: "phone" }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: "Conflict" }), { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    const insertRes = await db.collection("users").insertOne({
      name,
      username: normUsername,
      email: normEmail,
      phone: normPhone,
      passwordHash,
      verified: false,
      otp,
      otpExpiresAt,
      createdAt: now,
    });

    // Send verification email
    try {
      const mailRes = await fetch("https://mail.devxjin.site/mail/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail, name, otp }),
      });

      if (!mailRes.ok) {
        const text = await mailRes.text();
        console.error("Mail API error:", text);
      }
    } catch (mailErr) {
      console.error("Mail fetch failed:", mailErr);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "OTP sent. Please verify your email.",
        userId: insertRes.insertedId.toString(),
        otpExpiresAt, // optional, frontend can know expiry
      }),
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);

    // Handle duplicate-key race-case
    if (err?.code === 11000 && err?.keyValue) {
      const key = Object.keys(err.keyValue)[0];
      return new Response(JSON.stringify({ error: `${key} already in use`, field: key }), { status: 409 });
    }

    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
