import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import connect from "@/lib/mongo";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

function getTokenFromReq(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

export async function GET(req: NextRequest) {
  const token = getTokenFromReq(req);
  if (!token)
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const { db } = await connect();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.sub) });

    if (!user)
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    // Exclude sensitive fields
    const safeUser = {
      _id: user._id.toString(),
      name: user.name || "",
      username: user.username || "",
      email: user.email,
      phone: user.phone || "",
      verified: user.verified || false,
      createdAt: user.createdAt,
    };

    return new Response(JSON.stringify({ user: safeUser }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("JWT verify failed:", e);
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
