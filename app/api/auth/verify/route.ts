import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { db } = await connect();
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ If already verified, stop here
    if (user.verified) {
      return new Response(
        JSON.stringify({ error: "Email already verified. Please login." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Validate OTP
    if (!user.otp || user.otp !== otp) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Ensure OTP expiry logic exists
    const now = new Date();
    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < now) {
      return new Response(JSON.stringify({ error: "OTP expired" }), {
        status: 410,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Mark verified and remove OTP fields
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { verified: true }, $unset: { otp: "", otpExpiresAt: "" } }
    );

    // ✅ Generate JWT token and login cookie
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 30
    }`;

    // ✅ Return success + user info
    return new Response(
      JSON.stringify({
        ok: true,
        message: "Email verified successfully!",
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          phone: user.phone,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Verification error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
