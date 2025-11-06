// app/api/keys/my/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

function getToken(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(^|;\s*)token=([^;]+)/);
  return match ? match[2] : null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return new Response(JSON.stringify({ keys: [] }), { status: 200 });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;
    const { db } = await connect();
    const keys = await db.collection("apikeys").find({ ownerId: new (require("mongodb").ObjectId)(userId) }).toArray();
    return new Response(JSON.stringify({ keys }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ keys: [] }), { status: 200 });
  }
}
