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
    // Debug: log that request reached API
    console.log("🚀 Register API called");

    let body: any;
    try {
      body = await req.json();
      console.log("📥 Received body:", body);
    } catch (jsonErr) {
      console.error("❌ Failed to parse JSON body:", jsonErr);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const { name, username, email, phone, password } = body;

    if (!name || !username || !email || !phone || !password) {
      console.warn("⚠️ Missing fields in request:", body);
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const normUsername = normalizeUsername(username);
    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);

    console.log("🔹 Normalized data:", { normUsername, normEmail, normPhone });

    // Basic validation
    if (!/^[a-z0-9_]{3,30}$/.test(normUsername)) {
      console.warn("⚠️ Invalid username:", normUsername);
      return new Response(
        JSON.stringify({ error: "Invalid username. Use 3-30 letters, numbers or _." }),
        { status: 400 }
      );
    }

    if (!/^\+?\d{8,15}$/.test(normPhone)) {
      console.warn("⚠️ Invalid phone:", normPhone);
      return new Response(
        JSON.stringify({ error: "Invalid phone. Use digits, 8-15 chars, optional leading +." }),
        { status: 400 }
      );
    }

    console.log("💾 Connecting to database...");
    const { db } = await connect();
    console.log("✅ Database connected");

    // Check for existing conflicts
    const existing = await db.collection("users").findOne({
      $or: [{ email: normEmail }, { username: normUsername }, { phone: normPhone }],
    });
    console.log("🔍 Existing user check result:", existing);

    if (existing) {
      if (existing.email === normEmail) {
        console.warn("⚠️ Email already in use:", normEmail);
        return new Response(JSON.stringify({ error: "Email already in use", field: "email" }), { status: 409 });
      }
      if (existing.username === normUsername) {
        console.warn("⚠️ Username already taken:", normUsername);
        return new Response(JSON.stringify({ error: "Username already taken", field: "username" }), { status: 409 });
      }
      if (existing.phone === normPhone) {
        console.warn("⚠️ Phone already registered:", normPhone);
        return new Response(JSON.stringify({ error: "Phone number already registered", field: "phone" }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: "Conflict" }), { status: 409 });
    }

    console.log("🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    console.log("💾 Inserting user...");
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
    console.log("✅ User inserted with ID:", insertRes.insertedId.toString());

    // Send verification email
    try {
      console.log("📧 Sending OTP email...");
      const mailRes = await fetch("https://mail.devxjin.site/mail/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail, name, otp }),
      });

      if (!mailRes.ok) {
        const text = await mailRes.text();
        console.error("❌ Mail API error:", text);
      } else {
        console.log("✅ OTP email sent successfully");
      }
    } catch (mailErr) {
      console.error("❌ Mail fetch failed:", mailErr);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "OTP sent. Please verify your email.",
        userId: insertRes.insertedId.toString(),
        otpExpiresAt,
      }),
      { status: 201 }
    );
  } catch (err: any) {
    console.error("🔥 Register error:", err);

    if (err?.code === 11000 && err?.keyValue) {
      const key = Object.keys(err.keyValue)[0];
      return new Response(JSON.stringify({ error: `${key} already in use`, field: key }), { status: 409 });
    }

    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
