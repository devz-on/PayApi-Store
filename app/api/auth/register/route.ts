// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

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

    if (!name || !username || !email || !phone || !password)
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const normEmail = normalizeEmail(email);
    const normUsername = normalizeUsername(username);
    const normPhone = normalizePhone(phone);

    // basic validation
    if (!/^[a-z0-9_]{3,30}$/.test(normUsername))
      return new Response(JSON.stringify({ error: "Invalid username. Use 3-30 letters, numbers or _." }), { status: 400 });

    if (!/^\+?\d{8,15}$/.test(normPhone))
      return new Response(JSON.stringify({ error: "Invalid phone. Use digits, 8-15 chars, optional leading +'." }), { status: 400 });

    const { db } = await connect();

    // attempt to create unique indexes (no-op if already there). Wrap in try to avoid failing on duplicates.
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("users").createIndex({ username: 1 }, { unique: true });
      await db.collection("users").createIndex({ phone: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // ignore index creation errors in runtime (log for debug)
      console.warn("Index creation notice:", (e as any).message || e);
    }

    // check for existing conflicts
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

    const passwordHash = await bcrypt.hash(password, 10);
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
      createdAt: new Date(),
    });

    // send verification email (your SMTP config)
    const transporter = nodemailer.createTransport({
      host: "cp1.dnspark.in",
      port: 465,
      secure: true,
      auth: {
        user: "support@devxjin.site",
        pass: process.env.MAIL_PASS!,
      },
    });

    try {
      await transporter.sendMail({
        from: '"DevxJin Support" <support@devxjin.site>',
        to: normEmail,
        subject: "Verify your email - DevxJin",
        html: `<div style="font-family:sans-serif;text-align:center">
            <h2>Welcome to DevxJin, ${name}!</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing:4px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
           </div>`,
      });
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      // keep user created — you can decide to roll back here if you prefer
    }

    return new Response(JSON.stringify({ ok: true, message: "OTP sent. Please verify your email.", userId: insertRes.insertedId.toString() }), { status: 201 });
  } catch (err: any) {
    console.error("Register error:", err);

    // handle duplicate-key race-case (if index caught duplicate during insert)
    if (err?.code === 11000 && err?.keyValue) {
      const key = Object.keys(err.keyValue)[0];
      return new Response(JSON.stringify({ error: `${key} already in use`, field: key }), { status: 409 });
    }

    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
