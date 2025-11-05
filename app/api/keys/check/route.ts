// app/api/keys/check/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const key = params.get("key");
  if (!key) return new Response(JSON.stringify({ exists: false }), { status: 400 });

  const { db } = await connect();
  const k = await db.collection("pay_keys").findOne({ key });
  return new Response(JSON.stringify({ exists: !!k, key: k ? k.key : null }), { status: 200 });
}
